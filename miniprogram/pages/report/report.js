const api = require("../../utils/api");

Page({
  data: { id: "", report: null, session: null, error: "" },

  onLoad(options) {
    this.setData({ id: options.id });
    this.load();
  },

  async load() {
    try {
      const d = await api.report(this.data.id);
      this.setData({ report: d.report, session: d.session });
    } catch (e) {
      this.setData({ error: e.message });
    }
  },

  goHome() {
    wx.switchTab({ url: "/pages/home/home" });
  },
});
