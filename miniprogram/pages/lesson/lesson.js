const api = require("../../utils/api");

Page({
  data: {
    profileId: "",
    courseId: "",
    lessonId: "",
    title: "",
    messages: [],
    history: [],
    input: "",
    busy: false,
    ready: false,
    done: false,
    error: "",
  },

  onLoad(options) {
    this.setData({
      profileId: options.profileId,
      courseId: options.courseId,
      lessonId: options.lessonId,
      title: decodeURIComponent(options.title || "互动课"),
    });
    this.start();
  },

  // 开课：history 为空时后端计 2 积分（402 由全局弹窗处理）
  async start() {
    this.setData({ busy: true, error: "" });
    try {
      const d = await api.tutorChat({
        profileId: this.data.profileId,
        courseId: this.data.courseId,
        lessonId: this.data.lessonId,
        history: [],
      });
      this.pushTutor(d.reply);
    } catch (e) {
      if (!e.code) this.setData({ error: e.message });
      this.setData({ busy: false });
    }
  },

  pushTutor(reply) {
    if (!reply) {
      this.setData({ busy: false });
      return;
    }
    const now = Date.now();
    const msgs = [];
    const history = [...this.data.history];
    if (reply.teach) {
      msgs.push({ id: "t" + now, role: "tutor", content: reply.teach });
      history.push({ role: "assistant", content: reply.teach });
    }
    if (reply.ask) {
      msgs.push({ id: "a" + now, role: "tutor", content: reply.ask, isAsk: true });
      history.push({ role: "assistant", content: reply.ask });
    }
    this.setData({
      messages: [...this.data.messages, ...msgs],
      history,
      ready: !!reply.readyToPractice,
      busy: false,
    });
    this.scrollBottom();
  },

  onInput(e) {
    this.setData({ input: e.detail.value });
  },

  async send() {
    const content = (this.data.input || "").trim();
    if (!content || this.data.busy || this.data.done) return;
    const history = [...this.data.history, { role: "user", content }];
    this.setData({
      messages: [
        ...this.data.messages,
        { id: "u" + Date.now(), role: "user", content },
        { id: "typing", role: "typing" },
      ],
      input: "",
      busy: true,
      error: "",
    });
    this.scrollBottom();
    try {
      const d = await api.tutorChat({
        profileId: this.data.profileId,
        courseId: this.data.courseId,
        lessonId: this.data.lessonId,
        history,
        message: content,
      });
      this.setData({
        messages: this.data.messages.filter((m) => m.id !== "typing"),
        history,
      });
      this.pushTutor(d.reply);
    } catch (e) {
      this.setData({
        messages: this.data.messages.filter((m) => m.id !== "typing"),
        error: e.message,
        busy: false,
      });
    }
  },

  async complete() {
    if (this.data.done) return;
    try {
      await api.completeLesson({
        profileId: this.data.profileId,
        courseId: this.data.courseId,
        lessonId: this.data.lessonId,
      });
      this.setData({ done: true });
      wx.showToast({ icon: "none", title: "打卡成功，已记入进度 ✦" });
      setTimeout(() => wx.navigateBack(), 1200);
    } catch (e) {
      wx.showToast({ icon: "none", title: e.message });
    }
  },

  scrollBottom() {
    setTimeout(() => wx.pageScrollTo({ scrollTop: 999999, duration: 200 }), 100);
  },
});
