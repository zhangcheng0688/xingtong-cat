const api = require("../../utils/api");

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return Math.max(m, 1) + " 分钟前";
  const h = Math.floor(m / 60);
  if (h < 24) return h + " 小时前";
  const d = Math.floor(h / 24);
  if (d < 30) return d + " 天前";
  return new Date(iso).toLocaleDateString();
}

Page({
  data: { posts: [], topics: [], active: "全部", liked: {}, error: "" },

  onShow() {
    if (!getApp().requireAuth()) return;
    this.load(this.data.active);
  },

  async load(topic) {
    try {
      const d = await api.posts(topic);
      const posts = (d.posts || []).map((p) => ({ ...p, timeAgo: timeAgo(p.createdAt) }));
      this.setData({ posts, topics: d.topics || [], active: topic || "全部", error: "" });
    } catch (e) {
      this.setData({ error: e.message });
    }
  },

  pick(e) {
    this.load(e.currentTarget.dataset.topic);
  },

  async like(e) {
    const { id } = e.currentTarget.dataset;
    if (this.data.liked[id]) return;
    this.setData({ liked: { ...this.data.liked, [id]: true } });
    try {
      const d = await api.likePost(id);
      this.setData({ posts: this.data.posts.map((p) => (p.id === id ? { ...d.post, timeAgo: p.timeAgo } : p)) });
    } catch (err) {
      // 点赞失败静默回滚
      const liked = { ...this.data.liked };
      delete liked[id];
      this.setData({ liked });
    }
  },

  open() {
    wx.showToast({ icon: "none", title: "帖子详情页小程序版即将上线" });
  },
});
