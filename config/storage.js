/**
 * 本地缓存 key 集中声明，禁止业务里散落魔法字符串。
 * TOKEN 仅作登录态标记，不要存密码或其它敏感明文。
 */
export const STORAGE_KEYS = {
  TOKEN: "auth_token",
};
