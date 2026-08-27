/**
 * 模块6：游戏三列格子
 * 只接收 gameLabelId：有值则请求 GET /api/v1/games，为空则清空且不请求。
 * cover 有值用图，否则用 color + name 占位。
 *
 * properties:
 * - gameLabelId 游戏分类 id
 * 事件 select：{ id }
 */
import { getGames } from "../../services/game";

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
    oldCursor: null,
    hasMore: false,
    // 首屏先出骨架，避免 observer 跑起来前闪「暂无游戏」
    isLoading: true,
    // 与真实格子同一套 class，条数跟 pageSize 对齐
    skeletonList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
  },
  observers: {
    gameLabelId(gameLabelId) {
      if (!gameLabelId) {
        this.setData({
          gameList: [],
          isLoading: false,
          hasMore: false,
          oldCursor: null,
          page: 1,
        });
        return;
      }
      this._loadGames(gameLabelId);
    },
  },
  methods: {
    onTapItem(e) {
      const id = e.currentTarget.dataset.id;
      if (!id) return;
      this.triggerEvent("select", { id });
    },

    async _loadGames(gameLabelId) {
      const seq = (this._loadSeq || 0) + 1;
      this._loadSeq = seq;
      this.setData({
        isLoading: true,
        gameList: [],
        page: 1,
        oldCursor: null,
        hasMore: false,
      });
      const params = {
        page: 1,
        pageSize: this.data.pageSize,
        gameLabelId: Number(gameLabelId),
        cursor: null,
      };
      try {
        const res = await getGames(params);
        if (seq !== this._loadSeq) return;
        this.setData({
          gameList: res?.games || [],
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
        if (seq === this._loadSeq) {
          this.setData({ isLoading: false });
        }
      }
    },
  },
});
