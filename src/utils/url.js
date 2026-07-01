const WECHAT_APP_ID = 'wx7bcc7dbe93cc91e8'

export function buildWechatMiniProgramUrl(restaurantCode, tableCode) {
  const path = `package2/pages/table/index.html?restaurant_code=${restaurantCode.trim()}&table_code=${tableCode.trim()}`
  const encodedPath = encodeURIComponent(path)
  return `https://open.weixin.qq.com/sns/getexpappinfo?appid=${WECHAT_APP_ID}&path=${encodedPath}#wechat-redirect`
}
