/**
 * 模块7：未登录底栏
 * 不读登录态、不跳页面；由父级 wx:if 控制显隐，login / register 交给页面。
 *
 * 事件 login、register：无 detail
 */
Component({
  options: {
    multipleSlots: true,
    styleIsolation: 'isolated',
  },
  methods: {
    onTapLogin() {
      this.triggerEvent('login')
    },
    onTapRegister() {
      this.triggerEvent('register')
    },
  },
})
