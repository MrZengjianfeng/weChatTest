/**
 * 模块6：游戏三列格子
 * 只接收 gameLabelId：有值则请求游戏列表，为空则清空且不请求。
 * cover 有值用图，否则用 color + name 占位。
 *
 * properties:
 * - gameLabelId 游戏分类 id
 * 事件 select：{ id }
 *
 * 对外方法（由页面里层 scroll-view 转发）：
 * - refresh() 下拉刷新，重置到第 1 页
 * - loadMore() 上拉加载下一页；请求中再次上拉会被忽略
 */
import { getGames } from "../../services/api";

Component({
  options: {
    multipleSlots: true,
    styleIsolation: "isolated",
  },
  properties: {
    gameLabelId: { type: String, value: "" },
  },
  data: {
    gameList: [],
    page: 1,
    pageSize: 18,
    loadingMore: false,
    isRefreshing: false,
    oldCursor: null,
    hasMore: false,
    // 首屏先出骨架，避免 observer 跑起来前闪「暂无游戏」
    isLoading: true,
    // 与真实格子同一套 class，条数跟 pageSize 对齐
    skeletonList: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  observers: {
    gameLabelId(gameLabelId) {
      const nextId = gameLabelId ? String(gameLabelId) : "";
      // 同 id 再进 observer（初始化 / 父组件 setData 同值）不重置，避免冲掉已翻页数据
      if (this._watchedLabelId === nextId) return;
      this._watchedLabelId = nextId;

      if (!nextId) {
        this._resetAll({ isLoading: false });
        return;
      }
      // 换了分类：列表、分页、cursor、加载锁全部清空，再拉第一页
      this._resetAll({ isLoading: true });
      this._loadFirstPage(nextId, { showSkeleton: true });
    },
  },
  methods: {
    /** 作废进行中的请求，并清空列表 / 分页 / 加载态 */
    _resetAll({ isLoading = false } = {}) {
      this._loadSeq = (this._loadSeq || 0) + 1;
      this._loadingMoreLock = false;
      this.setData({
        gameList: [],
        page: 1,
        loadingMore: false,
        isRefreshing: false,
        oldCursor: null,
        hasMore: false,
        isLoading,
      });
    },

    resetData() {
      this._resetAll({ isLoading: false });
    },

    onTapItem(e) {
      const id = e.currentTarget.dataset.id;
      if (!id) return;
      this.triggerEvent("select", { id });
    },

    /** 下拉刷新：重置第 1 页，先保留当前列表避免闪空 */
    refresh() {
      const gameLabelId = this.data.gameLabelId;
      if (!gameLabelId || this.data.isLoading || this.data.isRefreshing) {
        return Promise.resolve();
      }
      this.setData({ isRefreshing: true });
      return this._loadFirstPage(gameLabelId, { showSkeleton: false });
    },

    /** 上拉加载更多；请求进行中直接忽略 */
    loadMore() {
      return this._loadMore();
    },

    async _loadFirstPage(gameLabelId, { showSkeleton = true } = {}) {
      this._loadingMoreLock = false;
      const seq = (this._loadSeq || 0) + 1;
      this._loadSeq = seq;
      const patch = {
        page: 1,
        oldCursor: null,
        hasMore: false,
        loadingMore: false,
      };
      if (showSkeleton) {
        patch.isLoading = true;
        patch.gameList = [];
        patch.isRefreshing = false;
      }
      this.setData(patch);
      try {
        const res = await getGames({
          page: 1,
          pageSize: this.data.pageSize,
          gameLabelId: Number(gameLabelId),
          cursor: null,
        });
        if (seq !== this._loadSeq) return;
        this.setData({
          gameList: res?.games || [],
          hasMore: res?.hasMore ?? false,
          oldCursor: res?.cursor ?? null,
          page: 1,
        });
      } catch (err) {
        if (seq !== this._loadSeq) return;
        wx.showToast({
          title: err.message || "加载失败，请稍后重试",
          icon: "none",
        });
      } finally {
        if (seq === this._loadSeq) {
          this.setData({
            isLoading: false,
            isRefreshing: false,
          });
        }
      }
    },

    async _loadMore() {
      const gameLabelId = this.data.gameLabelId;
      if (
        !gameLabelId ||
        this._loadingMoreLock ||
        this.data.loadingMore ||
        this.data.isLoading ||
        this.data.isRefreshing ||
        !this.data.hasMore
      ) {
        return;
      }
      this._loadingMoreLock = true;
      this.setData({ loadingMore: true });
      const page = this.data.page + 1;
      const seq = (this._loadSeq || 0) + 1;
      this._loadSeq = seq;
      try {
        const res = await getGames({
          page,
          pageSize: this.data.pageSize,
          gameLabelId: Number(gameLabelId),
          cursor: this.data.oldCursor,
        });
        if (seq !== this._loadSeq) return;
        this.setData({
          gameList: this.data.gameList.concat(res?.games || []),
          page,
          hasMore: res?.hasMore ?? false,
          oldCursor: res?.cursor ?? null,
        });
      } catch (err) {
        if (seq !== this._loadSeq) return;
        wx.showToast({
          title: err.message || "加载失败，请稍后重试",
          icon: "none",
        });
      } finally {
        this._loadingMoreLock = false;
        if (seq === this._loadSeq) {
          this.setData({ loadingMore: false });
        }
      }
    },
  },
});
