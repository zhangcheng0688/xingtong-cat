const api = require("../../utils/api");

Page({
  data: {
    id: "",
    session: null,
    profile: null,
    messages: [],
    input: "",
    sending: false,
    ending: false,
    error: "",
  },

  onLoad(options) {
    this.setData({ id: options.id });
    this.load();
  },

  async load() {
    try {
      const d = await api.session(this.data.id);
      this.applySession(d.session, d.profile);
    } catch (e) {
      this.setData({ error: e.message });
    }
  },

  applySession(session, profile) {
    this.setData({
      session,
      profile: profile || this.data.profile,
      messages: session.messages || [],
    });
    this.scrollBottom();
  },

  scrollBottom() {
    setTimeout(() => wx.pageScrollTo({ scrollTop: 999999, duration: 200 }), 100);
  },

  onInput(e) {
    this.setData({ input: e.detail.value });
  },

  async send() {
    const content = (this.data.input || "").trim();
    if (!content || this.data.sending || !this.data.session) return;
    if (this.data.session.status !== "active") {
      wx.showToast({ icon: "none", title: "本场演练已结束" });
      return;
    }
    // 乐观上屏：家长消息 + 「孩子回应中」
    const tmpId = "tmp-" + Date.now();
    this.setData({
      sending: true,
      input: "",
      error: "",
      messages: [
        ...this.data.messages,
        { id: tmpId, role: "parent", content },
        { id: "tmp-typing", role: "typing" },
      ],
    });
    this.scrollBottom();
    try {
      const d = await api.sendMessage(this.data.id, content);
      this.applySession(d.session);
    } catch (e) {
      this.setData({
        messages: this.data.messages.filter((m) => m.id !== tmpId && m.id !== "tmp-typing"),
        error: e.message,
      });
    } finally {
      this.setData({ sending: false });
    }
  },

  async end() {
    if (this.data.ending || !this.data.session) return;
    const res = await new Promise((resolve) =>
      wx.showModal({
        title: "结束本场演练？",
        content: "结束后小星教练会生成一份总结报告",
        confirmText: "结束并出报告",
        success: resolve,
      })
    );
    if (!res.confirm) return;
    this.setData({ ending: true });
    try {
      await api.endSession(this.data.id);
      wx.redirectTo({ url: `/pages/report/report?id=${this.data.id}` });
    } catch (e) {
      wx.showToast({ icon: "none", title: e.message, duration: 2500 });
      this.setData({ ending: false });
    }
  },
});
