/**
 * 首页聚合数据
 * 轮播、分类来自 GET /api/v1/setting；公告、快捷入口暂用本地数据。
 *
 * 返回：
 * - noticeText 跑马灯文案
 * - banners[] { id, image, action }
 * - shortcuts[] { id, label, icon, theme, badge }
 * - categories[] { id, name, icon }  icon 为远程图地址
 */
import { getSetting } from "./api";

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
  const bannersList = mapBanners(setting?.carousels || []);
  const categoriesList = mapCategories(setting?.game_labels || []);

  return {
    noticeText: NOTICE_TEXT,
    banners: bannersList,
    shortcuts: SHORTCUTS,
    categories: categoriesList,
  };
}
