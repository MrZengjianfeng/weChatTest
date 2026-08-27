/**
 * 首页聚合数据
 * 轮播、分类来自 GET /api/v1/setting；公告、快捷入口、游戏列表暂用本地数据。
 *
 * 返回：
 * - noticeText 跑马灯文案
 * - banners[] { id, image, action }
 * - shortcuts[] { id, label, icon, theme, badge }
 * - categories[] { id, name, icon }  icon 为远程图地址
 * - games[] { id, name, categoryId, cover, color }  cover 空则格子走色块占位
 */
import { getSetting } from "./setting";

const NOTICE_TEXT =
  "Welcome Bonus: Deposit PKR 500 get PKR 1,500 FREE · New Slots Added..";

const SHORTCUTS = [
  {
    id: "inbox",
    label: "INBOX",
    icon: "/assets/images/tab/inbox.png",
    theme: "inbox",
    badge: 2,
  },
  {
    id: "vip",
    label: "VIP",
    icon: "/assets/images/tab/vip.png",
    theme: "vip",
    badge: 0,
  },
  {
    id: "wallet",
    label: "WALLET",
    icon: "/assets/images/tab/wallet.png",
    theme: "wallet",
    badge: 0,
  },
  {
    id: "bonus",
    label: "BONUS",
    icon: "/assets/images/tab/bouns.png",
    theme: "bonus",
    badge: 0,
  },
  {
    id: "record",
    label: "RECORD",
    icon: "/assets/images/tab/record.png",
    theme: "record",
    badge: 0,
  },
];

const GAMES = [
  {
    id: "game-bubble",
    name: "Bubble",
    categoryId: "hot",
    cover: "",
    color: "#2BB0E8",
  },
  {
    id: "game-2048",
    name: "2048",
    categoryId: "hot",
    cover: "",
    color: "#F4C431",
  },
  {
    id: "game-wizard",
    name: "Wizard",
    categoryId: "slots",
    cover: "",
    color: "#6B4DE6",
  },
  {
    id: "game-tank",
    name: "Tank",
    categoryId: "hot",
    cover: "",
    color: "#4CAF50",
  },
  {
    id: "game-gates",
    name: "Gates",
    categoryId: "slots",
    cover: "",
    color: "#E91E63",
  },
  {
    id: "game-fruit",
    name: "Fruit",
    categoryId: "slots",
    cover: "",
    color: "#FF7043",
  },
  {
    id: "game-poker",
    name: "Poker",
    categoryId: "card",
    cover: "",
    color: "#1E88E5",
  },
  {
    id: "game-teen",
    name: "Teen Patti",
    categoryId: "card",
    cover: "",
    color: "#8D6E63",
  },
  {
    id: "game-roulette",
    name: "Roulette",
    categoryId: "table",
    cover: "",
    color: "#C62828",
  },
  {
    id: "game-bingo",
    name: "Bingo",
    categoryId: "table",
    cover: "",
    color: "#00897B",
  },
  {
    id: "game-chain",
    name: "Crypto Win",
    categoryId: "blockchain",
    cover: "",
    color: "#F9A825",
  },
  {
    id: "game-fish",
    name: "Fish Hunt",
    categoryId: "fish",
    cover: "",
    color: "#0277BD",
  },
];

function mapBanners(carousels) {
  return (carousels || []).map((item, index) => ({
    id: `banner-${index}`,
    image: item.image_url || "",
    action: item.action || "",
  }));
}

function mapCategories(labels) {
  return (labels || []).map((item) => ({
    id: String(item.id),
    name: item.label_name || "",
    icon: item.icon || "",
  }));
}

export async function getHomeFeed() {
  const setting = await getSetting();
  console.log("setting", setting);
  const bannersList = mapBanners(setting?.carousels || []);
  const categoriesList = mapCategories(setting?.game_labels || []);

  return {
    noticeText: NOTICE_TEXT,
    banners: bannersList,
    shortcuts: SHORTCUTS,
    categories: categoriesList,
    games: GAMES,
  };
}
