/**
 * 首页登录底栏弹窗
 * 只做密码 / 验证码两种表单切换，不请求登录接口。
 *
 * properties: visible
 * 事件 close：无 detail；点遮罩或返回时抛出，显隐由页面改 visible。
 */
Component({
  options: {
    multipleSlots: true,
    styleIsolation: "isolated",
  },
  properties: {
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
    /** false：密码登录；true：短信验证码登录 */
    isCodeLogin: false,
    isPasswordVisible: false,
    phone: "",
    password: "",
    smsCode: "",
  },
  methods: {
    onTapClose() {
      this.triggerEvent("close");
    },

    /** 挡住底层首页滚动穿透 */
    onPreventMove() {},

    onTapSwitchMode() {
      this.setData({
        isCodeLogin: !this.data.isCodeLogin,
        isPasswordVisible: false,
      });
    },

    onTapTogglePassword() {
      this.setData({
        isPasswordVisible: !this.data.isPasswordVisible,
      });
    },

    onInputPhone(e) {
      this.setData({ phone: e.detail.value });
    },

    onInputPassword(e) {
      this.setData({ password: e.detail.value });
    },

    onInputCode(e) {
      this.setData({ smsCode: e.detail.value });
    },

    _resetForm() {
      this.setData({
        isCodeLogin: false,
        isPasswordVisible: false,
        phone: "",
        password: "",
        smsCode: "",
      });
    },
  },
});
