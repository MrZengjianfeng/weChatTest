/**
 * 登录后底部 Tab 切换。不用系统 tabBar：中间转盘要凸出，且未登录不能出现。
 * Tab 根页（含转盘）用 reLaunch，避免 navigateTo 把 Tab 叠在栈里。
 */
import { ROUTES } from "../config/routes";

export const TAB_HOME = "home";
export const TAB_PROMO = "promo";
export const TAB_WHEEL = "wheel";
export const TAB_INVITE = "invite";
export const TAB_PROFILE = "profile";

const TAB_URLS = {
  [TAB_HOME]: ROUTES.INDEX,
  [TAB_PROMO]: ROUTES.PROMO,
  [TAB_WHEEL]: ROUTES.LUCKY_WHEEL,
  [TAB_INVITE]: ROUTES.INVITE,
  [TAB_PROFILE]: ROUTES.PROFILE,
};

export function switchTabPage(id) {
  const url = TAB_URLS[id];
  if (!url) return;

  const pages = getCurrentPages();
  const current = pages.length ? pages[pages.length - 1] : null;
  const route = current && current.route ? `/${current.route}` : "";
  if (route === url) return;

  wx.reLaunch({ url });
}
