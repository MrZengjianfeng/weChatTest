import { userStore } from '../../stores/user'

Page({
  data: {
    title: 'Login',
  },

  onLoad() {},

  /**
   * 账号能力未接入前的联调用：写入 token 并回首页。
   * userStore 会通知已绑定的页面（如首页）收起底部登录条。
   */
  onTapMockLogin() {
    userStore.loginSuccess('mock-token')
    wx.navigateBack()
  },
})
