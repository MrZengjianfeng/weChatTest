/**
 * 模块2：首页轮播
 * swiper 铺满整块组件，指示点用自定义节点叠在图片底部。
 *
 * properties.list 项：{ id, image, action }
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
  data: {
    current: 0,
  },
  methods: {
    onChange(e) {
      this.setData({ current: e.detail.current })
    },
    onTapItem(e) {
      const id = e.currentTarget.dataset.id
      if (!id) return
      this.triggerEvent('select', { id })
    },
  },
})
