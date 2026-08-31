/** 邀请占位页：登录后底部 Tab Invite */
import { ROUTES } from "../../config/routes";
import { userStore } from "../../stores/user";

Page({
  data: {
    title: "Invite",
  },

  onShow() {
    this._ensureLoggedIn();
  },

  _ensureLoggedIn() {
    if (userStore.isLoggedIn) return;
    wx.reLaunch({ url: ROUTES.INDEX });
  },
});
