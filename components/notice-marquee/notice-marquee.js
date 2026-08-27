/**
 * 模块1：公告跑马灯
 * 文案复制两份做无缝横滑；无业务跳转。
 *
 * properties:
 * - text 公告原文
 * - icon 左侧喇叭图，默认同目录资源
 */
Component({
  options: {
    multipleSlots: true,
    styleIsolation: 'isolated',
  },
  properties: {
    text: { type: String, value: '' },
    icon: { type: String, value: '/assets/icons/horn.svg' },
  },
})
