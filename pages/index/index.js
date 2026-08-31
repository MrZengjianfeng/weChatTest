/**
 * 首页（pages/index）
 *
 * 职责：组装首屏数据、同步登录态、把点击转成路由。7 个模块的 UI 和内部交互都在组件里。
 *
 * 数据流：
 * 1. onLoad → _loadHome → getHomeFeed()（services/home）
 *    - 公告文案、快捷入口目前是 service 内本地常量
 *    - 轮播、分类来自 GET /api/v1/setting（carousels / game_labels）
 * 2. 分类高亮 activeCategoryId 交给 game-grid 的 game-label-id
 *    - 格子自己请求 GET /api/v1/games，页面不持有游戏列表
 * 3. onShow 每次可见都读 app.globalData.isLoggedIn
 *    - 从登录/注册返回时收起底部 auth-bar，且必须可重入
 *
 * 模块与事件（WXML 编号对应）：
 * 1 notice-marquee   只展示 noticeText，无事件
 * 2 banner-swiper    select → { id } → onSelectBanner
 * 3 search-entry     search → onTapSearch → ROUTES.SEARCH
 * 4 shortcut-entry   select → { id } → onSelectShortcut
 * 5 category-tabs    change → { id } → onChangeCategory（受控）
 * 6 game-grid        select → { id } → onSelectGame
 *                    下拉刷新 / 上拉翻页由里层 scroll-view 转发 refresh / loadMore
 * 7 auth-bar         login → 打开 login-sheet；register → 注册页
 *   login-sheet      close → 收起弹窗并同步 isLoggedIn；密码 / 验证码 / 发码 / 登录在组件内
 *
 * 鉴权：轮播、快捷入口、游戏点击走 _guardAuth；未登录打开登录弹窗。
 * 搜索、分类切换不拦登录。
 *
 * 滚动：真实内容用 scroll-view type="nested"。
 * 轮播/搜索/入口在 header 里滚走；分类条在 body 顶，滚完后贴在跑马灯下。
 * game-grid 视口高度 = 屏幕 − 导航 − 跑马灯 − 分类条，多出来的格子在里层滚。
 * 里层 list 开 refresher 和下拉触底：刷新重置第 1 页，触底按页加载。
 */
import { getHomeFeed } from "../../services/home";
import { ROUTES } from "../../config/routes";

Page({
  data: {
    /** 自定义导航标题；首页用空字符串，品牌色写在 WXML 的 navigation-bar 上 */
    title: "",
    /**
     * 首屏骨架开关。true 时 WXML 渲染骨架，不挂真实组件，避免空轮播/空分类闪一帧。
     * _loadHome 的 finally 里关掉；失败也会关，让用户看到空模块而不是一直转圈。
     */
    isLoading: true,
    /**
     * 与 app.globalData.isLoggedIn 对齐（onLaunch 按本地 token 初始化）。
     * false：展示 auth-bar，home-body 加 home--unauth 给底栏留滚动空隙。
     * 真正鉴权以后端为准；这里只决定首页 UI。
     */
    isLoggedIn: false,
    /** 跑马灯全文，组件内循环滚动；空字符串时组件仍占位 */
    noticeText: "",
    /** 轮播项 { id, image, action }；id 目前是 service 里按索引生成的 banner-${index} */
    banners: [],
    /** 快捷入口 { id, label, icon, theme, badge }；业务页未接时点击 toast「即将开放」 */
    shortcuts: [],
    /** 分类胶囊 { id, name, icon }；id 必须是字符串，和 game-grid 的 gameLabelId 同一套 */
    categories: [],
    /**
     * 当前分类 id（受控）。空则 game-grid 清空且不请求。
     * 首次加载：沿用已有值，否则用 categories[0].id。
     * 切换只改这一项，不要在页面里再拉游戏列表。
     */
    activeCategoryId: "",
    /**
     * nested-scroll-body 高度（px）= 窗口 − 导航 − 跑马灯，即 .scrollarea 可视高度。
     * 分类条吸顶后贴在这块顶部。
     */
    pinnedHeight: 0,
    /**
     * game-grid 视口高度（px）= pinnedHeight − 分类条 88rpx。
     * 也就是屏幕减去导航、跑马灯、吸顶条之后的剩余高度。
     */
    gridHeight: 0,
    /** 里层 scroll-view 下拉刷新动画开关，请求结束后必须关掉 */
    isGridRefreshing: false,
    /** 登录底栏弹窗显隐；点 Login 或未登录拦截时打开 */
    isLoginVisible: false,
  },

  onLoad() {
    this._updateGridMetrics();
    this._loadHome();
  },

  onReady() {
    this._updateGridMetrics();
  },

  onResize() {
    this._updateGridMetrics();
  },

  onShow() {
    // 登录成功写的是 globalData，首页可能一直没卸载，所以不能只靠 onLoad
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

  /**
   * 轮播点击。detail.id 为空直接忽略。
   * 活动落地页尚未接入，目前只做登录拦截。
   */
  onSelectBanner(e) {
    const id = e.detail.id;
    if (!id) return;
    this._guardAuth();
  },

  /** 搜索入口不是输入框，整卡点击进搜索页；不要求登录 */
  onTapSearch() {
    wx.navigateTo({ url: ROUTES.SEARCH });
  },

  /**
   * 快捷入口。id 对应 inbox / vip / wallet / bonus / record。
   * 对应业务页尚未注册，登录后 toast 占位。
   */
  onSelectShortcut(e) {
    const id = e.detail.id;
    if (!id) return;
    if (!this._guardAuth()) return;
    wx.showToast({ title: "即将开放", icon: "none" });
  },

  /**
   * 分类胶囊 change。id 转成字符串，和接口、game-grid 对齐。
   * 与当前高亮相同则忽略，避免无意义 setData 触发格子重请求。
   */
  onChangeCategory(e) {
    const id = e.detail.id != null ? String(e.detail.id) : "";
    if (!id || id === this.data.activeCategoryId) return;
    this.setData({ activeCategoryId: id });
  },

  /**
   * 游戏格子下拉刷新。列表重置第 1 页，请求在 game-grid 内完成。
   */
  async onGridRefresh() {
    this.setData({ isGridRefreshing: true });
    const grid = this.selectComponent("#game-grid");
    try {
      if (grid && typeof grid.refresh === "function") {
        await grid.refresh();
      }
    } finally {
      // 同一事件循环里立刻关掉 refresher 时，部分基础库动画收不回去
      wx.nextTick(() => {
        this.setData({ isGridRefreshing: false });
      });
    }
  },

  /**
   * 游戏格子上拉加载更多。请求进行中组件内部会忽略重复触发。
   */
  onGridLoadMore() {
    const grid = this.selectComponent("#game-grid");
    if (grid && typeof grid.loadMore === "function") {
      grid.loadMore();
    }
  },

  /**
   * 游戏格子点击。游戏详情尚未接入，登录后 toast 占位。
   */
  onSelectGame(e) {
    const id = e.detail.id;
    if (!id) return;
    if (!this._guardAuth()) return;
    wx.showToast({ title: "即将开放", icon: "none" });
  },

  onTapLogin() {
    this.setData({ isLoginVisible: true });
  },

  onCloseLogin() {
    const app = getApp();
    const isLoggedIn = !!(app && app.globalData && app.globalData.isLoggedIn);
    this.setData({
      isLoginVisible: false,
      isLoggedIn,
    });
  },

  onTapRegister() {
    wx.navigateTo({ url: ROUTES.REGISTER });
  },

  /**
   * 拉首屏聚合数据。每次进入都先骨架，成功后再灌 5 组字段。
   * activeCategoryId：用户已点过分类则保留，否则用接口返回的第一项。
   * 失败只 toast，不把 isLoading 卡在 true（finally 会关掉）。
   */
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
        activeCategoryId,
      });
    } catch (err) {
      wx.showToast({
        title: err.message || "加载失败，请稍后重试",
        icon: "none",
      });
    } finally {
      this.setData({ isLoading: false }, () => {
        this._updateGridMetrics();
      });
    }
  },

  /**
   * 分类条吸顶后，游戏格子要铺满剩余屏幕。
   * 先按窗口估算，再量 .scrollarea，避免导航/胶囊高度写死。
   */
  _updateGridMetrics() {
    const tabsHeight = this._rpxToPx(88);
    const estimated = this._estimatePinnedHeight();
    if (estimated > 0 && !this.data.pinnedHeight) {
      this.setData({
        pinnedHeight: estimated,
        gridHeight: Math.max(estimated - tabsHeight, 0),
      });
    }
    this.createSelectorQuery()
      .select(".scrollarea")
      .boundingClientRect((rect) => {
        if (!rect || !rect.height) return;
        const pinnedHeight = Math.round(rect.height);
        const gridHeight = Math.max(pinnedHeight - tabsHeight, 0);
        if (
          pinnedHeight === this.data.pinnedHeight &&
          gridHeight === this.data.gridHeight
        ) {
          return;
        }
        this.setData({ pinnedHeight, gridHeight });
      })
      .exec();
  },

  /** .scrollarea = 窗口高度 − 自定义导航 − 跑马灯 64rpx */
  _estimatePinnedHeight() {
    const windowInfo = wx.getWindowInfo() || {};
    const windowHeight = windowInfo.windowHeight || 0;
    const statusBarHeight = windowInfo.statusBarHeight || 0;
    const menu = wx.getMenuButtonBoundingClientRect() || {};
    const menuTop = menu.top || 0;
    const menuBottom = menu.bottom || 0;
    const navHeight = menuBottom + Math.max(menuTop - statusBarHeight, 0);
    const marqueeHeight = this._rpxToPx(64);
    return Math.max(Math.round(windowHeight - navHeight - marqueeHeight), 0);
  },

  _rpxToPx(rpx) {
    const windowWidth = (wx.getWindowInfo() || {}).windowWidth || 375;
    return Math.round((rpx * windowWidth) / 750);
  },

  /**
   * 需要登录才能继续的操作统一走这里。
   * 已登录返回 true；未登录打开登录弹窗并返回 false，调用方必须提前 return。
   */
  _guardAuth() {
    if (this.data.isLoggedIn) return true;
    this.setData({ isLoginVisible: true });
    return false;
  },
});
