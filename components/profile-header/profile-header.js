/**
 * 个人中心头部：头像、昵称、ID、客服入口（仅展示，不接复制/客服）
 *
 * 属性：
 * - avatar {String} 头像地址，空则用默认剪影
 * - name {String}
 * - userId {String} 展示用 ID 文案，不含 "ID:" 前缀
 */
Component({
  options: {
    multipleSlots: true,
    styleIsolation: "isolated",
  },
  properties: {
    avatar: { type: String, value: "/assets/icons/avatar-default.svg" },
    name: { type: String, value: "" },
    userId: { type: String, value: "" },
  },
});
