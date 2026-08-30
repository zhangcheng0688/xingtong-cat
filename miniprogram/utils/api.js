// API 请求封装：自动带 token，统一错误
const app = () => getApp();

function request(path, { method = "GET", data, auth = true } = {}) {
  const g = app().globalData;
  return new Promise((resolve, reject) => {
    wx.request({
      url: g.apiBase + path,
      method,
      data,
      header: {
        "Content-Type": "application/json",
        ...(auth && g.token ? { Authorization: `Bearer ${g.token}` } : {}),
      },
      success(res) {
        const d = res.data || {};
        if (res.statusCode === 401) {
          wx.navigateTo({ url: "/pages/login/login" });
          reject(new Error(d.error || "请先登录"));
          return;
        }
        if (res.statusCode === 402) {
          wx.showModal({
            title: "积分不足",
            content: d.error || "积分不够啦",
            confirmText: "去充值",
            success: (m) => m.confirm && wx.showToast({ icon: "none", title: "充值页即将上线" }),
          });
          reject(Object.assign(new Error(d.error), d));
          return;
        }
        if (res.statusCode >= 400) {
          reject(new Error(d.error || `请求失败（${res.statusCode}）`));
          return;
        }
        resolve(d);
      },
      fail: (e) => reject(new Error("网络连接失败，请确认本地服务已启动")),
    });
  });
}

module.exports = {
  // 认证
  wxLogin: (code) => request("/api/auth", { method: "POST", data: { action: "login_wx", code }, auth: false }),
  sendCode: (phone) => request("/api/auth", { method: "POST", data: { action: "send_code", phone }, auth: false }),
  phoneLogin: (phone, code) => request("/api/auth", { method: "POST", data: { action: "login_phone", phone, code }, auth: false }),
  // 数据
  profiles: () => request("/api/profile", { auth: false }),
  credits: () => request("/api/credits"),
  startScenario: (profileId, description) =>
    request("/api/scenario", { method: "POST", data: { profileId, description } }),
  session: (id) => request(`/api/session/${id}`, { auth: false }),
  sendMessage: (id, message) => request(`/api/session/${id}/message`, { method: "POST", data: { message }, auth: false }),
  endSession: (id) => request(`/api/session/${id}/report`, { method: "POST", auth: false }),
  report: (id) => request(`/api/session/${id}/report`, { auth: false }),
  courses: (profileId) => request(`/api/learn?profile=${profileId}`, { auth: false }),
  tutorChat: (data) => request("/api/learn", { method: "POST", data }),
  completeLesson: (data) => request("/api/learn", { method: "PUT", data, auth: false }),
  posts: (topic) =>
    request("/api/community" + (topic && topic !== "全部" ? `?topic=${encodeURIComponent(topic)}` : ""), { auth: false }),
  likePost: (postId) => request("/api/community", { method: "PATCH", data: { postId, action: "like" }, auth: false }),
};
