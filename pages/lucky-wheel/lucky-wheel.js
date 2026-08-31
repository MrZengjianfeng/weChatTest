/** 转盘占位页：登录后底部 Tab 中间转盘，切页同 Invite / Profile */
import { ROUTES } from "../../config/routes";
import { userStore } from "../../stores/user";

Page({
  data: {
    title: "Lucky Wheel",
  },

  onShow() {
    this._ensureLoggedIn();
  },

  _ensureLoggedIn() {
    if (userStore.isLoggedIn) return;
    wx.reLaunch({ url: ROUTES.INDEX });
  },
});
