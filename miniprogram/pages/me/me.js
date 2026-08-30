const api = require("../../utils/api");

Page({
  data: { user: null, profile: null, balance: null, pricing: null },

  onShow() {
    if (!getApp().requireAuth()) return;
    this.setData({ user: getApp().globalData.user });
    this.load();
  },

  async load() {
    try {
      const p = await api.profiles();
      this.setData({ profile: (p.profiles || [])[0] || null });
    } catch (e) {}
    api
      .credits()
      .then((c) => this.setData({ balance: c.balance, pricing: c.pricing }))
      .catch(() => {});
  },

  todo() {
    wx.showToast({ icon: "none", title: "小程序版即将上线，Web 端已可用" });
  },

  logout() {
    wx.showModal({
      title: "退出登录？",
      content: "数据保存在服务器，随时可以重新登录",
      confirmText: "退出",
      confirmColor: "#D4755E",
      success: (r) => {
        if (!r.confirm) return;
        getApp().globalData.token = "";
        getApp().globalData.user = null;
        wx.removeStorageSync("xt_token");
        wx.removeStorageSync("xt_user");
        wx.reLaunch({ url: "/pages/login/login" });
      },
    });
  },
});
