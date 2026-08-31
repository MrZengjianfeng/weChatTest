/**
 * 登录后底部 TabBar（Home / Promo / 转盘 / Invite / Profile）
 *
 * 定位打在页面宿主上（见 app.wxss 的 tab-bar 选择器），组件 isolation 内部 position 出不来。
 * Tab（含中间转盘）在组件内 reLaunch（和导航栏返回一样，属于组件自身职责）。
 * 转盘上的时间只是静态文案，不倒数。
 *
 * 属性：
 * - active {String} home | promo | wheel | invite | profile
 *
 * 事件：change { id }
 */
import { switchTabPage } from "../../utils/tab";

const LEFT_TABS = [
  {
    id: "home",
    label: "Home",
    icon: "/assets/icons/tab-home.svg",
    iconActive: "/assets/icons/tab-home-active.svg",
  },
  {
    id: "promo",
    label: "Promo",
    icon: "/assets/icons/tab-promo.svg",
    iconActive: "/assets/icons/tab-promo-active.svg",
  },
];

const RIGHT_TABS = [
  {
    id: "invite",
    label: "Invite",
    icon: "/assets/icons/tab-invite.svg",
    iconActive: "/assets/icons/tab-invite-active.svg",
  },
  {
    id: "profile",
    label: "Profile",
    icon: "/assets/icons/tab-profile.svg",
    iconActive: "/assets/icons/tab-profile-active.svg",
  },
];

Component({
  options: {
    multipleSlots: true,
    styleIsolation: "isolated",
  },
  properties: {
    active: {
      type: String,
      value: "home",
      observer() {
        this._syncItems();
      },
    },
  },
  data: {
    leftItems: [],
    rightItems: [],
  },
  lifetimes: {
    attached() {
      this._syncItems();
    },
  },
  methods: {
    onTapTab(e) {
      const id = e.currentTarget.dataset.id;
      if (!id || id === this.properties.active) return;
      this.triggerEvent("change", { id });
      switchTabPage(id);
    },

    onTapWheel() {
      if (this.properties.active === "wheel") return;
      this.triggerEvent("change", { id: "wheel" });
      switchTabPage("wheel");
    },

    _syncItems() {
      const active = this.properties.active;
      this.setData({
        leftItems: LEFT_TABS.map((item) => ({
          ...item,
          isActive: item.id === active,
        })),
        rightItems: RIGHT_TABS.map((item) => ({
          ...item,
          isActive: item.id === active,
        })),
      });
    },
  },
});
