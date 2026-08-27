/**
 * 统一请求封装。页面和组件禁止直接 wx.request。
 * 成功时返回业务 data；HTTP 或业务 code 失败都走 reject。
 */
import { BASE_URL } from "../config/env";
import { DEVICE_HEADERS } from "../config/headers";
import { STORAGE_KEYS } from "../config/storage";

const TIMEOUT = 10000;
const SUCCESS_CODE = 200;
const UNAUTH_CODES = [401];

function buildHeader(extra = {}) {
  const header = {
    "content-type": "application/json",
    ...extra,
    ...DEVICE_HEADERS,
  };
  const token = wx.getStorageSync(STORAGE_KEYS.TOKEN);
  if (token && !header.Authorization) {
    header.Authorization = `Bearer ${token}`;
  }
  return header;
}

function handleAuthExpired() {
  wx.removeStorageSync(STORAGE_KEYS.TOKEN);
  const app = getApp();
  if (app && app.globalData) {
    app.globalData.isLoggedIn = false;
  }
}

function pickMessage(body, fallback) {
  if (!body || typeof body !== "object") return fallback;
  return body.msg || body.message || fallback;
}

export function request({ url, method = "GET", data, header = {} }) {
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
  console.log("[request] send", { method, url: fullUrl, data });

  return new Promise((resolve, reject) => {
    wx.request({
      url: fullUrl,
      method,
      data,
      timeout: TIMEOUT,
      header: buildHeader(header),
      success(res) {
        const { statusCode, data: body } = res;
        console.log("[request] recv", {
          method,
          url: fullUrl,
          statusCode,
          body,
        });
        const bizCode =
          body && typeof body === "object" ? Number(body.code) : NaN;

        if (statusCode === 401 || UNAUTH_CODES.includes(bizCode)) {
          handleAuthExpired();
          reject(new Error(pickMessage(body, "登录已失效")));
          return;
        }

        if (statusCode < 200 || statusCode >= 300) {
          reject(new Error(pickMessage(body, "请求失败")));
          return;
        }

        if (!Number.isNaN(bizCode) && bizCode !== SUCCESS_CODE) {
          reject(new Error(pickMessage(body, "请求失败")));
          return;
        }

        if (
          body &&
          typeof body === "object" &&
          Object.prototype.hasOwnProperty.call(body, "data")
        ) {
          resolve(body.data);
          return;
        }
        resolve(body);
      },
      fail(err) {
        console.log("[request] fail", { method, url: fullUrl, err });
        reject(new Error(err.errMsg || "网络异常"));
      },
    });
  });
}
