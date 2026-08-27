/**
 * 模块6：游戏三列格子
 * cover 有值用图，否则用 color + name 占位。
 *
 * properties:
 * - list 项 { id, name, cover, color }
 * - loading 为 true 时不展示「暂无游戏」，避免首屏闪空态
 * 事件 select：{ id }
 */
Component({
  options: {
    multipleSlots: true,
    styleIsolation: 'isolated',
  },
  properties: {
    list: { type: Array, value: [] },
    loading: { type: Boolean, value: false },
  },
  methods: {
    onTapItem(e) {
      const id = e.currentTarget.dataset.id
      if (!id) return
      this.triggerEvent('select', { id })
    },
  },
})
