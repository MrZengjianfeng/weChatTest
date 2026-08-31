/**
 * 个人中心 VIP 金卡：等级、进度、权益格子（仅展示；权益超出宽度可横向滑动）
 *
 * 属性：
 * - level {String} 等级文案，如 GOLD
 * - currentText {String} 进度分子，已格式化
 * - targetText {String} 进度分母，已格式化
 * - progress {Number} 0–100，进度条宽度
 * - features {Array} { id, icon, title, value }
 */
Component({
  options: {
    multipleSlots: true,
    styleIsolation: "isolated",
  },
  properties: {
    level: { type: String, value: "GOLD" },
    currentText: { type: String, value: "" },
    targetText: { type: String, value: "" },
    progress: { type: Number, value: 0 },
    features: { type: Array, value: [] },
  },
});
