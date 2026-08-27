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
    isLoading: false,
  },
  observers: {
    gameLabelId(gameLabelId) {
      console.log("gameLabelId:", gameLabelId);
      if (gameLabelId) {
        this._loadGames(gameLabelId);
      }
    },
  },
  methods: {
    onTapItem(e) {
      const id = e.currentTarget.dataset.id;
      if (!id) return;
      this.triggerEvent("select", { id });
    },

    async _loadGames(gameLabelId) {
      this.setData({ isLoading: true });
      let params = {
        page: this.data.page,
        pageSize: this.data.pageSize,
        gameLabelId: Number(gameLabelId),
        cursor: this.data.oldCursor,
      };
      try {
        const res = await getGames(params);
        console.log("res", res);
        this.setData({
          gameList: res?.games || [],
          hasMore: res?.hasMore ?? false,
          oldCursor: res?.cursor ?? null,
          isLoading: false,
        });
      } catch (err) {
        console.log("err:", err);
      }
    },
  },
});
