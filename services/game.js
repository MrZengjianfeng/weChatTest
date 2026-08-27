import { request } from "../utils/request";

const PLACEHOLDER_COLORS = [
  "#2BB0E8",
  "#F4C431",
  "#6B4DE6",
  "#4CAF50",
  "#E91E63",
  "#FF7043",
];

/**
 * 游戏列表 GET /api/v1/games
 * 入参：game_label_id
 */
export function getGames(params) {
  return request({
    url: "/api/v1/games",
    method: "POST",
    data: params,
  });
}

function pickList(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  if (Array.isArray(payload.list)) return payload.list;
  if (Array.isArray(payload.games)) return payload.games;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.records)) return payload.records;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

/** 把接口项收成格子用的 { id, name, cover, color } */
export function mapGameList(payload) {
  return pickList(payload)
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const id = item.id != null ? String(item.id) : "";
      if (!id) return null;
      return {
        id,
        name: item.name || item.title || item.game_name || "",
        cover:
          item.cover ||
          item.icon ||
          item.image ||
          item.image_url ||
          item.thumb ||
          "",
        color:
          item.color || PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length],
      };
    })
    .filter(Boolean);
}
