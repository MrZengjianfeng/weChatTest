/**
 * 统一请求封装。页面和组件禁止直接 wx.request。
 * 成功时返回业务 data；HTTP 或业务 code 失败都走 reject。
 * 本地有 token 时自动写入 Authorization / token 头，业务接口不用再传。
 */
import { BASE_URL } from "../config/env";
import { DEVICE_HEADERS } from "../config/headers";
import { clearToken, getToken, pickToken } from "./auth";

const TIMEOUT = 10000;
const SUCCESS_CODE = 200;
const UNAUTH_CODES = [401];

function buildHeader(extra = {}) {
  const header = {
    "content-type": "application/json",
    accept: "application/json",
    ...extra,
    ...DEVICE_HEADERS,
  };
  const token = getToken();
  if (token) {
    header.Authorization = `${token}`;
  }
  return header;
}

function handleAuthExpired() {
  clearToken();
  const app = getApp();
  if (app && app.globalData) {
    app.globalData.isLoggedIn = false;
  }
}

/** token 若在信封层（body.token）而不在 data 里，合并进对象 payload，方便登录后落库 */
function unwrapData(body) {
  const payload = body.data;
  const token = pickToken(body);
  if (
    token &&
    payload &&
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    !pickToken(payload)
  ) {
    return { ...payload, token };
  }
  return payload;
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
          resolve(unwrapData(body));
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
