/**
 * 统一请求封装。页面和组件禁止直接 wx.request。
 * baseURL 按小程序 envVersion 切换，不要在业务代码里写死环境开关。
 */
const { miniProgram } = wx.getAccountInfoSync()
const envVersion = miniProgram.envVersion

const BASE_URL_MAP = {
  develop: 'https://dev.example.com',
  trial: 'https://trial.example.com',
  release: 'https://api.example.com',
}

const BASE_URL = BASE_URL_MAP[envVersion] || BASE_URL_MAP.release
const TIMEOUT = 10000

export function request({ url, method = 'GET', data, header = {} }) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: url.startsWith('http') ? url : `${BASE_URL}${url}`,
      method,
      data,
      timeout: TIMEOUT,
      header: {
        'content-type': 'application/json',
        ...header,
      },
      success(res) {
        const { statusCode, data: body } = res
        if (statusCode >= 200 && statusCode < 300) {
          resolve(body)
          return
        }
        reject(new Error((body && body.message) || '请求失败'))
      },
      fail(err) {
        reject(new Error(err.errMsg || '网络异常'))
      },
    })
  })
}
