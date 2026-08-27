/**
 * 首页页面
 * 只做数据组装、分类过滤和路由跳转；7 个模块的 UI / 内部交互都在对应组件里。
 */
import { getHomeFeed } from "../../services/home";
import { ROUTES } from "../../config/routes";

Page({
  data: {
    title: "",
    isLoading: false,
    // 与 app.globalData.isLoggedIn 同步；决定是否展示底部登录条
    isLoggedIn: false,
    noticeText: "",
    banners: [],
    shortcuts: [],
    categories: [],
    // 全量游戏；displayGames 才是格子里真正渲染的列表
    games: [],
    displayGames: [],
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

  /** 分类切换：只改当前高亮和格子数据，横滑状态留在 category-tabs 内部 */
  onChangeCategory(e) {
    const id = e.detail.id != null ? String(e.detail.id) : "";
    if (!id || id === this.data.activeCategoryId) return;
    this.setData({
      activeCategoryId: id,
      displayGames: this._filterGames(this.data.games, id),
    });
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
    this.setData({ isLoading: true });
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
        games: feed.games,
        activeCategoryId,
        displayGames: this._filterGames(
          feed.games,
          activeCategoryId,
          categories,
        ),
      });
    } catch (err) {
      wx.showToast({
        title: err.message || "加载失败，请稍后重试",
        icon: "none",
      });
    } finally {
      this.setData({ isLoading: false });
    }
  },

  /**
   * Hot：展示全部（首页主推）
   * Played：暂无玩过记录，给空列表走空态
   * 其它：按分类英文名对上本地 games.categoryId；对不上则空列表
   */
  _filterGames(games, categoryId, categories) {
    const list = games || [];
    const source = categories || this.data.categories || [];
    const current = source.find(
      (item) => String(item.id) === String(categoryId),
    );
    const nameKey = ((current && current.name) || categoryId || "")
      .replace(/[^a-zA-Z]/g, "")
      .toLowerCase();
    if (!nameKey || nameKey === "hot") {
      return list.slice();
    }
    if (nameKey === "played") {
      return [];
    }
    return list.filter((item) => item.categoryId === nameKey);
  },

  /** 未登录统一去登录页；已登录返回 true 让调用方继续 */
  _guardAuth() {
    if (this.data.isLoggedIn) return true;
    wx.navigateTo({ url: ROUTES.LOGIN });
    return false;
  },
});
