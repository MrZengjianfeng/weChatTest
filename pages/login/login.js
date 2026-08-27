import { STORAGE_KEYS } from '../../config/storage'

Page({
  data: {
    title: 'Login',
  },

  onLoad() {},

  /**
   * 账号能力未接入前的联调用：写入 token 并回首页。
   * 首页 onShow 会读 globalData.isLoggedIn，从而收起底部登录条。
   */
  onTapMockLogin() {
    wx.setStorageSync(STORAGE_KEYS.TOKEN, 'mock-token')
    const app = getApp()
    if (app && app.globalData) {
      app.globalData.isLoggedIn = true
    }
    wx.navigateBack()
  },
})
