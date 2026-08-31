/**
 * 个人中心钱包卡：标题、余额、右侧图标（仅展示）
 *
 * 属性：
 * - title {String}
 * - amount {String} 已格式化余额，含币种
 */
Component({
  options: {
    multipleSlots: true,
    styleIsolation: "isolated",
  },
  properties: {
    title: { type: String, value: "Wallet" },
    amount: { type: String, value: "" },
  },
});
