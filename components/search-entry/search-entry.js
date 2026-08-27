/**
 * 模块3：快速搜索入口
 * 首页只做展示和点击，真正输入在搜索页；组件内不跳路由。
 *
 * properties: placeholder、icon
 * 事件 search：无 detail
 */
Component({
  options: {
    multipleSlots: true,
    styleIsolation: 'isolated',
  },
  properties: {
    placeholder: { type: String, value: 'SEARCH GAMES' },
    icon: { type: String, value: '/assets/icons/search.svg' },
  },
  methods: {
    onTapSearch() {
      this.triggerEvent('search')
    },
  },
})
