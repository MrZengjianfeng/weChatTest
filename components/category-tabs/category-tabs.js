/**
 * 模块5：分类胶囊（受控）
 * 高亮由页面 activeId 决定；横向滑动交给 scroll-view，组件不维护滚动位置。
 *
 * properties:
 * - list 项 { id, name, icon }
 * - activeId 当前选中 id
 * 事件 change：{ id }
 */
Component({
  options: {
    multipleSlots: true,
    styleIsolation: 'isolated',
  },
  properties: {
    list: { type: Array, value: [] },
    activeId: { type: String, value: '' },
  },
  methods: {
    onTapItem(e) {
      const id = e.currentTarget.dataset.id
      if (!id || id === this.properties.activeId) return
      this.triggerEvent('change', { id })
    },
  },
})
