/** 个人中心：登录后底部 Tab Profile。菜单项暂不跳转；退出登录会清 token 回首页。 */
import { ROUTES } from "../../config/routes";
import { userStore } from "../../stores/user";

Page({
  data: {
    avatar: "/assets/icons/avatar-default.svg",
    name: "Ahmed Karimi",
    userId: "PKR-40291836",
    vipLevel: "GOLD",
    vipCurrentText: "2,400",
    vipTargetText: "3,800",
    vipProgress: 63,
    vipFeatures: [
      {
        id: "cashback",
        icon: "/assets/icons/cashback.svg",
        title: "Cashback",
        value: "3/100m",
      },
      {
        id: "refund",
        icon: "/assets/icons/refund.svg",
        title: "Refund",
        value: "5x/day",
      },
      {
        id: "refund-limit",
        icon: "/assets/icons/refund-Limit.svg",
        title: "Refund Limit",
        value: "5x/day",
      },
      {
        id: "exclusive",
        icon: "/assets/icons/exclusive-vip.svg",
        title: "Exclusive Support",
        value: "24/7",
      },
    ],
    walletTitle: "Wallet",
    walletAmount: "KHR 1,200,000,000",
    menuList: [
      {
        id: "records",
        icon: "/assets/icons/record-a.svg",
        title: "Game Records",
      },
      {
        id: "account",
        icon: "/assets/icons/account.svg",
        title: "Account",
      },
      {
        id: "real-name",
        icon: "/assets/icons/real.svg",
        title: "Real-name Verification",
      },
      {
        id: "bank",
        icon: "/assets/icons/bank-a.svg",
        title: "Bank Account",
      },
      {
        id: "security",
        icon: "/assets/icons/lock-a.svg",
        title: "Security Center",
        hasSocials: true,
        socials: [
          { id: "whatsapp", icon: "/assets/icons/wahtsapp.svg" },
          { id: "facebook", icon: "/assets/icons/facebook.svg" },
          { id: "google", icon: "/assets/icons/google.svg" },
        ],
      },
      {
        id: "download",
        icon: "/assets/icons/download.svg",
        title: "Download Apk",
      },
      {
        id: "about",
        icon: "/assets/icons/about.svg",
        title: "About Us",
        extra: "1.0.0",
      },
    ],
  },

  onShow() {
    this._ensureLoggedIn();
  },

  onTapLogout() {
    if (this._isLoggingOut) return;
    this._isLoggingOut = true;
    userStore.logout();
    wx.reLaunch({ url: ROUTES.INDEX });
  },

  _ensureLoggedIn() {
    if (userStore.isLoggedIn) return;
    wx.reLaunch({ url: ROUTES.INDEX });
  },
});
