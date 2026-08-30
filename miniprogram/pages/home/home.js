const api = require("../../utils/api");

const PRESETS = [
  { key: "supermarket", icon: "🛒", title: "超市购物", desc: "孩子在超市看到玩具非要买，被拒绝后开始哭闹" },
  { key: "meal", icon: "🍚", title: "吃饭哭喊", desc: "到了饭点，孩子拒绝坐上餐椅，哭喊挣扎" },
  { key: "toy", icon: "🧸", title: "玩具情绪失控", desc: "积木搭不好倒了，孩子突然崩溃摔玩具" },
  { key: "shoes", icon: "👟", title: "出门换鞋", desc: "要出门了，孩子不肯换鞋，越催越抗拒" },
  { key: "bedtime", icon: "🌙", title: "睡前兴奋", desc: "睡觉时间到了，孩子反而兴奋尖叫、满屋跑" },
];

Page({
  data: { profile: null, presets: PRESETS, custom: "", creating: "", error: "", balance: null },

  onShow() {
    if (!getApp().requireAuth()) return;
    this.load();
  },

  async load() {
    try {
      const d = await api.profiles();
      const list = d.profiles || [];
      this.setData({ profile: list[0] || null });
      if (!list[0]) {
        wx.showToast({ icon: "none", title: "请先在 Web 端建立星星档案" });
      }
      api.credits().then((c) => this.setData({ balance: c.balance })).catch(() => {});
    } catch (e) {
      this.setData({ error: e.message });
    }
  },

  async start(e) {
    const { desc, key } = e.currentTarget.dataset;
    if (this.data.creating || !this.data.profile) return;
    this.setData({ creating: key, error: "" });
    try {
      const d = await api.startScenario(this.data.profile.id, desc);
      this.setData({ balance: d.balance ?? this.data.balance });
      wx.navigateTo({ url: `/pages/session/session?id=${d.session.id}` });
    } catch (err) {
      if (!err.code) this.setData({ error: err.message });
    } finally {
      this.setData({ creating: "" });
    }
  },

  startCustom() {
    const desc = (this.data.custom || "").trim();
    if (desc.length < 2) return;
    this.start({ currentTarget: { dataset: { desc, key: "custom" } } });
  },

  onCustom(e) { this.setData({ custom: e.detail.value }); },
  goBilling() { wx.showToast({ icon: "none", title: "充值页小程序版即将上线" }); },
});
