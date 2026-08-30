const api = require("../../utils/api");

Page({
  data: { phone: "", code: "", countdown: 0, busy: false, error: "", devCode: "" },

  onPhone(e) { this.setData({ phone: e.detail.value.replace(/\D/g, "") }); },
  onCode(e) { this.setData({ code: e.detail.value.replace(/\D/g, "") }); },

  enter(token, user) {
    getApp().globalData.token = token;
    getApp().globalData.user = user;
    wx.setStorageSync("xt_token", token);
    wx.setStorageSync("xt_user", user);
    wx.switchTab({ url: "/pages/home/home" });
  },

  // 微信一键登录：wx.login → code → 服务端 code2Session 换 openid
  wxLogin() {
    if (this.data.busy) return;
    this.setData({ busy: true, error: "" });
    wx.login({
      success: async ({ code }) => {
        try {
          const d = await api.wxLogin(code);
          this.enter(d.token, d.user);
        } catch (e) {
          this.setData({ error: e.message, busy: false });
        }
      },
      fail: () => this.setData({ error: "微信登录失败，请重试", busy: false }),
    });
  },

  async sendCode() {
    if (!/^1\d{10}$/.test(this.data.phone)) {
      this.setData({ error: "请先输入 11 位手机号" });
      return;
    }
    try {
      const d = await api.sendCode(this.data.phone);
      this.setData({ countdown: 60, ...(d.devCode ? { devCode: d.devCode, code: d.devCode } : {}) });
      const timer = setInterval(() => {
        if (this.data.countdown <= 1) { clearInterval(timer); this.setData({ countdown: 0 }); }
        else this.setData({ countdown: this.data.countdown - 1 });
      }, 1000);
    } catch (e) {
      this.setData({ error: e.message });
    }
  },

  async phoneLogin() {
    if (!/^1\d{10}$/.test(this.data.phone) || !this.data.code) {
      this.setData({ error: "请输入手机号和验证码" });
      return;
    }
    this.setData({ busy: true, error: "" });
    try {
      const d = await api.phoneLogin(this.data.phone, this.data.code);
      this.enter(d.token, d.user);
    } catch (e) {
      this.setData({ error: e.message, busy: false });
    }
  },
});
