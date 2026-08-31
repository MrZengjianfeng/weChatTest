/**
 * 登录 token：登录成功写入，request 发请求时带上，401 时清掉。
 * 业务接口不要自己读 storage 再塞参，走 request 即可。
 */
import { STORAGE_KEYS } from "../config/storage";

export function getToken() {
  return wx.getStorageSync(STORAGE_KEYS.TOKEN) || "";
}

export function setToken(token) {
  const value = token == null ? "" : String(token);
  if (!value) {
    wx.removeStorageSync(STORAGE_KEYS.TOKEN);
    return;
  }
  wx.setStorageSync(STORAGE_KEYS.TOKEN, value);
}

export function clearToken() {
  wx.removeStorageSync(STORAGE_KEYS.TOKEN);
}

/**
 * 从登录接口返回里抽出 token。
 * 兼容顶层 / data / user，以及 token、access_token、accessToken。
 */
export function pickToken(result) {
  if (result == null || result === "") {
    return "";
  }
  if (typeof result === "string") {
    return result;
  }
  if (typeof result !== "object") {
    return "";
  }

  const from = (obj) => {
    if (!obj || typeof obj !== "object") {
      return "";
    }
    return obj.token || obj.access_token || obj.accessToken || obj.auth_token || "";
  };

  return (
    from(result) ||
    from(result.data) ||
    from(result.user) ||
    from(result.data && result.data.user) ||
    ""
  );
}
