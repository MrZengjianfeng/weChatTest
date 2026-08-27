/** 搜索占位页：首页 search-entry 点进来；confirm 后暂无检索接口 */
Page({
  data: {
    title: 'Search',
  },

  onLoad() {},

  onConfirmSearch(e) {
    const keyword = (e.detail.value || '').trim()
    if (!keyword) {
      wx.showToast({ title: '请输入游戏名称', icon: 'none' })
      return
    }
    wx.showToast({ title: '即将开放', icon: 'none' })
  },
})
