/**
 * 首页页面
 * 只做数据组装和路由跳转；7 个模块的 UI / 内部交互都在对应组件里。
 * 游戏列表由 game-grid 按 activeCategoryId 自行请求。
 */
import { getHomeFeed } from "../../services/home";
import { ROUTES } from "../../config/routes";

Page({
  data: {
    title: "",
    // 与 app.globalData.isLoggedIn 同步；决定是否展示底部登录条
    isLoggedIn: false,
    noticeText: "",
    banners: [],
    shortcuts: [],
    categories: [],
    activeCategoryId: "",
  },

  onLoad() {
    this._loadHome();
  },

  onShow() {
    // 从登录页返回时要能刷新登录态，所以放 onShow 且必须可重入
    const app = getApp();
    const isLoggedIn = !!(app && app.globalData && app.globalData.isLoggedIn);
    if (isLoggedIn !== this.data.isLoggedIn) {
      this.setData({ isLoggedIn });
    }
  },

  onShareAppMessage() {
    return {
      title: "Play & Win",
      path: ROUTES.INDEX,
    };
  },

  /** 轮播点击：未登录先去登录，后续可按 id 跳活动页 */
  onSelectBanner(e) {
    const id = e.detail.id;
    if (!id) return;
    this._guardAuth();
  },

  onTapSearch() {
    wx.navigateTo({ url: ROUTES.SEARCH });
  },

  /** 快捷入口：未登录拦截；具体业务页尚未接入 */
  onSelectShortcut(e) {
    const id = e.detail.id;
    if (!id) return;
    if (!this._guardAuth()) return;
    wx.showToast({ title: "即将开放", icon: "none" });
  },

  /** 分类切换：只改当前高亮，格子由 game-grid 按 id 重新请求 */
  onChangeCategory(e) {
    const id = e.detail.id != null ? String(e.detail.id) : "";
    if (!id || id === this.data.activeCategoryId) return;
    this.setData({ activeCategoryId: id });
  },

  onSelectGame(e) {
    const id = e.detail.id;
    if (!id) return;
    if (!this._guardAuth()) return;
    wx.showToast({ title: "即将开放", icon: "none" });
  },

  onTapLogin() {
    wx.navigateTo({ url: ROUTES.LOGIN });
  },

  onTapRegister() {
    wx.navigateTo({ url: ROUTES.REGISTER });
  },

  async _loadHome() {
    try {
      const feed = await getHomeFeed();
      const categories = feed.categories || [];
      const activeCategoryId =
        this.data.activeCategoryId || (categories[0] && categories[0].id) || "";
      this.setData({
        noticeText: feed.noticeText,
        banners: feed.banners,
        shortcuts: feed.shortcuts,
        categories,
        activeCategoryId,
      });
    } catch (err) {
      wx.showToast({
        title: err.message || "加载失败，请稍后重试",
        icon: "none",
      });
    }
  },

  /** 未登录统一去登录页；已登录返回 true 让调用方继续 */
  _guardAuth() {
    if (this.data.isLoggedIn) return true;
    wx.navigateTo({ url: ROUTES.LOGIN });
    return false;
  },
});
