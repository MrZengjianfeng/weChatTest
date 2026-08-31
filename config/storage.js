/**
 * 本地缓存 key 集中声明，禁止业务里散落魔法字符串。
 * TOKEN 由 utils/auth 读写；request 发请求时自动带上，不要存密码。
 */
export const STORAGE_KEYS = {
  TOKEN: "auth_token",
};
