import { getToken } from './utils/auth'

App({
  globalData: {
    // 首页 onShow 读这里决定是否展示登录条；真正鉴权以后端为准
    isLoggedIn: false,
  },
  onLaunch() {
    this.globalData.isLoggedIn = !!getToken()
  },
})
