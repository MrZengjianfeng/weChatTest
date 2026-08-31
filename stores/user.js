/**
 * 登录态。token 仍只走 utils/auth + storage，这里只持内存里的 isLoggedIn。
 * 页面用 createStoreBindings 订阅；写入口只走 loginSuccess / logout / setLoggedIn。
 */
import { observable, action } from "mobx-miniprogram";
import { clearToken, getToken, setToken } from "../utils/auth";

export const userStore = observable({
  isLoggedIn: !!getToken(),

  setLoggedIn: action(function (isLoggedIn) {
    this.isLoggedIn = !!isLoggedIn;
  }),

  loginSuccess: action(function (token) {
    setToken(token);
    this.isLoggedIn = true;
  }),

  logout: action(function () {
    clearToken();
    this.isLoggedIn = false;
  }),
});
