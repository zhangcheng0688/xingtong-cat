const api = require("../../utils/api");

Page({
  data: { courses: [], profile: null, error: "" },

  onShow() {
    if (!getApp().requireAuth()) return;
    this.load();
  },

  async load() {
    try {
      const p = await api.profiles();
      const profile = (p.profiles || [])[0];
      if (!profile) {
        this.setData({ error: "请先在 Web 端建立星星档案，再来上课" });
        return;
      }
      const d = await api.courses(profile.id);
      this.setData({ courses: d.courses || [], profile, error: "" });
    } catch (e) {
      this.setData({ error: e.message });
    }
  },

  open(e) {
    const { id } = e.currentTarget.dataset;
    const c = this.data.courses.find((x) => x.id === id);
    if (!c || !this.data.profile) return;
    const lesson = c.lessons.find((l) => !l.done) || c.lessons[0];
    const title = encodeURIComponent(`${c.name} · ${lesson.title}`);
    wx.navigateTo({
      url: `/pages/lesson/lesson?profileId=${this.data.profile.id}&courseId=${c.id}&lessonId=${lesson.id}&title=${title}`,
    });
  },
});
