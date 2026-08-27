import { STORAGE_KEYS } from './config/storage'

App({
  globalData: {
    // 首页 onShow 读这里决定是否展示登录条；真正鉴权以后端为准
    isLoggedIn: false,
  },
  onLaunch() {
    const token = wx.getStorageSync(STORAGE_KEYS.TOKEN)
    this.globalData.isLoggedIn = !!token
  },
})
