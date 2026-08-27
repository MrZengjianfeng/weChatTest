/**
 * 首页聚合数据
 * 目前无后端，返回本地 mock。接口就绪后改为 request({ url: '/home' })，字段保持不变。
 *
 * 返回：
 * - noticeText 跑马灯文案
 * - banners[] { id, image, action }
 * - shortcuts[] { id, label, icon, theme, badge }
 * - categories[] { id, name, icon }
 * - games[] { id, name, categoryId, cover, color }  cover 空则格子走色块占位
 */

const NOTICE_TEXT =
  "Welcome Bonus: Deposit PKR 500 get PKR 1,500 FREE · New Slots Added..";

const BANNERS = [
  {
    id: "1",
    image: "/assets/images/banner/1.jpg",
    action: "topup",
  },
  {
    id: "2",
    image: "/assets/images/banner/2.jpg",
    action: "bonus",
  },
  {
    id: "3",
    image: "/assets/images/banner/3.jpg",
    action: "slots",
  },
  {
    id: "4",
    image: "/assets/images/banner/4.jpg",
    action: "vip",
  },
  {
    id: "5",
    image: "/assets/images/banner/5.jpg",
    action: "wallet",
  },
];

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

const CATEGORIES = [
  { id: "hot", name: "HOT", icon: "🔥" },
  { id: "played", name: "played", icon: "" },
  { id: "table", name: "Table", icon: "" },
  { id: "card", name: "Card", icon: "" },
  { id: "blockchain", name: "BLOCKCHAIN", icon: "" },
  { id: "slots", name: "Slots", icon: "" },
  { id: "fish", name: "Fish", icon: "" },
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

export function getHomeFeed() {
  return Promise.resolve({
    noticeText: NOTICE_TEXT,
    banners: BANNERS,
    shortcuts: SHORTCUTS,
    categories: CATEGORIES,
    games: GAMES,
  });
}
