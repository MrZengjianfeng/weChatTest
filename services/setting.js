import { request } from "../utils/request";

/**
 * 站点配置 GET /api/v1/setting
 * 返回：region、game_labels、carousels、spin、invite、currency 等
 */
export function getSetting() {
  return request({
    url: "/api/v1/setting",
    method: "GET",
  });
}
