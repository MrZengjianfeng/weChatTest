import { request } from "../utils/request";

// 发送验证码
// phone: 手机号
export const sendSms = (params) => {
  return request({
    url: "/api/v1/sms/send",
    method: "POST",
    data: params,
  });
};

/**
 * 游戏列表 GET /api/v1/games
 * 入参：gameLabelId
 */
export function getGames(params) {
  return request({
    url: "/api/v1/games",
    method: "POST",
    data: params,
  });
}

/**
 * 站点配置 GET /api/v1/setting
 * 返回：region、game_labels、carousels、spin、invite、currency 等
 */
export function getSetting() {
  return request({
    url: "/api/v1/setting",
    method: "GET",
  });
}

// 用户登录
/**
 * 
 * @param {*} params 
 * @returns 
 * let params = {
      login_type: loginType,// "code" | "password"
      phone: values?.phone,
      verify_code: values?.code,
      invite_code: inviteCode,
      password: values.password,
      platform: "web",
      uuid,
      device_model: device_model,
      system_version: system_version,
      screen_size: `${screenWidth}x${screenHeight}`,
    };
 */
export const login = (params) => {
  return request({
    url: "/api/v1/login",
    method: "POST",
    data: params,
  });
};
