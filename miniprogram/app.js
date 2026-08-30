// 星童猫咪小程序入口
App({
  globalData: {
    // 开发期：本机 Next.js 服务（开发者工具需勾选「不校验合法域名」）
    // 正式期：替换为云函数/云调用或已备案的 HTTPS 域名
    apiBase: "http://localhost:7199",
    token: "",
    user: null,
  },
  onLaunch() {
    this.globalData.token = wx.getStorageSync("xt_token") || "";
    this.globalData.user = wx.getStorageSync("xt_user") || null;
  },
  // 全局：未登录统一跳登录页
  requireAuth() {
    if (!this.globalData.token) {
      wx.navigateTo({ url: "/pages/login/login" });
      return false;
    }
    return true;
  },
});
