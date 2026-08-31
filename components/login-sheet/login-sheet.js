/**
 * 首页登录底栏弹窗（components/login-sheet）
 *
 * 职责：底栏登录表单。方式切换、输入、发验证码、登录请求都在组件内；
 * 显隐由页面的 visible 控制；关闭只抛 close，不自己改这个值。
 * 客服 / 忘记密码 / 用户协议只有 UI，跳转仍交给页面。
 *
 * 数据流：
 * 1. 页面把 isLoginVisible 绑到 visible；true 时 WXML 才渲染整块弹层。
 * 2. 手机号 / 密码 / 验证码、登录方式、密码明文只存在本组件 data，页面不持有表单。
 * 3. Send Code → 先校验手机号（空则红框、不 loading、不请求）。通过后按钮转圈（isSendingCode），
 *    再 sendSms({ phone })。成功失败都关掉转圈：成功开 60 秒倒计时（文案 Ns），失败仍显示 Send Code。
 *    定时器挂在实例 _smsTimer 上，不进 data；关闭弹窗和 detached 都要清掉。
 * 4. Login → login({ login_type: "code"|"password", phone, verify_code|password, 设备字段 })。
 *    手机号始终必填；验证码登录还要验证码，密码登录还要密码。缺项只红框、不请求；聚焦后去掉。
 *    设备字段目前用 DEVICE_HEADERS 的联调值（platform / uuid / device_model / system_version / screen_size）。
 *    没有邀请码入口，不传 invite_code。
 * 5. 登录成功：pickToken 抽出 token → userStore.loginSuccess（写本地 token + isLoggedIn）→ 抛 close。
 *    之后其它接口走 utils/request 会自动带 Authorization / token。拿不到 token 视为失败，弹窗不关。
 * 6. 点遮罩 / 面板外关闭 / 标题栏返回 / 登录成功 → close。
 *    页面把 visible 改回 false；isLoggedIn 由 store 绑定自动更新（收起 auth-bar）。
 * 7. visible 变 false：observer 调 _resetForm，下次打开回到验证码登录、空表单、无倒计时。
 *    不要在 onTapClose 里提前清：页面改 visible 会再走一遍 observer。
 * 8. 发码 / 登录请求回来时若弹窗已关，不再 Toast、写 token、开倒计时。
 *
 * properties：
 * - visible {Boolean} 默认 false。页面控制；组件不自己改这个值。
 *
 * 事件：
 * - close：无 detail。点遮罩、关闭按钮、返回键，以及登录成功写完 token 后抛出。
 *
 * 当前未接线（有 UI，无事件）：
 * 客服、忘记密码、用户协议。
 *
 * 滚动：根节点 catch:touchmove 空处理，挡住底层首页 nested 列表被拖动。
 */
import { sendSms, login } from "../../services/api";
import { DEVICE_HEADERS } from "../../config/headers";
import { pickToken } from "../../utils/auth";
import { userStore } from "../../stores/user";

/** 发码成功后的冷却秒数；与文案「Ns」一致 */
const SMS_COUNTDOWN_SECONDS = 60;

Component({
  options: {
    multipleSlots: true,
    styleIsolation: "isolated",
  },
  properties: {
    /**
     * 弹窗是否展示。false 时 WXML 用 wx:if 整块卸掉，避免隐藏层仍拦截点击。
     * 关闭时重置表单：否则下次打开会残留手机号 / 密码 / 验证码模式。
     */
    visible: {
      type: Boolean,
      value: false,
      observer(visible) {
        if (!visible) {
          this._resetForm();
        }
      },
    },
  },
  data: {
    /**
     * 登录方式。true：验证码登录（默认）；false：密码登录。
     * 关闭弹窗时会重置为 true，避免下次打开还停在密码。
     */
    isCodeLogin: true,
    /**
     * 密码是否明文。true 时 input 的 password 为 false，可看到输入内容。
     * 切到验证码模式时一并关掉，避免再切回密码时意外明文。
     */
    isPasswordVisible: false,
    /** 手机号，不含区号；区号 +92 写死在 WXML */
    phone: "",
    /** 密码明文，仅密码登录模式使用 */
    password: "",
    /** 验证码，仅验证码登录模式使用 */
    verifyCode: "",
    /** 手机号未填时点 Send Code / Login 为 true，输入框红框；聚焦后清掉 */
    isPhoneError: false,
    /** 密码登录点 Login 且密码为空时为 true；聚焦后清掉 */
    isPasswordError: false,
    /** 验证码登录点 Login 且验证码为空时为 true；聚焦后清掉 */
    isCodeError: false,
    /** 发送验证码进行中：按钮转圈，同时防止连点重复请求 */
    isSendingCode: false,
    /** 登录请求进行中，防止连点重复提交 */
    isLoggingIn: false,
    /** 发送成功后的剩余秒数；>0 时文案改为 Ns 且不可再点 */
    smsCountdown: 0,
  },
  lifetimes: {
    /** 组件从页面卸掉时清倒计时，避免 interval 在后台空转 */
    detached() {
      this._clearSmsCountdown();
    },
  },
  methods: {
    /** 遮罩、关闭按钮、返回键共用：只通知页面收起，不在组件内改 visible */
    onTapClose() {
      this.triggerEvent("close");
    },

    /**
     * 空函数。绑在根节点 catch:touchmove 上，吞掉触摸移动。
     * 不写的话，手指滑弹窗会带动首页 nested 列表（滚动穿透）。
     */
    onPreventMove() {},

    /**
     * 密码登录 ↔ 验证码登录。
     * 只翻转 isCodeLogin，不清空已填的手机号 / 密码 / 验证码，方便来回对比。
     * isPasswordVisible 关掉，避免切回密码时仍是明文。
     * 顺手清掉密码 / 验证码红框：切走再切回来时 wx:if 会重建输入行，残留 error 会闪红。
     */
    onTapSwitchMode() {
      this.setData({
        isCodeLogin: !this.data.isCodeLogin,
        isPasswordVisible: false,
        isPasswordError: false,
        isCodeError: false,
      });
    },

    /** 眼睛图标：切换密码明文 / 密文，只改 isPasswordVisible */
    onTapTogglePassword() {
      this.setData({
        isPasswordVisible: !this.data.isPasswordVisible,
      });
    },

    /** 只同步手机号；长度交给 maxlength，空号校验放在 Send Code / Login */
    onInputPhone(e) {
      this.setData({ phone: e.detail.value });
    },

    /** 手机号框获焦：清掉必填红框，方便重新输入 */
    onFocusPhone() {
      if (this.data.isPhoneError) {
        this.setData({ isPhoneError: false });
      }
    },

    /** 只同步密码明文；空密码校验放在 Login */
    onInputPassword(e) {
      this.setData({ password: e.detail.value });
    },

    /** 密码框获焦：清掉必填红框 */
    onFocusPassword() {
      if (this.data.isPasswordError) {
        this.setData({ isPasswordError: false });
      }
    },

    /** 只同步验证码；长度交给 maxlength，空码校验放在 Login */
    onInputCode(e) {
      this.setData({ verifyCode: e.detail.value });
    },

    /** 验证码框获焦：清掉必填红框 */
    onFocusCode() {
      if (this.data.isCodeError) {
        this.setData({ isCodeError: false });
      }
    },

    /**
     * 发送验证码。倒计时中或请求中直接忽略，避免连点。
     * 手机号必填：空则红框，不 loading、不请求。通过后先等按钮转圈画上，再发码。
     * 成功失败都关转圈：失败 Toast 并仍显示 Send Code；成功才开 60 秒倒计时。
     * 回来时若弹窗已关，不再 Toast / 开倒计时。
     */
    async onTapSendCode() {
      if (this.data.smsCountdown > 0 || this.data.isSendingCode) {
        return;
      }

      const phone = (this.data.phone || "").trim();
      if (!phone) {
        this.setData({ isPhoneError: true });
        return;
      }

      await new Promise((resolve) => {
        this.setData({ isSendingCode: true, isPhoneError: false }, resolve);
      });
      try {
        await sendSms({ phone });
        if (!this.properties.visible) {
          return;
        }
        wx.showToast({ title: "Code sent", icon: "none" });
        this._startSmsCountdown();
      } catch (err) {
        if (!this.properties.visible) {
          return;
        }
        wx.showToast({
          title: err.message || "Failed to send code",
          icon: "none",
        });
      } finally {
        if (this.properties.visible) {
          this.setData({ isSendingCode: false });
        }
      }
    },

    /**
     * 登录。请求中忽略连点。
     * 手机号始终必填；验证码登录还要验证码，密码登录还要密码。缺项一起标红、不请求。
     * 设备字段跟登录接口约定走 DEVICE_HEADERS 联调值。
     * 失败 Toast；成功必须落到 token，再写登录态并抛 close。弹窗已关则丢弃结果。
     */
    async onTapLogin() {
      if (this.data.isLoggingIn) {
        return;
      }

      const phone = (this.data.phone || "").trim();
      const password = (this.data.password || "").trim();
      const verifyCode = (this.data.verifyCode || "").trim();
      const isCodeLogin = this.data.isCodeLogin;
      const isPhoneError = !phone;
      const isPasswordError = !isCodeLogin && !password;
      const isCodeError = isCodeLogin && !verifyCode;

      if (isPhoneError || isPasswordError || isCodeError) {
        this.setData({ isPhoneError, isPasswordError, isCodeError });
        return;
      }

      const params = {
        login_type: isCodeLogin ? "code" : "password",
        phone,
        platform: "web",
        uuid: DEVICE_HEADERS["X-Device-UUID"],
        device_model: DEVICE_HEADERS["X-Device-Model"],
        system_version: DEVICE_HEADERS["X-System-Version"],
        screen_size: DEVICE_HEADERS["X-Screen-Size"],
      };
      if (isCodeLogin) {
        params.verify_code = verifyCode;
      } else {
        params.password = password;
      }

      this.setData({
        isLoggingIn: true,
        isPhoneError: false,
        isPasswordError: false,
        isCodeError: false,
      });
      try {
        const result = await login(params);
        if (!this.properties.visible) {
          return;
        }
        if (!this._persistSession(result)) {
          wx.showToast({ title: "Login failed", icon: "none" });
          return;
        }
        this.triggerEvent("close");
      } catch (err) {
        wx.showToast({ title: err.message || "Login failed", icon: "none" });
      } finally {
        this.setData({ isLoggingIn: false });
      }
    },

    /**
     * 从登录返回里抽出 token，交给 userStore.loginSuccess 写本地并打登录态。
     * 兼容 token / access_token，以及顶层、data、user。
     * 抽不出 token 返回 false，调用方当失败，避免「看起来已登录、后续接口没票」。
     */
    _persistSession(result) {
      const token = pickToken(result);
      if (!token) {
        return false;
      }
      userStore.loginSuccess(token);
      return true;
    },

    /** 先清旧 interval，再从 60 秒往下减；到 0 恢复 Send Code */
    _startSmsCountdown() {
      this._clearSmsCountdown();
      this.setData({ smsCountdown: SMS_COUNTDOWN_SECONDS });
      this._smsTimer = setInterval(() => {
        const next = this.data.smsCountdown - 1;
        if (next <= 0) {
          this._clearSmsCountdown();
          this.setData({ smsCountdown: 0 });
          return;
        }
        this.setData({ smsCountdown: next });
      }, 1000);
    },

    /** 清掉 _smsTimer。关弹窗、卸组件、倒计时结束、重新开倒计时都会走到这里 */
    _clearSmsCountdown() {
      if (this._smsTimer) {
        clearInterval(this._smsTimer);
        this._smsTimer = null;
      }
    },

    /**
     * 关闭时清空表单、红框、发送/登录锁，并清倒计时、回到验证码登录。
     * 由 visible observer 调用，不要在 onTapClose 里提前清：页面改 visible 会再走一遍 observer。
     */
    _resetForm() {
      this._clearSmsCountdown();
      this.setData({
        isCodeLogin: true,
        isPasswordVisible: false,
        phone: "",
        password: "",
        verifyCode: "",
        isPhoneError: false,
        isPasswordError: false,
        isCodeError: false,
        isSendingCode: false,
        isLoggingIn: false,
        smsCountdown: 0,
      });
    },
  },
});
