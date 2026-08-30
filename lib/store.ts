import fs from "fs";
import path from "path";
import crypto from "crypto";
import type { ChildProfile, Session, Report } from "./types";

const DATA_DIR = path.join(process.cwd(), "data", "store");

export interface Post {
  id: string;
  topic: string;          // 话题标签
  title: string;
  content: string;
  author: string;         // 昵称
  likes: number;
  comments: Comment[];
  isExpert?: boolean;     // 专家/官方内容
  createdAt: string;
}
export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}
export interface WeeklyReport {
  id: string;
  profileId: string;
  weekStart: string;      // ISO date
  sessions: number;
  avgScore: number | null;
  content: {
    headline: string;
    growth: string[];         // 孩子的进步信号
    parentGrowth: string[];   // 家长的成长
    focus: string;            // 下周焦点
    encouragement: string;    // 主编寄语
  };
  createdAt: string;
}
export interface Progress {
  profileId: string;
  completed: Record<string, string[]>; // courseId -> lessonId[]
  updatedAt: string;
}

export interface User {
  id: string;
  phone?: string;        // 手机号登录
  wxOpenid?: string;     // 微信登录（小程序 wx.login 换取；Web 预览环境为模拟值）
  nickname: string;
  channel: "phone" | "wechat";
  credits: number;       // 积分余额
  createdAt: string;
  lastLoginAt: string;
}
export interface CreditTxn {
  id: string;
  userId: string;
  delta: number;         // 正=入账（赠送/充值），负=消耗
  reason: string;        // signup_bonus / purchase / scenario / lesson / weekly / admin
  refId?: string;        // 关联的 session/lesson 等
  createdAt: string;
}
export interface AuthToken {
  token: string;
  userId: string;
  createdAt: string;
}
export interface SmsCode {
  phone: string;
  code: string;
  expiresAt: number;     // epoch ms
}

function ensureDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
type Kind = "profiles" | "sessions" | "reports" | "posts" | "weekly" | "progress" | "users" | "tokens" | "sms" | "creditTxns";
function fileOf(kind: Kind) {
  ensureDir();
  return path.join(DATA_DIR, `${kind}.json`);
}
function readAll<T>(kind: Kind): Record<string, T> {
  const f = fileOf(kind);
  if (!fs.existsSync(f)) return {};
  try {
    return JSON.parse(fs.readFileSync(f, "utf-8"));
  } catch {
    return {};
  }
}
function writeAll<T>(kind: Kind, data: Record<string, T>) {
  fs.writeFileSync(fileOf(kind), JSON.stringify(data, null, 2), "utf-8");
}

export const store = {
  newId: () => crypto.randomBytes(8).toString("hex"),

  saveProfile(p: ChildProfile) {
    const all = readAll<ChildProfile>("profiles");
    all[p.id] = p;
    writeAll("profiles", all);
  },
  getProfile(id: string) {
    return readAll<ChildProfile>("profiles")[id] ?? null;
  },
  listProfiles() {
    return Object.values(readAll<ChildProfile>("profiles")).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
  },

  saveSession(s: Session) {
    const all = readAll<Session>("sessions");
    all[s.id] = s;
    writeAll("sessions", all);
  },
  getSession(id: string) {
    return readAll<Session>("sessions")[id] ?? null;
  },
  listSessions(profileId?: string) {
    const all = Object.values(readAll<Session>("sessions")).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
    return profileId ? all.filter((s) => s.profileId === profileId) : all;
  },

  saveReport(r: Report) {
    const all = readAll<Report>("reports");
    all[r.id] = r;
    writeAll("reports", all);
  },
  getReportBySession(sessionId: string) {
    return Object.values(readAll<Report>("reports")).find((r) => r.sessionId === sessionId) ?? null;
  },
  listReports(profileId?: string) {
    const reports = Object.values(readAll<Report>("reports"));
    if (!profileId) return reports.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const sessionIds = new Set(
      Object.values(readAll<Session>("sessions"))
        .filter((s) => s.profileId === profileId)
        .map((s) => s.id)
    );
    return reports
      .filter((r) => sessionIds.has(r.sessionId))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  // ---- 社区 ----
  listPosts() {
    return Object.values(readAll<Post>("posts")).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  getPost(id: string) {
    return readAll<Post>("posts")[id] ?? null;
  },
  savePost(p: Post) {
    const all = readAll<Post>("posts");
    all[p.id] = p;
    writeAll("posts", all);
  },
  seedPosts(posts: Post[]) {
    const all = readAll<Post>("posts");
    let changed = false;
    for (const p of posts) {
      if (!all[p.id]) {
        all[p.id] = p;
        changed = true;
      }
    }
    if (changed) writeAll("posts", all);
  },

  // ---- 周报 ----
  saveWeekly(w: WeeklyReport) {
    const all = readAll<WeeklyReport>("weekly");
    all[w.id] = w;
    writeAll("weekly", all);
  },
  listWeekly(profileId: string) {
    return Object.values(readAll<WeeklyReport>("weekly"))
      .filter((w) => w.profileId === profileId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  getWeekly(id: string) {
    return readAll<WeeklyReport>("weekly")[id] ?? null;
  },

  // ---- 学习进度 ----
  getProgress(profileId: string): Progress {
    const all = readAll<Progress>("progress");
    return (
      all[profileId] ?? { profileId, completed: {}, updatedAt: new Date().toISOString() }
    );
  },
  completeLesson(profileId: string, courseId: string, lessonId: string) {
    const all = readAll<Progress>("progress");
    const p = all[profileId] ?? { profileId, completed: {}, updatedAt: "" };
    const arr = new Set(p.completed[courseId] ?? []);
    arr.add(lessonId);
    p.completed[courseId] = [...arr];
    p.updatedAt = new Date().toISOString();
    all[profileId] = p;
    writeAll("progress", all);
    return p;
  },

  // ---- 用户与登录 ----
  findUserByPhone(phone: string) {
    return Object.values(readAll<User>("users")).find((u) => u.phone === phone) ?? null;
  },
  findUserByWx(openid: string) {
    return Object.values(readAll<User>("users")).find((u) => u.wxOpenid === openid) ?? null;
  },
  saveUser(u: User) {
    const all = readAll<User>("users");
    all[u.id] = u;
    writeAll("users", all);
  },
  getUser(id: string) {
    return readAll<User>("users")[id] ?? null;
  },

  saveSmsCode(s: SmsCode) {
    const all = readAll<SmsCode>("sms");
    all[s.phone] = s;
    writeAll("sms", all);
  },
  getSmsCode(phone: string) {
    const s = readAll<SmsCode>("sms")[phone] ?? null;
    if (s && s.expiresAt < Date.now()) return null;
    return s;
  },
  clearSmsCode(phone: string) {
    const all = readAll<SmsCode>("sms");
    delete all[phone];
    writeAll("sms", all);
  },

  issueToken(userId: string) {
    const all = readAll<AuthToken>("tokens");
    const t: AuthToken = { token: crypto.randomBytes(24).toString("hex"), userId, createdAt: new Date().toISOString() };
    all[t.token] = t;
    writeAll("tokens", all);
    return t.token;
  },
  userByToken(token: string | null | undefined) {
    if (!token) return null;
    const t = readAll<AuthToken>("tokens")[token];
    return t ? (readAll<User>("users")[t.userId] ?? null) : null;
  },
  revokeToken(token: string) {
    const all = readAll<AuthToken>("tokens");
    delete all[token];
    writeAll("tokens", all);
  },

  // ---- 积分（Credits）----
  /** 入账/扣减积分并记流水；余额不足时返回 null，不做任何修改 */
  addCredits(userId: string, delta: number, reason: string, refId?: string): number | null {
    const users = readAll<User>("users");
    const u = users[userId];
    if (!u) return null;
    const next = (u.credits ?? 0) + delta;
    if (next < 0) return null;
    u.credits = next;
    users[userId] = u;
    writeAll("users", users);
    const txns = readAll<CreditTxn>("creditTxns");
    const t: CreditTxn = {
      id: crypto.randomBytes(8).toString("hex"),
      userId, delta, reason, refId, createdAt: new Date().toISOString(),
    };
    txns[t.id] = t;
    writeAll("creditTxns", txns);
    return next;
  },
  getCredits(userId: string): number {
    return readAll<User>("users")[userId]?.credits ?? 0;
  },
  listCreditTxns(userId: string) {
    return Object.values(readAll<CreditTxn>("creditTxns"))
      .filter((t) => t.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
};
