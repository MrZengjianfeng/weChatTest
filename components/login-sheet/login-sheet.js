/**
 * 首页登录底栏弹窗（components/login-sheet）
 *
 * 职责：从底部弹出登录表单，做登录方式切换、本地输入、发送验证码、登录请求。
 * 显隐、跳客服 / 忘记密码都交给页面；本组件抛 close。
 *
 * 数据流：
 * 1. 页面把 isLoginVisible 绑到 visible；true 时 WXML 才渲染整块弹层。
 * 2. 用户在组件内改手机号、密码、验证码；切模式、看密码明文都只改本组件 data。
 * 3. 点 Send Code → 校验手机号后调 sendSms；空号给手机号框加红框，聚焦后去掉。
 *    发送成功后 60 秒倒计时，倒计时期间不能再发。
 * 4. 点 Login → 手机号必填；验证码登录还要验证码，密码登录还要密码。缺项红框，聚焦后去掉。
 *    校验通过后调 login；成功写 token / 登录态并抛 close，页面收起弹窗并藏 auth-bar。
 * 5. 点遮罩 / 面板外关闭按钮 / 标题栏返回 → triggerEvent('close')，页面把 visible 改回 false。
 * 6. visible 从 true 变 false 时 observer 调 _resetForm，下次打开回到验证码登录、空表单。
 *
 * properties：
 * - visible {Boolean} 默认 false。页面控制；组件不自己改这个值。
 *
 * 事件：
 * - close：无 detail。点遮罩、关闭按钮、返回键，以及登录成功后抛出。
 *
 * 当前未接线（有 UI，无事件）：
 * 客服、忘记密码、用户协议。等接口和路由就绪再接到页面。
 *
 * 滚动：根节点 catch:touchmove 空处理，挡住底层首页 nested 列表被拖动。
 */
import { sendSms, login } from "../../services/api";
import { DEVICE_HEADERS } from "../../config/headers";
import { pickToken, setToken } from "../../utils/auth";

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
    /** 发送验证码进行中，防止连点重复请求 */
    isSendingCode: false,
    /** 登录请求进行中，防止连点重复提交 */
    isLoggingIn: false,
    /** 发送成功后的剩余秒数；>0 时文案改为 Ns 且不可再点 */
    smsCountdown: 0,
  },
  lifetimes: {
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

    onInputPhone(e) {
      this.setData({ phone: e.detail.value });
    },

    /** 手机号框获焦：清掉必填红框，方便重新输入 */
    onFocusPhone() {
      if (this.data.isPhoneError) {
        this.setData({ isPhoneError: false });
      }
    },

    onInputPassword(e) {
      this.setData({ password: e.detail.value });
    },

    onFocusPassword() {
      if (this.data.isPasswordError) {
        this.setData({ isPasswordError: false });
      }
    },

    onInputCode(e) {
      this.setData({ verifyCode: e.detail.value });
    },

    onFocusCode() {
      if (this.data.isCodeError) {
        this.setData({ isCodeError: false });
      }
    },

    /**
     * 发送验证码。倒计时中直接忽略；手机号必填：空则红框，不发请求。
     * 请求失败用 Toast，不改输入框样式；成功才开 60 秒倒计时。
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

      this.setData({ isSendingCode: true, isPhoneError: false });
      try {
        await sendSms({ phone });
        if (!this.properties.visible) {
          return;
        }
        wx.showToast({ title: "Code sent", icon: "none" });
        this._startSmsCountdown();
      } catch (err) {
        wx.showToast({
          title: err.message || "Failed to send code",
          icon: "none",
        });
      } finally {
        this.setData({ isSendingCode: false });
      }
    },

    /**
     * 登录。手机号始终必填；验证码登录还要验证码，密码登录还要密码。
     * 缺项只标红框、不请求；失败 Toast；成功写登录态后抛 close。
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

    /** 把登录返回的 token 写入本地；之后所有走 request 的接口都会带上。没拿到 token 视为失败。 */
    _persistSession(result) {
      const token = pickToken(result);
      if (!token) {
        return false;
      }
      setToken(token);
      const app = getApp();
      if (app && app.globalData) {
        app.globalData.isLoggedIn = true;
      }
      return true;
    },

    /** 从 60 秒往下减，到 0 清定时器并恢复 Send Code */
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

    _clearSmsCountdown() {
      if (this._smsTimer) {
        clearInterval(this._smsTimer);
        this._smsTimer = null;
      }
    },

    /**
     * 关闭时清空全部表单字段，并回到验证码登录。
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
