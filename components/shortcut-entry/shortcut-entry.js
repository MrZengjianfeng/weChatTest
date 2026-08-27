/**
 * 模块4：快捷入口（INBOX / VIP / WALLET / BONUS / RECORD）
 *
 * properties.list 项：{ id, label, icon, badge }
 * badge 为 0 / 空则不显示红点
 * 事件 select：{ id }
 */
Component({
  options: {
    multipleSlots: true,
    styleIsolation: 'isolated',
  },
  properties: {
    list: { type: Array, value: [] },
  },
  methods: {
    onTapItem(e) {
      const id = e.currentTarget.dataset.id
      if (!id) return
      this.triggerEvent('select', { id })
    },
  },
})
