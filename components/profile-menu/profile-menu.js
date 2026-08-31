/**
 * 个人中心菜单列表（仅展示，不跳转）
 *
 * properties.list 项：
 * - id, icon, title
 * - extra {String} 右侧辅助文案，如版本号
 * - socials {Array} { id, icon } 安全中心前的社交图标
 */
Component({
  options: {
    multipleSlots: true,
    styleIsolation: "isolated",
  },
  properties: {
    list: { type: Array, value: [] },
  },
});
