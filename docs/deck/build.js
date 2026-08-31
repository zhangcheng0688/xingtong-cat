// 星童猫咪 · 2026 融资路演 PPTX 构建脚本
// node build.js  →  星童猫咪-融资路演-2026.pptx
const pptxgen = require("pptxgenjs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.author = "星童猫咪团队";
pres.company = "星童猫咪";
pres.title = "星童猫咪 · 2026 融资路演";

// ── 画布与色板（品牌：奶油 / 蜜柑 / 雾青 / 暖炭）─────────────────
const W = 13.33, H = 7.5, M = 0.62;
const F = "微软雅黑", FN = "Arial";

const BG = "FFFDF7";   // 奶油白
const BG2 = "F4EDE0";  // 淡奶油（卡片/色带）
const BG3 = "EAF1F2";  // 淡雾青（次级卡片）
const INK = "2B2721";  // 暖炭
const MUTED = "837868";
const HAIR = "DCD1BE"; // 发丝线
const PRIM = "2F6C78"; // 深雾青
const PRIM2 = "7FBEC7";
const ACC = "E08A1E";  // 蜜柑（填充/图形）
const ACCT = "A85F0A"; // 蜜柑（文字，加深保对比）
const DARK = "17262A"; // 深墨青（深色页）
const DARK2 = "20343A";
const OND = "FFFDF7";
const ONDM = "9DB2B6";

const IMG = (n) => path.join(__dirname, "img", n);

// ── 通用辅助 ────────────────────────────────────────────────
let pageNo = 0;

function newSlide(dark) {
  const s = pres.addSlide();
  s.background = { color: dark ? DARK : BG };
  return s;
}

function head(s, kicker, title, sub, dark) {
  const t = dark ? OND : INK, k = dark ? PRIM2 : PRIM, m = dark ? ONDM : MUTED;
  let y = 0.46;
  if (kicker) {
    s.addText(kicker, { x: M, y, w: W - 2 * M, h: 0.28, fontSize: 11, bold: true,
      color: k, charSpacing: 4, fontFace: F, margin: 0 });
    y += 0.34;
  }
  s.addText(title, { x: M, y, w: W - 2 * M, h: 0.6, fontSize: 29, bold: true,
    color: t, fontFace: F, margin: 0, valign: "top" });
  y += 0.62;
  if (sub) {
    s.addText(sub, { x: M, y, w: W - 2 * M - 0.4, h: 0.46, fontSize: 14,
      color: m, fontFace: F, margin: 0, valign: "top", lineSpacingMultiple: 1.2 });
    y += 0.5;
  }
  return y + 0.16;
}

function foot(s, src, dark) {
  pageNo += 1;
  const c = dark ? "5F7A7E" : "AB9F90";
  if (src) s.addText(src, { x: M, y: 6.94, w: W - 2 * M - 1, h: 0.3, fontSize: 9.5,
    color: c, fontFace: F, margin: 0, valign: "middle" });
  if (pageNo > 1) {
    s.addText(String(pageNo).padStart(2, "0"), { x: W - M - 0.6, y: 6.94, w: 0.6, h: 0.3,
      fontSize: 9.5, color: c, fontFace: FN, align: "right", margin: 0, valign: "middle" });
  }
}

// 卡片：柔和填充 + 轻微投影（不用边缘色条）
const shadow = () => ({ type: "outer", color: "8A7A63", blur: 10, offset: 2, angle: 90, opacity: 0.14 });

function card(s, x, y, w, h, fill) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: 0.09,
    fill: { color: fill || "FFFFFF" },
    line: { color: "EDE3D2", width: 0.75 },
    shadow: shadow(),
  });
}

const bu = () => ({ code: "25AA", indent: 14 });

function bullets(s, items, o) {
  s.addText(items.map((t, i) => ({ text: t, options: { bullet: bu(), breakLine: i < items.length - 1 } })),
    Object.assign({ fontFace: F, margin: 0, paraSpaceAfter: 7 }, o));
}

function hair(s, x, y, w, dark) {
  s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color: dark ? "2E464C" : HAIR, width: 0.75 } });
}

// 大号数字
function stat(s, x, y, w, num, label, color, size) {
  s.addText(num, { x, y, w, h: (size || 46) / 52 + 0.34, fontSize: size || 46, bold: true,
    color: color || ACC, fontFace: FN, align: "left", margin: 0, valign: "top" });
  s.addText(label, { x, y: y + (size || 46) / 52 - 0.02, w, h: 0.62, fontSize: 12,
    color: MUTED, fontFace: F, margin: 0, valign: "top", lineSpacingMultiple: 1.15 });
}

// 圆角标签
function tag(s, x, y, w, h, text, fill, color, size) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: h / 2,
    fill: { color: fill }, line: { width: 0, color: fill } });
  s.addText(text, { x, y, w, h, fontSize: size || 11, bold: true, color, fontFace: F,
    align: "center", valign: "middle", margin: 0 });
}

function arrow(s, x, y, w, color) {
  s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color: color || PRIM2, width: 1.5,
    endArrowType: "triangle", beginArrowType: "none" } });
}

// ══════════════════════════════════════════════════════════════
// 01 · 封面（深色）
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(true);
  s.addShape(pres.shapes.OVAL, { x: 8.4, y: -1.5, w: 8, h: 8, fill: { color: DARK2 } });
  s.addShape(pres.shapes.OVAL, { x: 9.6, y: -0.5, w: 6, h: 6, fill: { color: "243C42" } });
  s.addImage({ path: IMG("ip.png"), x: 9.55, y: 1.55, w: 3.15, h: 3.15,
    sizing: { type: "contain", w: 3.15, h: 3.15 } });

  s.addText("C A R E   ·   A U T I S M   T O G E T H E R   ·   2 0 2 6",
    { x: M, y: 1.0, w: 7.6, h: 0.3, fontSize: 10.5, bold: true, color: PRIM2,
      charSpacing: 3, fontFace: F, margin: 0 });

  s.addText("星童猫咪", { x: M, y: 1.5, w: 7.6, h: 1.0, fontSize: 58, bold: true,
    color: OND, fontFace: F, margin: 0 });

  s.addText("一个大脑，一具身体，一张网络", { x: M, y: 2.6, w: 7.6, h: 0.62,
    fontSize: 27, bold: true, color: ACC, fontFace: F, margin: 0 });

  s.addText("让每个中国家庭，都请得起一位「懂孩子的干预专家」",
    { x: M, y: 3.35, w: 7.4, h: 0.45, fontSize: 16.5, color: OND, fontFace: F, margin: 0 });

  hair(s, M, 4.15, 7.5, true);

  // 三步走证据条
  const steps = [
    ["第一步 · 软件", "已上线 v1.3", true],
    ["第二步 · 硬件", "链路已打通", false],
    ["第三步 · 生态", "三年一万家庭", false],
  ];
  let x = M;
  steps.forEach(([a, b, done]) => {
    s.addText(a, { x, y: 4.42, w: 2.4, h: 0.28, fontSize: 12.5, bold: true,
      color: done ? ACC : OND, fontFace: F, margin: 0 });
    s.addText((done ? "✓ " : "○ ") + b, { x, y: 4.72, w: 2.4, h: 0.3, fontSize: 12.5,
      color: done ? OND : ONDM, fontFace: F, margin: 0 });
    x += 2.62;
  });

  s.addText("Peter 张程 · +86 13159877586 / +852 44358635",
    { x: M, y: 6.5, w: 7.6, h: 0.32, fontSize: 12, color: ONDM, fontFace: F, margin: 0 });
  s.addText("github.com/zhangcheng0688/xingtong-cat",
    { x: M, y: 6.82, w: 7.6, h: 0.3, fontSize: 10.5, color: "6E8488", fontFace: FN, margin: 0 });
  foot(s, null, true);
  s.addNotes("开场一句话：中国有 300-500 万自闭症儿童，持证康复师约 1000 人。我们做的事，是把专家知识工程化，先装进小程序，再装进玩具，最后开放成一张网络。");
}

// ══════════════════════════════════════════════════════════════
// 02 · 一页看懂
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(false);
  let y = head(s, "EXECUTIVE SUMMARY", "一页看懂星童猫咪",
    "自闭症干预的瓶颈从来不是「没有好方法」，而是「好方法到不了家庭」。我们把专家知识工程化，用三步走把它送到孩子身边。");

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y, w: W - 2 * M, h: 1.02, rectRadius: 0.08,
    fill: { color: BG2 }, line: { color: "E6DAC5", width: 0.75 } });
  s.addText("把 30 万康复人才的缺口，装进一个 24 小时在线的专家大脑里 —— 再把它放进孩子愿意抱的玩具里。",
    { x: M + 0.32, y, w: W - 2 * M - 0.64, h: 1.02, fontSize: 19, bold: true, color: INK,
      fontFace: F, valign: "middle", margin: 0, lineSpacingMultiple: 1.15 });

  y += 1.34;
  const cols = [
    ["01", "我们在做什么", PRIM,
      "把自闭症干预的专业知识，工程化成一套 8 位专家 Agent 矩阵 + 循证知识库（DSM-5 / ABA / 地板时光 / 情绪共同调节）。"],
    ["02", "已证明什么", PRIM,
      "微信小程序 v1.3 全链路跑通：演练 / 学习 / 社区 / 报告四模块 + 积分商业化，端到端真实案例可现场演示。"],
    ["03", "下一步放大什么", PRIM,
      "把同一个大脑装进孩子愿意拥抱的 AI 玩具「小星」，让干预从家长学习走进孩子日常生活，数据双向回流。"],
    ["04", "终局是什么", ACCT,
      "向机构、专家与供应链开放这张网络，从「我们服务家庭」变成「整个行业通过我们服务家庭」。"],
  ];
  const cw = (W - 2 * M - 3 * 0.28) / 4;
  cols.forEach(([n, t, c, d], i) => {
    const cx = M + i * (cw + 0.28);
    card(s, cx, y, cw, 2.5, i === 3 ? "FDF3E4" : "FFFFFF");
    s.addText(n, { x: cx + 0.26, y: y + 0.22, w: 1.2, h: 0.42, fontSize: 26, bold: true,
      color: i === 3 ? ACC : PRIM2, fontFace: FN, margin: 0 });
    s.addText(t, { x: cx + 0.26, y: y + 0.7, w: cw - 0.5, h: 0.34, fontSize: 15, bold: true,
      color: c, fontFace: F, margin: 0 });
    s.addText(d, { x: cx + 0.26, y: y + 1.12, w: cw - 0.5, h: 1.2, fontSize: 11.5,
      color: MUTED, fontFace: F, margin: 0, lineSpacingMultiple: 1.3 });
  });

  y += 2.78;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y, w: W - 2 * M, h: 0.66, rectRadius: 0.08,
    fill: { color: PRIM }, line: { width: 0, color: PRIM } });
  s.addText("本轮融资", { x: M + 0.32, y, w: 1.4, h: 0.66, fontSize: 13, bold: true,
    color: "BFE0E5", fontFace: F, valign: "middle", margin: 0 });
  s.addText("300 万元 · 天使轮 · 出让 10%", { x: M + 1.7, y, w: 4, h: 0.66, fontSize: 16,
    bold: true, color: OND, fontFace: F, valign: "middle", margin: 0 });
  s.addText("18 个月里程碑：付费家庭 1 万 · 签约 100 家康复机构 · 小星玩具完成打样与 3C 认证",
    { x: M + 5.6, y, w: W - 2 * M - 6.0, h: 0.66, fontSize: 12.5, color: "CDE4E8",
      fontFace: F, valign: "middle", margin: 0 });
  foot(s, null);
  s.addNotes("这一页是整套材料的骨架。如果只有 30 秒，就讲这一页。");
}

// ══════════════════════════════════════════════════════════════
// 03 · 三步走：生态逻辑总览
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(false);
  let y = head(s, "THE THREE-STEP ECOSYSTEM", "三步走：一个大脑，一具身体，一张网络",
    "三步共用同一套专家矩阵与循证知识库 —— 边际成本递减，数据双向回流。每一步都在为下一步积累不可替代的资产。");

  const bw = (W - 2 * M - 2 * 0.42) / 3, bh = 3.5;
  const steps = [
    ["第一步", "一个大脑", "软件 · 已完成", PRIM, "EAF1F2", true, [
      "把专家知识工程化：8 位专家 Agent 矩阵 + 循证 RAG 知识库",
      "微信小程序 v1.3 已上线，四模块 + 积分商业化全链路跑通",
      "积累的资产：专业壁垒、付费意愿验证、第一批种子家庭",
    ]],
    ["第二步", "一具身体", "软硬一体 · 进行中", ACC, "FDF3E4", false, [
      "把同一个大脑装进孩子愿意拥抱的 AI 玩具「小星」",
      "级联架构：语音层让路，专家大脑掌权，安全红线可控可审计",
      "积累的资产：客厅里的真实行为数据 —— 软件时代拿不到的部分",
    ]],
    ["第三步", "一张网络", "生态 · 规划中", "4A7C59", "EDF3EC", false, [
      "向康复机构、专家网络与硬件供应链开放同一个大脑",
      "机构 SaaS 成为「AI 助教」，缓解 30 万康复人才缺口",
      "积累的资产：行业标准与分发渠道 —— 从产品到基础设施",
    ]],
  ];
  steps.forEach(([no, name, sub, c, fill, done, items], i) => {
    const x = M + i * (bw + 0.42);
    card(s, x, y, bw, bh, fill);
    s.addText(no, { x: x + 0.3, y: y + 0.24, w: 1.4, h: 0.3, fontSize: 11, bold: true,
      color: c, fontFace: F, charSpacing: 2, margin: 0 });
    s.addText(name, { x: x + 0.3, y: y + 0.56, w: bw - 0.6, h: 0.52, fontSize: 26, bold: true,
      color: INK, fontFace: F, margin: 0 });
    tag(s, x + 0.3, y + 1.14, 2.0, 0.32, (done ? "✓ " : "") + sub, c === ACC ? ACC : c, "FFFFFF", 10.5);
    hair(s, x + 0.3, y + 1.66, bw - 0.6);
    bullets(s, items, { x: x + 0.3, y: y + 1.8, w: bw - 0.6, h: 1.5, fontSize: 11.5, color: MUTED });
    if (i < 2) {
      s.addShape(pres.shapes.OVAL, { x: x + bw + 0.09, y: y + 1.5, w: 0.24, h: 0.24,
        fill: { color: HAIR }, line: { width: 0, color: HAIR } });
    }
  });

  y += bh + 0.3;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y, w: W - 2 * M, h: 0.72, rectRadius: 0.08,
    fill: { color: DARK }, line: { width: 0, color: DARK } });
  s.addText("第一步验证专业壁垒  →  第二步放大场景与数据  →  第三步放大分发与标准　｜　每一步的资产，都是下一道的护城河",
    { x: M + 0.32, y, w: W - 2 * M - 0.64, h: 0.72, fontSize: 14, bold: true, color: OND,
      fontFace: F, valign: "middle", margin: 0 });
  foot(s, null);
  s.addNotes("三步走不是三条业务线，是同一套能力的三次放大。核心资产复用：专家矩阵与知识库服务三端，边际成本递减。");
}

// ══════════════════════════════════════════════════════════════
// 04 · 市场
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(false);
  let y = head(s, "MARKET · 市场机会", "一个庞大而长期被忽视的人群",
    "诊断率提升与公众认知增强，让家庭干预需求正在快速显性化 —— 但供给侧的缺口，二十年来没有结构性改善。");

  const big = [
    ["1300 万+", "中国自闭症谱系障碍人群\n中国残联 2023 年残疾人普查口径"],
    ["300-500 万", "0-14 岁儿童患者\n《中国自闭症教育康复行业发展状况报告》"],
    ["20 万 / 年", "新增患者速度\n美国 CDC（2025）：每 36 名儿童中即有 1 名确诊"],
  ];
  const cw = (W - 2 * M - 2 * 0.3) / 3;
  big.forEach(([n, l], i) => {
    const x = M + i * (cw + 0.3);
    if (i > 0) s.addShape(pres.shapes.LINE, { x: x - 0.15, y: y + 0.1, w: 0, h: 1.5,
      line: { color: HAIR, width: 0.75 } });
    s.addText(n, { x, y: y + 0.05, w: cw, h: 0.78, fontSize: 42, bold: true,
      color: i === 0 ? ACC : PRIM, fontFace: FN, margin: 0 });
    s.addText(l, { x, y: y + 0.86, w: cw - 0.3, h: 0.86, fontSize: 12,
      color: MUTED, fontFace: F, margin: 0, lineSpacingMultiple: 1.35 });
  });

  y += 2.0;
  hair(s, M, y, W - 2 * M);
  y += 0.28;

  s.addText("需求侧正在发生的三件事", { x: M, y, w: 5.4, h: 0.34, fontSize: 15, bold: true,
    color: PRIM, fontFace: F, margin: 0 });
  bullets(s, [
    "诊断率提升：筛查工具普及与儿科医生认知提升，确诊年龄持续提前",
    "公众认知增强：家长不再「等孩子长大」，主动寻求早期干预的比例上升",
    "支付意愿形成：52.4% 的家庭已有一人放弃工作全职照看，干预成为刚性支出",
  ], { x: M, y: y + 0.42, w: 5.9, h: 1.6, fontSize: 12, color: INK });

  // 对比条
  const bx = M + 6.4, bwid = W - 2 * M - 6.4;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: bx, y: y + 0.06, w: bwid, h: 1.86, rectRadius: 0.08,
    fill: { color: BG3 }, line: { color: "D5E4E6", width: 0.75 } });
  s.addText("美国 CDC 2025：每 36 名儿童中即有 1 名确诊", { x: bx + 0.28, y: y + 0.26,
    w: bwid - 0.56, h: 0.3, fontSize: 12.5, bold: true, color: PRIM, fontFace: F, margin: 0 });
  s.addText("中国按同一口径推算，0-14 岁患儿已达 300-500 万量级。这是一个千万级人群、千亿级年支出、却长期缺乏数字化供给的市场。",
    { x: bx + 0.28, y: y + 0.62, w: bwid - 0.56, h: 1.1, fontSize: 11.5, color: MUTED,
      fontFace: F, margin: 0, lineSpacingMultiple: 1.35 });
  foot(s, "数据来源：中国新闻网·《2025 年度儿童发展障碍康复行业蓝皮书》；智研咨询（2025-12）；美国 CDC（2025）；《中国孤独症家长需求调查问卷》");
  s.addNotes("市场不用多讲，投资人大多知道这个人群的规模。重点是下一页：规模很大，但供给侧卡在「人」上。");
}

// ══════════════════════════════════════════════════════════════
// 05 · 痛点
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(false);
  let y = head(s, "PROBLEM · 痛点", "家庭干预，卡在「人」上",
    "方法不缺，缺的是能把方法带进家庭的人。三组数字，说明这个缺口有多深。");

  // 左侧大数字
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y, w: 4.1, h: 2.56, rectRadius: 0.1,
    fill: { color: DARK }, line: { width: 0, color: DARK } });
  s.addText("1 : 2500", { x: M + 0.34, y: y + 0.32, w: 3.4, h: 0.86, fontSize: 46, bold: true,
    color: ACC, fontFace: FN, margin: 0 });
  s.addText("持证专业人员与患儿比例", { x: M + 0.34, y: y + 1.2, w: 3.4, h: 0.32, fontSize: 14,
    bold: true, color: OND, fontFace: F, margin: 0 });
  s.addText("全国持证专业人员约 1000 人，对应 300-500 万患儿；残联在册康复教师口径下为 1:130。两个口径并列，缺口量级都在「万」以上。",
    { x: M + 0.34, y: y + 1.58, w: 3.42, h: 0.86, fontSize: 11, color: ONDM, fontFace: F,
      margin: 0, lineSpacingMultiple: 1.3 });

  const rx = M + 4.42, rw = W - 2 * M - 4.42;
  s.addText("30 万", { x: rx, y: y + 0.05, w: 1.8, h: 0.6, fontSize: 34, bold: true,
    color: PRIM, fontFace: FN, margin: 0 });
  s.addText("康复人才缺口", { x: rx + 1.9, y: y + 0.16, w: rw - 1.9, h: 0.44, fontSize: 13,
    bold: true, color: INK, fontFace: F, margin: 0, valign: "middle" });
  s.addText("40 小时 / 周", { x: rx, y: y + 0.72, w: 2.2, h: 0.6, fontSize: 34, bold: true,
    color: PRIM, fontFace: FN, margin: 0 });
  s.addText("最低干预强度，需持续 2-3 年", { x: rx + 2.3, y: y + 0.83, w: rw - 2.3, h: 0.44,
    fontSize: 13, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle" });
  s.addText("52.4%", { x: rx, y: y + 1.39, w: 2.2, h: 0.6, fontSize: 34, bold: true,
    color: PRIM, fontFace: FN, margin: 0 });
  s.addText("家庭有一人放弃工作全职照看", { x: rx + 2.3, y: y + 1.5, w: rw - 2.3, h: 0.44,
    fontSize: 13, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle" });

  y += 2.86;
  hair(s, M, y, W - 2 * M);
  y += 0.3;

  const pain = [
    ["家长不懂", "孩子不愿沟通、家长难以共情；不合理的干预反而加剧病情，身心与经济双重承压。"],
    ["机构贵且远", "机构费用高昂，超半数家庭难以承担；且干预发生在机构，不在孩子真实的生活场景。"],
    ["干预不及时", "诊断在提前，服务供给没跟上 —— 等待排期的几个月，正是干预的黄金窗口。"],
  ];
  const pw = (W - 2 * M - 2 * 0.34) / 3;
  pain.forEach(([t, d], i) => {
    const x = M + i * (pw + 0.34);
    s.addShape(pres.shapes.OVAL, { x, y: y + 0.06, w: 0.3, h: 0.3, fill: { color: ACC }, line: { width: 0, color: ACC } });
    s.addText(String(i + 1), { x, y: y + 0.06, w: 0.3, h: 0.3, fontSize: 12, bold: true,
      color: "FFFFFF", fontFace: FN, align: "center", valign: "middle", margin: 0 });
    s.addText(t, { x: x + 0.44, y, w: pw - 0.44, h: 0.32, fontSize: 14.5, bold: true,
      color: INK, fontFace: F, margin: 0 });
    s.addText(d, { x, y: y + 0.4, w: pw, h: 0.86, fontSize: 11.5, color: MUTED, fontFace: F,
      margin: 0, lineSpacingMultiple: 1.3 });
  });
  foot(s, "数据来源：中国新闻网（2026-04）；北京大学第六医院贾美香主任医师公开访谈；《中国孤独症家长需求调查问卷》；中国残联 2023 年残疾人普查");
  s.addNotes("1:2500 用持证专业人员口径，1:130 用残联在册康复教师口径，两个基数不同，答辩时要主动说明。");
}

// ══════════════════════════════════════════════════════════════
// 06 · 洞察（深色 · 核心页）
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(true);
  s.addShape(pres.shapes.OVAL, { x: -2.6, y: 2.4, w: 6.4, h: 6.4, fill: { color: DARK2 } });
  s.addText("THE INSIGHT", { x: M, y: 0.62, w: 8, h: 0.28, fontSize: 11, bold: true,
    color: PRIM2, charSpacing: 4, fontFace: F, margin: 0 });

  s.addText("一个孩子一天 24 小时，", { x: M, y: 1.34, w: 8.6, h: 0.72, fontSize: 36, bold: true,
    color: OND, fontFace: F, margin: 0 });
  s.addText([
    { text: "专家只在他身边 ", options: { color: OND, breakLine: false, bold: true } },
    { text: "2 小时", options: { color: ACC, breakLine: false, bold: true } },
    { text: "。", options: { color: OND, breakLine: true, bold: true } },
  ], { x: M, y: 2.02, w: 8.6, h: 0.72, fontSize: 36, fontFace: F, margin: 0 });

  s.addText("剩下 22 小时，发生在客厅、餐桌、超市和睡前 —— 那才是干预真正的战场，却也是最没有专业支持的地方。",
    { x: M, y: 2.94, w: 8.4, h: 0.8, fontSize: 16, color: ONDM, fontFace: F, margin: 0,
      lineSpacingMultiple: 1.3 });

  hair(s, M, 3.9, 8.4, true);

  const cols = [
    ["知识在哪", "在约 1000 位持证专家的脑子里，和少数头部机构的教室里。"],
    ["孩子在哪", "在 300 万个家庭的客厅里，一天 24 小时，一周 7 天。"],
    ["断裂在哪", "好方法到不了家庭 —— 家长想帮，却不知道此刻该说什么、做什么。"],
  ];
  const cw = (8.4 - 2 * 0.34) / 3;
  cols.forEach(([t, d], i) => {
    const x = M + i * (cw + 0.34);
    s.addText(t, { x, y: 4.16, w: cw, h: 0.32, fontSize: 14, bold: true, color: PRIM2,
      fontFace: F, margin: 0 });
    s.addText(d, { x, y: 4.54, w: cw - 0.12, h: 1.0, fontSize: 12.5, color: OND,
      fontFace: F, margin: 0, lineSpacingMultiple: 1.35 });
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 5.86, w: 8.4, h: 0.9, rectRadius: 0.08,
    fill: { color: ACC }, line: { width: 0, color: ACC } });
  s.addText("干预的瓶颈从来不是「没有好方法」，而是「好方法的可及性」。\n而开源大模型的成熟，第一次让专业级干预的边际成本趋近于零 —— 这是我们能解决它的原因。",
    { x: M + 0.3, y: 5.86, w: 7.8, h: 0.9, fontSize: 13.5, bold: true, color: "2B2721",
      fontFace: F, valign: "middle", margin: 0, lineSpacingMultiple: 1.3 });

  s.addImage({ path: IMG("ip.png"), x: 9.5, y: 2.3, w: 3.2, h: 3.2,
    sizing: { type: "contain", w: 3.2, h: 3.2 } });
  foot(s, null, true);
  s.addNotes("这是整套材料的核心论点。停顿一下再翻页。22 小时空白 = 我们的全部机会。");
}

// ══════════════════════════════════════════════════════════════
// 07 · 为什么是现在
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(false);
  let y = head(s, "WHY NOW", "为什么是现在", "两端条件第一次同时成立：技术的成本曲线下来了，硬件的供应链与资本热度上来了。");

  const items = [
    ["模型层", "开源大模型成熟", "专业干预内容生成的边际成本第一次趋近于零 —— 2023 年之前，这件事在成本上不成立。", PRIM],
    ["硬件层", "AI 玩具供应链成熟", "广东产业带 + ESP32-S3 方案，整机 BOM ¥60-100；开源固件生态（xiaozhi 29.4k★）免造轮子。", ACC],
    ["资本层", "赛道热度已验证", "2025 年以来 AI 玩具赛道融资超 50 起、金额超 200 亿元；跃然创新（BubblePal）获 2 亿元 A 轮。", PRIM],
    ["政策层", "认知与保障提升", "《「十四五」特殊教育发展提升行动计划》推进，残联康复救助制度覆盖扩大，诊断与干预意识快速普及。", "4A7C59"],
  ];
  const cw = (W - 2 * M - 3 * 0.3) / 4;
  items.forEach(([k, t, d, c], i) => {
    const x = M + i * (cw + 0.3);
    card(s, x, y, cw, 2.62, "FFFFFF");
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: cw, h: 0.08, fill: { color: c }, line: { width: 0, color: c } });
    s.addText(k, { x: x + 0.26, y: y + 0.3, w: cw - 0.5, h: 0.28, fontSize: 11, bold: true,
      color: c, fontFace: F, charSpacing: 2, margin: 0 });
    s.addText(t, { x: x + 0.26, y: y + 0.62, w: cw - 0.5, h: 0.62, fontSize: 16, bold: true,
      color: INK, fontFace: F, margin: 0, lineSpacingMultiple: 1.15 });
    s.addText(d, { x: x + 0.26, y: y + 1.36, w: cw - 0.5, h: 1.06, fontSize: 11.5, color: MUTED,
      fontFace: F, margin: 0, lineSpacingMultiple: 1.32 });
  });

  y += 2.92;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y, w: W - 2 * M, h: 0.96, rectRadius: 0.08,
    fill: { color: BG2 }, line: { color: "E6DAC5", width: 0.75 } });
  s.addText("窗口判断", { x: M + 0.32, y, w: 1.4, h: 0.96, fontSize: 13, bold: true, color: ACCT,
    fontFace: F, valign: "middle", margin: 0 });
  s.addText("通用 AI 玩具已验证「硬件 + 订阅」的商业模式，但没有人把干预专业性做进去；专业机构有内容，但没有产品与数据能力。\n中间这条「专业干预 × AI 个性化」的空白带，窗口期约 12-18 个月 —— 这正是本轮融资要抢的时间。",
    { x: M + 1.8, y: y + 0.08, w: W - 2 * M - 2.2, h: 0.8, fontSize: 12.5, color: INK,
      fontFace: F, margin: 0, lineSpacingMultiple: 1.35 });
  foot(s, "数据来源：央视财经（2025-11）；中商产业研究院（2025）；新华网（2026-04）；公开融资信息整理");
  s.addNotes("Why Now 的四层要一次讲完：模型、硬件、资本、政策。结论落在「12-18 个月窗口期」，自然接到融资需求。");
}

// ══════════════════════════════════════════════════════════════
// 08 · 全栈架构：同一套大脑，三个入口
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(false);
  let y = head(s, "ARCHITECTURE · 全栈架构", "同一套大脑，三个入口",
    "所有入口共用一层「专家大脑」。语音、形态、渠道都可以换，专业性与安全性不换。");

  // 大脑层
  const bx = M, bw = W - 2 * M;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: bx, y, w: bw, h: 1.28, rectRadius: 0.1,
    fill: { color: PRIM }, line: { width: 0, color: PRIM }, shadow: shadow() });
  s.addText("专 家 大 脑", { x: bx + 0.34, y, w: 2.4, h: 1.28, fontSize: 20, bold: true,
    color: OND, fontFace: F, valign: "middle", margin: 0 });
  s.addShape(pres.shapes.LINE, { x: bx + 2.7, y: y + 0.26, w: 0, h: 0.76,
    line: { color: "4E8A93", width: 1 } });
  const brain = [
    ["8 位专家 Agent 矩阵", "场景理解 · 心理检索 · 儿童模拟 · 观察点评 · 协调总结 · 课程讲师 · 周报主编 · 小星玩伴"],
    ["循证 RAG 知识库", "DSM-5 · ABA · 地板时光 · 情绪共同调节 · 感觉统合 · 视觉支持 · 社交故事 · 专业边界"],
  ];
  brain.forEach(([t, d], i) => {
    const tx = bx + 3.0 + i * 4.9;
    s.addText(t, { x: tx, y: y + 0.24, w: 4.6, h: 0.3, fontSize: 13.5, bold: true,
      color: OND, fontFace: F, margin: 0 });
    s.addText(d, { x: tx, y: y + 0.6, w: 4.6, h: 0.46, fontSize: 10.5, color: "BFE0E5",
      fontFace: F, margin: 0, lineSpacingMultiple: 1.2 });
  });

  y += 1.58;
  // 向下箭头
  s.addShape(pres.shapes.LINE, { x: W / 2 - 0.01, y, w: 0, h: 0.36,
    line: { color: PRIM2, width: 1.5, endArrowType: "triangle" } });
  y += 0.5;

  // 三个入口
  const ports = [
    ["入口一 · 家长", "微信小程序", "已完成", PRIM, "EAF1F2",
      "8 页全功能：演练 / 学习 / 社区 / 我的\n积分商业化已跑通，端到端案例可演示"],
    ["入口二 · 孩子", "AI 玩具「小星」", "链路已打通", ACC, "FDF3E4",
      "ESP32-S3 方案，BOM ¥60-100\n级联架构：语音层让路，专家大脑掌权"],
    ["入口三 · 机构", "康复机构 SaaS", "规划中", "4A7C59", "EDF3EC",
      "家庭延伸干预工具与师训支持\n按席位 / 机构年费授权，缓解人才缺口"],
  ];
  const pw = (bw - 2 * 0.36) / 3;
  ports.forEach(([who, name, st, c, fill, d], i) => {
    const x = M + i * (pw + 0.36);
    card(s, x, y, pw, 1.86, fill);
    s.addText(who, { x: x + 0.28, y: y + 0.2, w: pw - 0.56, h: 0.28, fontSize: 11.5, bold: true,
      color: c, fontFace: F, margin: 0 });
    s.addText(name, { x: x + 0.28, y: y + 0.5, w: pw - 0.56, h: 0.38, fontSize: 19, bold: true,
      color: INK, fontFace: F, margin: 0 });
    tag(s, x + 0.28, y + 0.94, 1.5, 0.3, st, c, "FFFFFF", 10);
    s.addText(d, { x: x + 0.28, y: y + 1.34, w: pw - 0.56, h: 0.44, fontSize: 10.5, color: MUTED,
      fontFace: F, margin: 0, lineSpacingMultiple: 1.2 });
  });

  y += 2.14;
  hair(s, M, y, bw);
  y += 0.26;
  s.addText("三个入口，一套大脑　·　边际成本递减　·　数据双向回流：家长端学方法，孩子端出行为数据，机构端做分发与背书",
    { x: M, y, w: bw, h: 0.4, fontSize: 13.5, bold: true, color: PRIM, fontFace: F,
      margin: 0, valign: "middle" });
  foot(s, null);
  s.addNotes("这页回答「你们的护城河到底是什么」：不是某个 App 或某个玩具，是中间那层可复用、可审计、越用越准的专家大脑。");
}

// ══════════════════════════════════════════════════════════════
// 09 · 第一步：8 位专家 Agent 矩阵
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(false);
  let y = head(s, "STEP 1 · 一个大脑", "8 位专家 Agent 矩阵：把干预过程拆开，再逐个工程化",
    "一场演练不是一次对话，是五个专家角色按序协作；另有三位专家分别服务于学习、周报与玩具。COSTAR Prompt 框架保证输出质量与责任边界。");

  // 流水线
  const pipe = [
    ["①", "场景理解者", "模糊描述 → 结构化场景", PRIM],
    ["②", "心理学检索者", "RAG 循证语料检索", PRIM],
    ["③", "儿童模拟者", "以孩子身份真实回应", ACC],
    ["④", "观察心理专家", "逐句教练式点评", PRIM],
    ["⑤", "协调总结专家", "结构化报告生成", ACC],
  ];
  const pw = 2.0, gap = 0.34;
  const totalW = 5 * pw + 4 * gap;
  let x = (W - totalW) / 2;
  pipe.forEach(([n, t, d, c], i) => {
    card(s, x, y, pw, 1.5, i === 2 || i === 4 ? "FDF3E4" : "FFFFFF");
    s.addText(n, { x: x + 0.18, y: y + 0.16, w: 0.5, h: 0.32, fontSize: 15, bold: true,
      color: c, fontFace: F, margin: 0 });
    s.addText(t, { x: x + 0.18, y: y + 0.52, w: pw - 0.36, h: 0.34, fontSize: 13, bold: true,
      color: INK, fontFace: F, margin: 0 });
    s.addText(d, { x: x + 0.18, y: y + 0.92, w: pw - 0.36, h: 0.44, fontSize: 10.5,
      color: MUTED, fontFace: F, margin: 0, lineSpacingMultiple: 1.2 });
    if (i < 4) arrow(s, x + pw + 0.03, y + 0.75, gap - 0.06, i === 2 ? ACC : PRIM2);
    x += pw + gap;
  });

  // ③⇄④ 并行标注
  s.addText("⇄ 并行调用：孩子回应与专家点评同时生成", { x: (W - totalW) / 2 + 2 * (pw + gap), y: y + 1.56,
    w: 2 * pw + gap, h: 0.3, fontSize: 10, color: ACCT, fontFace: F, align: "center", margin: 0 });

  y += 2.02;
  const side = [
    ["⑥", "循证课程讲师", "28 门课 / 42 节互动课，讲解 → 提问 → 实战检验三段式授课"],
    ["⑦", "周报主编", "汇总一周干预数据，生成温暖且有洞察的家庭周报"],
    ["⑧", "小星玩伴", "玩具端陪伴大脑，短句 + 先情绪后事情 + 安全红线预警"],
  ];
  const sw = (W - 2 * M - 2 * 0.3) / 3;
  side.forEach(([n, t, d], i) => {
    const sx = M + i * (sw + 0.3);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: sx, y, w: sw, h: 1.08, rectRadius: 0.08,
      fill: { color: BG2 }, line: { width: 0, color: BG2 } });
    s.addText(n, { x: sx + 0.26, y: y + 0.12, w: 0.5, h: 0.3, fontSize: 14, bold: true,
      color: PRIM, fontFace: F, margin: 0 });
    s.addText(t, { x: sx + 0.8, y: y + 0.14, w: sw - 1.06, h: 0.3, fontSize: 13.5, bold: true,
      color: INK, fontFace: F, margin: 0 });
    s.addText(d, { x: sx + 0.26, y: y + 0.5, w: sw - 0.5, h: 0.46, fontSize: 10.5, color: MUTED,
      fontFace: F, margin: 0, lineSpacingMultiple: 1.22 });
  });

  y += 1.38;
  hair(s, M, y, W - 2 * M);
  y += 0.24;
  s.addText("设计原则：自研编排，不引入 LangChain / Dify —— 8 个角色顺序编排仅约 200 行透明代码，可审计、可迭代、无黑盒。知识库规模超过 1 万条后再引入向量检索（pgvector）。",
    { x: M, y, w: W - 2 * M, h: 0.5, fontSize: 12, color: INK, fontFace: F, margin: 0,
      lineSpacingMultiple: 1.3 });
  foot(s, "实现位置：lib/agents.ts（COSTAR Prompt 框架）· lib/knowledge.ts（RAG 检索）· data/knowledge/（10 篇循证语料）");
  s.addNotes("强调 8 位专家是代码里真实存在的（lib/agents.ts），不是 PPT 上的概念。可以当场打开仓库看。");
}

// ══════════════════════════════════════════════════════════════
// 10 · 第一步：产品实景
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(false);
  let y = head(s, "STEP 1 · 产品实景", "小程序 v1.3 已真实跑通全链路",
    "开源仓库 github.com/zhangcheng0688/xingtong-cat，微信开发者工具导入即跑，可现场演示。");

  const modules = [
    ["演练", "星星档案建档 → 一句话生成孪生场景 → 实时演练 + 观察专家逐句点评 → 结构化总结报告"],
    ["学习", "28 门循证干预课程、42 节互动课，按孩子档案个性化排序，讲师 Agent 对话式授课"],
    ["社区", "话题分类 + 专家答疑 + 点赞评论，家长互助氛围，真实干预案例沉淀"],
    ["我的", "孩子档案管理 · 积分余额 · 周报入口 · 微信 / 手机号双登录"],
  ];
  const mw = 6.0;
  modules.forEach(([t, d], i) => {
    const my = y + i * 1.12;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: my, w: mw, h: 0.98, rectRadius: 0.08,
      fill: { color: i % 2 ? "FFFFFF" : BG2 }, line: { width: 0, color: BG2 } });
    s.addText(t, { x: M + 0.28, y: my + 0.14, w: 0.9, h: 0.7, fontSize: 15, bold: true,
      color: PRIM, fontFace: F, margin: 0, valign: "middle" });
    s.addShape(pres.shapes.LINE, { x: M + 1.22, y: my + 0.22, w: 0, h: 0.54,
      line: { color: HAIR, width: 0.75 } });
    s.addText(d, { x: M + 1.4, y: my + 0.14, w: mw - 1.7, h: 0.7, fontSize: 11.5, color: INK,
      fontFace: F, margin: 0, valign: "middle", lineSpacingMultiple: 1.28 });
  });

  y += 4.58;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y, w: mw, h: 0.72, rectRadius: 0.08,
    fill: { color: ACC }, line: { width: 0, color: ACC } });
  s.addText("商业化已跑通　注册送 30 积分 · 演练 5 积分 / 场 · 课程 2 积分 / 节 · 周报 3 积分 / 期",
    { x: M + 0.28, y, w: mw - 0.56, h: 0.72, fontSize: 12.5, bold: true, color: "2B2721",
      fontFace: F, valign: "middle", margin: 0 });

  // 右侧手机截图
  const ix = M + 6.36, iw = W - M - ix;
  s.addText("真机界面", { x: ix, y: y - 4.58, w: iw, h: 0.3, fontSize: 12, bold: true,
    color: MUTED, fontFace: F, margin: 0 });
  const ph = 4.2, pwi = (500 / 1000) * ph; // 500x1000 原图比例
  const startX = ix + (iw - 2 * pwi - 0.24) / 2;
  [["home.png", 0], ["learn.png", 1]].forEach(([f, i]) => {
    const px = startX + i * (pwi + 0.24);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: px - 0.05, y: y - 4.2, w: pwi + 0.1, h: ph + 0.1,
      rectRadius: 0.12, fill: { color: "FFFFFF" }, line: { color: "E3D9C7", width: 0.75 },
      shadow: shadow() });
    s.addImage({ path: IMG(f), x: px, y: y - 4.15, w: pwi, h: ph - 0.1,
      sizing: { type: "cover", w: pwi, h: ph - 0.1 } });
  });
  foot(s, null);
  s.addNotes("可以先演示再讲：建档 → 生成场景 → 演练 → 报告，全程约 90 秒。演示完回到这页收束。");
}

// ══════════════════════════════════════════════════════════════
// 11 · 端到端验证案例
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(false);
  let y = head(s, "STEP 1 · 已验证的端到端链路", "一个真实案例：从情绪崩溃到 74 分",
    "不是 Demo，是跑通的一次完整干预闭环。孩子的情绪强度由模型实时输出（1-10），专家点评逐句生成。");

  // 左侧：时间线
  const tl = [
    ["建档", "乐乐，4 岁，ASD 中度。录入语言水平、感觉敏感、情绪触发点。", PRIM],
    ["生成场景", "家长一句话「超市购物」→ 场景理解者生成背景、导火索、孩子初始状态与演练目标。", PRIM],
    ["错误应对", "家长使用威胁性语言 → 孩子情绪强度 5 → 9 真实升级，模拟者给出【捂住耳朵】等回避动作。", ACC],
    ["专家点评", "观察专家当场指出「抛弃式威胁」问题，并给出可替换的示范说法。", PRIM],
    ["正确应对", "家长改用蹲下、轻声、简短指令 + 视觉提示 → 孩子情绪回落至 5，给出一点回应。", PRIM],
    ["报告", "协调总结专家输出结构化报告：74 分，含亮点引用、改进示范、孩子解读与下周练习。", ACC],
  ];
  tl.forEach(([t, d, c], i) => {
    const ty = y + i * 0.76;
    s.addShape(pres.shapes.OVAL, { x: M + 0.02, y: ty + 0.08, w: 0.16, h: 0.16,
      fill: { color: c }, line: { width: 0, color: c } });
    if (i < tl.length - 1) s.addShape(pres.shapes.LINE, { x: M + 0.095, y: ty + 0.26, w: 0, h: 0.56,
      line: { color: HAIR, width: 1 } });
    s.addText(t, { x: M + 0.34, y: ty - 0.02, w: 1.3, h: 0.32, fontSize: 12.5, bold: true,
      color: c, fontFace: F, margin: 0 });
    s.addText(d, { x: M + 1.72, y: ty - 0.02, w: 5.1, h: 0.7, fontSize: 11, color: INK,
      fontFace: F, margin: 0, lineSpacingMultiple: 1.25 });
  });

  // 右侧：情绪曲线图
  const cx = M + 7.3, cw = W - M - cx;
  card(s, cx, y, cw, 4.16, "FFFFFF");
  s.addText("孩子情绪强度（1-10）实时建模", { x: cx + 0.28, y: y + 0.18, w: cw - 0.56, h: 0.3,
    fontSize: 12.5, bold: true, color: PRIM, fontFace: F, margin: 0 });
  s.addText("模型的「儿童模拟者」Agent 在每一轮输出情绪强度，家长应对质量直接反映在曲线上 —— 这是干预效果第一次可被量化追踪。",
    { x: cx + 0.28, y: y + 0.52, w: cw - 0.56, h: 0.7, fontSize: 10.5, color: MUTED,
      fontFace: F, margin: 0, lineSpacingMultiple: 1.25 });
  s.addChart(pres.charts.LINE, [{
    name: "情绪强度",
    labels: ["开场", "家长威胁", "情绪升级", "专家示范后", "正确应对", "平稳收尾"],
    values: [5, 7, 9, 8, 6, 5],
  }], {
    x: cx + 0.14, y: y + 1.24, w: cw - 0.28, h: 2.2,
    chartColors: [ACC], lineSize: 3, lineSmooth: true,
    lineDataSymbol: "circle", lineDataSymbolSize: 7,
    chartArea: { fill: { color: "FFFFFF" } },
    plotArea: { fill: { color: "FFFFFF" } },
    catAxisLabelColor: MUTED, valAxisLabelColor: MUTED,
    catAxisLabelFontFace: F, valAxisLabelFontFace: FN,
    catAxisLabelFontSize: 9.5, valAxisLabelFontSize: 9.5,
    valAxisMinVal: 0, valAxisMaxVal: 10, valAxisMajorUnit: 2,
    valGridLine: { color: "EFE7DA", size: 0.5 }, catGridLine: { style: "none" },
    showValue: true, dataLabelColor: INK, dataLabelFontSize: 9.5, dataLabelFontFace: FN,
    dataLabelPosition: "t", showLegend: false,
  });
  s.addText("峰值 9（崩溃）→ 收尾 5（平稳）", { x: cx + 0.28, y: y + 3.5, w: cw - 0.56, h: 0.3,
    fontSize: 11, bold: true, color: ACCT, fontFace: F, margin: 0 });

  y += 4.42;
  hair(s, M, y, W - 2 * M);
  y += 0.22;
  s.addText("全流程已通过：讲师授课 · 课时打卡 · 周报生成 · 社区发帖与评论。知识库与课程内容基于公开循证通识撰写，正式上线前由专家顾问团审校。",
    { x: M, y, w: W - 2 * M, h: 0.4, fontSize: 11.5, color: MUTED, fontFace: F, margin: 0 });
  foot(s, "数据来源：本项目端到端实测记录（lib/agents.ts 输出，2026-08）");
  s.addNotes("这一页是「我们真的做出来了」的证据。曲线是模型真实输出的 emotion 字段，不是画上去的。");
}

// ══════════════════════════════════════════════════════════════
// 12 · 第二步：硬件「小星」
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(false);
  let y = head(s, "STEP 2 · 一具身体", "「小星」——住进孩子世界的干预伙伴",
    "孩子不会主动打开一个 App，但会主动抱起一只猫。硬件把干预从「家长学」推进到「孩子用」。");

  const iy = y, ih = 3.72, iw = 5.3;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: iy, w: iw, h: ih, rectRadius: 0.12,
    fill: { color: BG2 }, line: { color: "E6DAC5", width: 0.75 } });
  s.addImage({ path: IMG("toy-hero.png"), x: M + 0.12, y: iy + 0.12, w: iw - 0.24, h: ih - 0.24,
    sizing: { type: "cover", w: iw - 0.24, h: ih - 0.24 } });
  s.addText("小星 V1 原型渲染 · 猫形 IP 设计演绎", { x: M, y: iy + ih - 0.42, w: iw, h: 0.32,
    fontSize: 10, color: "FFFFFF", fontFace: F, align: "center", margin: 0 });

  const rx = M + iw + 0.42, rw = W - M - rx;
  const feats = [
    ["软硅胶猫耳", "情绪灯效：平静呼吸光 / 开心彩虹光，由小星玩伴 Agent 的 emotion 字段实时驱动"],
    ["琥珀色 LED 大眼睛", "动效极简、可预期、不吓到孩子，符合 ASD 儿童感觉友好原则"],
    ["胸口星星灯", "正向强化的视觉锚点：孩子完成一个干预小目标，星星亮一次"],
    ["毛绒底座", "可拥抱的触感，雾青布艺 + 奶油机身，自然融入卧室与客厅场景"],
  ];
  feats.forEach(([t, d], i) => {
    const fy = y + i * 0.92;
    s.addText(t, { x: rx, y: fy, w: rw, h: 0.3, fontSize: 13.5, bold: true, color: INK,
      fontFace: F, margin: 0 });
    s.addText(d, { x: rx, y: fy + 0.3, w: rw, h: 0.54, fontSize: 11, color: MUTED,
      fontFace: F, margin: 0, lineSpacingMultiple: 1.25 });
  });

  y = iy + ih + 0.34;
  // BOM 条
  const bom = [
    ["ESP32-S3-WROOM-1-N16R8", "主控 · Wi-Fi + 音频编解码", "¥35"],
    ["INMP441", "I2S 数字麦克风", "¥8"],
    ["MAX98357A + 3W 喇叭", "功放与发声", "¥10"],
    ["3.7V 锂电 + Type-C", "便携供电", "¥15"],
    ["舵机 ×2 + RGB 灯", "动作与情绪表达层", "¥20"],
  ];
  const bwid = (W - 2 * M) / 5;
  bom.forEach(([a, b, c], i) => {
    const bx2 = M + i * bwid;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: bx2 + 0.06, y, w: bwid - 0.12, h: 1.02,
      rectRadius: 0.07, fill: { color: "FFFFFF" }, line: { color: "EDE3D2", width: 0.75 } });
    s.addText(c, { x: bx2 + 0.24, y: y + 0.1, w: bwid - 0.5, h: 0.34, fontSize: 17, bold: true,
      color: ACC, fontFace: FN, margin: 0 });
    s.addText(a, { x: bx2 + 0.24, y: y + 0.46, w: bwid - 0.5, h: 0.24, fontSize: 9.5,
      bold: true, color: INK, fontFace: FN, margin: 0 });
    s.addText(b, { x: bx2 + 0.24, y: y + 0.7, w: bwid - 0.5, h: 0.24, fontSize: 9.5,
      color: MUTED, fontFace: F, margin: 0 });
  });

  y += 1.2;
  s.addText("整机 BOM ¥60-100　·　固件基于 xiaozhi-esp32 开源生态（29.4k★，ESP32 AI 机器人事实标准），服务器地址指向我们即可，无需从零写固件",
    { x: M, y, w: W - 2 * M, h: 0.34, fontSize: 12, bold: true, color: PRIM, fontFace: F,
      margin: 0, valign: "middle" });
  foot(s, "硬件方案与 BOM 依据 docs/VOICE_TOY.md 参考设计；图片为设计演绎渲染图");
  s.addNotes("硬件不是我们的重资产：BOM 60-100 元，固件用开源生态，我们只做大脑层和工业设计。");
}

// ══════════════════════════════════════════════════════════════
// 13 · 级联架构
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(false);
  let y = head(s, "STEP 2 · 技术架构（已实现）", "级联架构：语音层让路，专家大脑掌权",
    "自闭症干预有安全红线 —— 孩子听到的每一句话，都必须经过我们可控的专家矩阵。");

  // 流水线
  const flow = [
    ["输入", "孩子 / 家长说话", "玩具麦克风 · 小程序语音", PRIM],
    ["语音层", "ASR 听清 · TTS 说好", "云端百炼 / 自部署\nFunASR · CosyVoice 双轨", "7A8B8E"],
    ["大脑层", "多专家 Agent 矩阵", "场景理解 · 心理检索 · 儿童模拟\n观察 · 总结 · 小星玩伴", ACC],
    ["知识层", "RAG 循证知识库", "DSM-5 · 干预指南 · 专业语料", PRIM],
    ["输出", "回应 + emotion / action / alert", "驱动语音、灯效与家长预警", "4A7C59"],
  ];
  const fw = (W - 2 * M - 4 * 0.2) / 5;
  flow.forEach(([k, t, d, c], i) => {
    const x = M + i * (fw + 0.2);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: fw, h: 1.72, rectRadius: 0.09,
      fill: { color: c === ACC ? "FDF3E4" : "FFFFFF" },
      line: { color: i === 2 ? ACC : "EDE3D2", width: i === 2 ? 1.5 : 0.75 },
      shadow: shadow() });
    s.addText(k, { x: x + 0.16, y: y + 0.14, w: fw - 0.32, h: 0.26, fontSize: 10, bold: true,
      color: c, fontFace: F, charSpacing: 1.5, margin: 0 });
    s.addText(t, { x: x + 0.16, y: y + 0.44, w: fw - 0.32, h: 0.6, fontSize: 12.5, bold: true,
      color: INK, fontFace: F, margin: 0, lineSpacingMultiple: 1.18 });
    s.addText(d, { x: x + 0.16, y: y + 1.1, w: fw - 0.32, h: 0.5, fontSize: 9.5, color: MUTED,
      fontFace: F, margin: 0, lineSpacingMultiple: 1.2 });
    if (i < 4) arrow(s, x + fw + 0.02, y + 0.86, 0.16, PRIM2);
  });

  y += 2.06;
  const lw = (W - 2 * M) * 0.56;
  s.addText("为什么不是端到端黑盒？", { x: M, y, w: lw, h: 0.34, fontSize: 16, bold: true,
    color: INK, fontFace: F, margin: 0 });
  bullets(s, [
    "安全红线：孩子听到的每句话都必须经过循证专家矩阵，内容可控、可审计、有边界",
    "专业性即壁垒：级联架构让干预专业性沉淀在我们自己的矩阵与知识库里，而非交给通用模型自由发挥",
    "可替换性：语音层是商品化能力（云端 / 自部署 / 端侧随时切换），大脑层才是资产",
    "COSTAR Prompt 框架保证输出质量与责任边界；小星玩伴内置自伤 / 伤害线索识别 → 温柔安抚 + 家长预警",
  ], { x: M, y: y + 0.44, w: lw, h: 2.0, fontSize: 11.5, color: INK });

  // 端点
  const rx = M + lw + 0.4, rw = W - M - rx;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: rx, y: y - 0.1, w: rw, h: 2.44, rectRadius: 0.09,
    fill: { color: DARK }, line: { width: 0, color: DARK } });
  s.addText("玩具端一站式端点（已上线）", { x: rx + 0.28, y: y + 0.08, w: rw - 0.56, h: 0.3,
    fontSize: 12, bold: true, color: PRIM2, fontFace: F, margin: 0 });
  s.addText([
    { text: "POST /api/voice/turn", options: { color: ACC, fontFace: FN, bold: true, breakLine: true } },
    { text: "", options: { breakLine: true, fontSize: 6 } },
    { text: "音频进 → 一次返回：", options: { color: OND, fontSize: 11, breakLine: true } },
    { text: "heard · reply · audio(mp3) · emotion · action · alert", options: { color: ONDM, fontSize: 10.5, fontFace: FN, breakLine: true } },
    { text: "", options: { breakLine: true, fontSize: 6 } },
    { text: "固件只管调这一个端点，协议升级（HTTP → WebSocket/RTC）不影响大脑层。", options: { color: OND, fontSize: 10.5, breakLine: true } },
  ], { x: rx + 0.28, y: y + 0.44, w: rw - 0.56, h: 1.9, fontFace: F, margin: 0,
    valign: "top", lineSpacingMultiple: 1.25 });
  foot(s, "实现位置：app/api/voice/turn/route.ts · lib/voice.ts（端点可替换设计）· docs/VOICE_TOY.md");
  s.addNotes("如果被问「为什么不直接用豆包端到端」，答案在这页：专业内容的安全性不能外包。量产期用意图路由，闲聊走端到端，干预走级联。");
}

// ══════════════════════════════════════════════════════════════
// 14 · 第三步：一张网络（深色）
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(true);
  s.addText("STEP 3 · 一张网络", { x: M, y: 0.52, w: 8, h: 0.28, fontSize: 11, bold: true,
    color: PRIM2, charSpacing: 4, fontFace: F, margin: 0 });
  s.addText("从「我们服务家庭」，到「整个行业通过我们服务家庭」", { x: M, y: 0.96, w: 9.4, h: 0.6,
    fontSize: 30, bold: true, color: OND, fontFace: F, margin: 0 });
  s.addText("第三步不是新增一条业务线，而是把已经跑通的大脑开放出去 —— 让机构、专家、供应链都接在这张网络上。",
    { x: M, y: 1.62, w: 9.4, h: 0.4, fontSize: 14, color: ONDM, fontFace: F, margin: 0 });

  const cx = M + 3.55, cy = 3.55;
  s.addShape(pres.shapes.OVAL, { x: cx - 1.55, y: cy - 1.55, w: 3.1, h: 3.1,
    fill: { color: ACC }, line: { width: 0, color: ACC } });
  s.addText("星童猫咪\n专家大脑", { x: cx - 1.55, y: cy - 0.6, w: 3.1, h: 0.72, fontSize: 17,
    bold: true, color: "2B2721", fontFace: F, align: "center", valign: "middle", margin: 0,
    lineSpacingMultiple: 1.15 });
  s.addText("专家矩阵 · 循证知识库 · 数据飞轮", { x: cx - 1.8, y: cy + 0.2, w: 3.6, h: 0.4,
    fontSize: 10.5, color: "5A3F10", fontFace: F, align: "center", margin: 0 });

  const spokes = [
    ["康复机构", "AI 助教 SaaS", "家庭延伸干预工具 + 师训支持\n按席位 / 机构年费授权\n→ 缓解 30 万人才缺口", cx + 2.85, 2.1],
    ["专家网络", "内容共创与审校", "儿童心理 · 发展行为儿科\n持证康复师（BCBA 等）\n→ 专业背书与内容供给", cx + 2.85, 4.3],
    ["硬件供应链", "广东产业带 + ODM", "开源固件生态 + 成熟制造\n整机 BOM ¥60-100\n→ 快速迭代与成本优势", M, 4.3],
    ["家庭与社区", "10,000 组家庭", "真实场景语料脱敏回流\n口碑传播带来新家庭\n→ 越用越懂每个孩子", M, 2.1],
  ];
  spokes.forEach(([t, st, d, sx, sy]) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: sx, y: sy, w: 3.15, h: 1.5, rectRadius: 0.09,
      fill: { color: DARK2 }, line: { color: "2E464C", width: 1 } });
    s.addText(t, { x: sx + 0.24, y: sy + 0.16, w: 2.7, h: 0.3, fontSize: 14, bold: true,
      color: OND, fontFace: F, margin: 0 });
    s.addText(st, { x: sx + 0.24, y: sy + 0.48, w: 2.7, h: 0.26, fontSize: 11, bold: true,
      color: PRIM2, fontFace: F, margin: 0 });
    s.addText(d, { x: sx + 0.24, y: sy + 0.78, w: 2.7, h: 0.6, fontSize: 9.5, color: ONDM,
      fontFace: F, margin: 0, lineSpacingMultiple: 1.25 });
  });
  // 连接线
  s.addShape(pres.shapes.LINE, { x: cx + 1.55, y: cy - 0.85, w: 1.3, h: -0.6,
    line: { color: "3C5A60", width: 1, dashType: "dash" } });
  s.addShape(pres.shapes.LINE, { x: cx + 1.55, y: cy + 0.85, w: 1.3, h: 0.6,
    line: { color: "3C5A60", width: 1, dashType: "dash" } });
  s.addShape(pres.shapes.LINE, { x: M + 3.15, y: cy + 0.85, w: 1.3, h: 0.6,
    line: { color: "3C5A60", width: 1, dashType: "dash" } });
  s.addShape(pres.shapes.LINE, { x: M + 3.15, y: cy - 0.85, w: 1.3, h: -0.6,
    line: { color: "3C5A60", width: 1, dashType: "dash" } });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 6.1, w: W - 2 * M, h: 0.62, rectRadius: 0.08,
    fill: { color: "22383D" }, line: { color: "2E464C", width: 1 } });
  s.addText("终局：成为自闭症家庭干预的基础设施 —— 机构通过我们延伸服务，专家通过我们分发知识，家庭通过我们获得可负担的专业支持",
    { x: M + 0.32, y: 6.1, w: W - 2 * M - 0.64, h: 0.62, fontSize: 13, bold: true, color: OND,
      fontFace: F, valign: "middle", margin: 0 });
  foot(s, null, true);
  s.addNotes("第三步讲清楚「终局是什么」。重点是：开放大脑，而不是自己下场开机构、做工厂。");
}

// ══════════════════════════════════════════════════════════════
// 15 · 数据飞轮
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(false);
  let y = head(s, "FLYWHEEL · 增长引擎", "数据飞轮：越用越懂每一个星星的孩子",
    "硬件端数据是软件时代拿不到的部分 —— 日常生活场景的真实行为记录，构成长期竞争壁垒。");

  const steps = [
    ["①", "家庭使用 · 社区分享", "App 互动 + 小星日常陪伴；家长在社区沉淀真实干预案例", PRIM],
    ["②", "真实场景语料沉淀", "脱敏后的干预案例与行为数据；语料库扩充 + 持续微调", PRIM],
    ["③", "专家矩阵与模型迭代", "专家顾问团审校 + 领域语料微调（FT）+ 检索增强（RAG）", ACC],
    ["④", "更准的干预建议", "更贴合这个孩子的下一次建议 → 口碑传播，更多家庭加入", ACC],
  ];
  const sw = (W - 2 * M - 3 * 0.26) / 4;
  steps.forEach(([n, t, d, c], i) => {
    const x = M + i * (sw + 0.26);
    card(s, x, y, sw, 1.94, i > 1 ? "FDF3E4" : "FFFFFF");
    s.addText(n, { x: x + 0.26, y: y + 0.2, w: 0.6, h: 0.42, fontSize: 24, bold: true,
      color: c, fontFace: F, margin: 0 });
    s.addText(t, { x: x + 0.26, y: y + 0.72, w: sw - 0.52, h: 0.42, fontSize: 13.5, bold: true,
      color: INK, fontFace: F, margin: 0, lineSpacingMultiple: 1.15 });
    s.addText(d, { x: x + 0.26, y: y + 1.22, w: sw - 0.52, h: 0.56, fontSize: 10.5, color: MUTED,
      fontFace: F, margin: 0, lineSpacingMultiple: 1.25 });
    if (i < 3) arrow(s, x + sw + 0.02, y + 0.97, 0.22, PRIM2);
  });

  y += 2.16;
  // 回流箭头
  s.addText("④  →  ①　闭环：每一次交互都在让下一个家庭受益", { x: M, y, w: W - 2 * M, h: 0.34,
    fontSize: 13, bold: true, color: ACCT, fontFace: F, margin: 0 });

  y += 0.5;
  hair(s, M, y, W - 2 * M);
  y += 0.28;
  const lw = (W - 2 * M) * 0.47;
  s.addText("为什么这条飞轮别人转不起来", { x: M, y, w: lw, h: 0.32, fontSize: 15, bold: true,
    color: PRIM, fontFace: F, margin: 0 });
  bullets(s, [
    "数据只在真实家庭场景里产生：机构数据是一次评估，我们拿到的是一天 22 小时的连续行为",
    "合规即门槛：儿童语音属敏感个人信息，我们已按个保法设计「识别后即弃 + 一键删除」，后来者要重走一遍",
    "专业性与数据互相强化：越准的建议带来越多使用，越多使用带来越准的建议",
  ], { x: M, y: y + 0.4, w: lw, h: 1.5, fontSize: 11.5, color: INK });

  const rx = M + lw + 0.42, rw = W - M - rx;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: rx, y, w: rw, h: 1.86, rectRadius: 0.09,
    fill: { color: BG3 }, line: { color: "D5E4E6", width: 0.75 } });
  s.addText("隐私保护设计", { x: rx + 0.3, y: y + 0.18, w: rw - 0.6, h: 0.3, fontSize: 13,
    bold: true, color: PRIM, fontFace: F, margin: 0 });
  s.addText("特殊群体数据敏感，我们提供端侧 / 自部署选项：量产期可切换自部署 FunASR + CosyVoice，儿童语音不出内网 —— 这是 B 端机构采购的前提条件。",
    { x: rx + 0.3, y: y + 0.54, w: rw - 0.6, h: 1.1, fontSize: 11, color: MUTED, fontFace: F,
      margin: 0, lineSpacingMultiple: 1.32 });
  foot(s, null);
  s.addNotes("飞轮的核心不是「数据多」，是「数据独特」：客厅里的连续行为数据，只有硬件形态能拿到。");
}

// ══════════════════════════════════════════════════════════════
// 16 · 技术选型哲学
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(false);
  let y = head(s, "ENGINEERING · 技术选型", "自研只投在差异化上",
    "通用能力全部用成熟开源与云服务，团队的资源集中在专家矩阵、循证知识库与家长体验这三件只有我们能做的事上。");

  const rows = [
    ["AI 玩具固件", "接入生态", "xiaozhi-esp32（29.4k★）", "协议已兼容", "1"],
    ["ASR 语音识别", "双轨", "云端百炼 + FunASR 自部署（20k★）", "代码已支持", "1"],
    ["TTS 语音合成", "双轨", "云端百炼 + CosyVoice 自部署（23k★）", "代码已支持", "1"],
    ["音色克隆", "接入", "豆包声音复刻 / GPT-SoVITS（61k★）", "文档级", "0"],
    ["全双工通话", "量产引入", "火山 RTC + 豆包 SC2.0 / FireRedChat", "路线图", "0"],
    ["LLM 编排 / RAG 框架", "不用", "自研轻量实现（约 200 行，透明可控）", "已上线", "2"],
    ["小程序 UI 组件库", "不用", "自研温馨设计系统（奶油/蜜柑/雾青）", "已上线", "2"],
  ];
  const hdr = ["环节", "决策", "方案", "状态"];
  const colW = [2.5, 1.35, 5.0, 2.25];
  const tW = colW.reduce((a, b) => a + b, 0);
  const tbl = [hdr.map((h) => ({ text: h, options: { bold: true, color: "FFFFFF", fill: { color: PRIM }, fontSize: 11.5, fontFace: F, align: "left" } }))];
  rows.forEach(([a, b, c, d, k]) => {
    const fill = k === "2" ? "FDF3E4" : k === "1" ? "FFFFFF" : "F7F3EA";
    tbl.push([
      { text: a, options: { bold: true, color: INK, fontSize: 11, fontFace: F, fill: { color: fill } } },
      { text: b, options: { color: k === "2" ? ACCT : PRIM, bold: true, fontSize: 11, fontFace: F, fill: { color: fill } } },
      { text: c, options: { color: INK, fontSize: 10.5, fontFace: F, fill: { color: fill } } },
      { text: d, options: { color: MUTED, fontSize: 10.5, fontFace: F, fill: { color: fill } } },
    ]);
  });
  s.addTable(tbl, { x: M, y, w: tW, colW, border: { pt: 0.5, color: "E4DACB" },
    rowH: [0.36, 0.42, 0.42, 0.42, 0.42, 0.42, 0.42, 0.42], valign: "middle", margin: [4, 8, 4, 8] });

  y += 0.36 + 7 * 0.42 + 0.36;
  hair(s, M, y, W - 2 * M);
  y += 0.26;
  const res = [
    ["8 人月", "做出覆盖软件 + 硬件链路的全栈产品"],
    ["0 行", "从零编写的固件代码（基于开源生态）"],
    ["¥0", "花在通用能力上的自研成本"],
  ];
  const rw = (W - 2 * M - 2 * 0.3) / 3;
  res.forEach(([n, d], i) => {
    const x = M + i * (rw + 0.3);
    s.addText(n, { x, y, w: rw, h: 0.5, fontSize: 28, bold: true, color: ACC, fontFace: FN, margin: 0 });
    s.addText(d, { x, y: y + 0.48, w: rw - 0.2, h: 0.4, fontSize: 11.5, color: MUTED, fontFace: F,
      margin: 0, lineSpacingMultiple: 1.2 });
  });
  foot(s, "数据来源：GitHub API 实时检索（star 数为 2026-08-30 当日值）；完整决策清单见 docs/OPENSOURCE_STACK.md");
  s.addNotes("这页回答「你们小团队怎么做到的」。核心信息：每一行剩下的是「领钥匙」而不是「造轮子」。");
}

// ══════════════════════════════════════════════════════════════
// 17 · 儿童安全与合规
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(false);
  let y = head(s, "SAFETY & COMPLIANCE", "儿童安全与合规：这个品类的高压线",
    "面向特殊儿童的产品，安全不是加分项，是准入门槛。我们在架构层面就把红线设计进去了。");

  const items = [
    ["内容安全双层", "安全红线 Prompt 约束 + 量产期独立内容审核 API；小星玩伴识别自伤 / 伤害线索 → 温柔安抚 + alert 预警家长。", "4A7C59"],
    ["个保法合规", "儿童语音属敏感个人信息：采集需监护人明示同意（登录页勾选）· 原始音频识别后即弃（当前实现不落盘）· 提供一键删除孩子全部数据入口。", PRIM],
    ["防沉迷设计", "玩具定位是「家长干预的延伸」，不是电子保姆：默认每日对话上限 30 分钟，家长在小程序可调。", ACC],
    ["广告与诱导", "玩具端永远不出现消费引导；积分与付费只在家长端，孩子面对的只有一只猫。", "4A7C59"],
  ];
  const cw = (W - 2 * M - 0.3) / 2;
  items.forEach(([t, d, c], i) => {
    const x = M + (i % 2) * (cw + 0.3);
    const iy = y + Math.floor(i / 2) * 1.94;
    card(s, x, iy, cw, 1.72, "FFFFFF");
    s.addShape(pres.shapes.RECTANGLE, { x, y: iy + 0.24, w: 0.06, h: 1.24,
      fill: { color: c }, line: { width: 0, color: c } });
    s.addText(t, { x: x + 0.3, y: iy + 0.24, w: cw - 0.6, h: 0.34, fontSize: 15.5, bold: true,
      color: INK, fontFace: F, margin: 0 });
    s.addText(d, { x: x + 0.3, y: iy + 0.66, w: cw - 0.6, h: 0.9, fontSize: 11.5, color: MUTED,
      fontFace: F, margin: 0, lineSpacingMultiple: 1.3 });
  });

  y += 2 * 1.94 + 0.2;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y, w: W - 2 * M, h: 0.9, rectRadius: 0.08,
    fill: { color: BG2 }, line: { color: "E6DAC5", width: 0.75 } });
  s.addText("责任边界", { x: M + 0.32, y, w: 1.5, h: 0.9, fontSize: 13.5, bold: true, color: ACCT,
    fontFace: F, valign: "middle", margin: 0 });
  s.addText("产品定位为「家庭干预助手」，不做医学诊断、不替代专业治疗。全部干预内容由专家顾问团（儿童心理 / 发展行为儿科 / 持证 BCBA 康复师）审校，产品与医学建议之间设有清晰责任边界。当前知识库基于公开循证通识撰写，正式上线前完成审校。",
    { x: M + 1.9, y: y + 0.06, w: W - 2 * M - 2.3, h: 0.78, fontSize: 11.5, color: INK,
      fontFace: F, margin: 0, valign: "middle", lineSpacingMultiple: 1.3 });
  foot(s, "合规依据：《个人信息保护法》敏感个人信息处理规则；设计详见 docs/VOICE_TOY.md §4");
  s.addNotes("主动讲合规，是专业度的体现。投资人会问「儿童数据怎么处理」，这页提前答了。");
}

// ══════════════════════════════════════════════════════════════
// 18 · 技术时间轴
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(false);
  let y = head(s, "ROADMAP · 开发时间轴", "已交付什么，接下来 18 个月做什么",
    "上半部分是已经提交的代码，下半部分是可交付的里程碑 —— 每一步都对应具体的产出物。");

  // 已交付
  s.addText("已交付", { x: M, y, w: 1.4, h: 0.34, fontSize: 14, bold: true, color: ACC,
    fontFace: F, margin: 0 });
  tag(s, M + 1.0, y + 0.02, 1.5, 0.3, "GIT 已提交", "FDF3E4", ACCT, 10);
  y += 0.48;
  const done = [
    ["V1.1", "四大模块 + 7 专家 Agent 矩阵 + 温馨设计系统 + 登录体系"],
    ["V1.2", "积分商业化 Credits 全链路：注册赠送 · 消耗 · 充值 · 明细流水"],
    ["MP v1", "微信小程序原生工程：8 页全功能 + 真实微信 code2session 登录"],
    ["语音层", "ASR / TTS 接入 + 玩具端 /api/voice/turn 一站式端点（级联架构）"],
    ["选型", "开源方案接入：语音双轨（云端 / 自部署）+ xiaozhi 玩具生态"],
  ];
  const dw = (W - 2 * M - 4 * 0.22) / 5;
  done.forEach(([t, d], i) => {
    const x = M + i * (dw + 0.22);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: dw, h: 1.1, rectRadius: 0.07,
      fill: { color: "FFFFFF" }, line: { color: "EDE3D2", width: 0.75 } });
    s.addShape(pres.shapes.OVAL, { x: x + 0.2, y: y + 0.16, w: 0.2, h: 0.2,
      fill: { color: ACC }, line: { width: 0, color: ACC } });
    s.addText(t, { x: x + 0.5, y: y + 0.14, w: dw - 0.7, h: 0.26, fontSize: 11.5, bold: true,
      color: ACC, fontFace: F, margin: 0 });
    s.addText(d, { x: x + 0.2, y: y + 0.46, w: dw - 0.4, h: 0.54, fontSize: 9.5, color: MUTED,
      fontFace: F, margin: 0, lineSpacingMultiple: 1.22 });
    if (i < 4) s.addShape(pres.shapes.LINE, { x: x + dw + 0.01, y: y + 0.55, w: 0.2, h: 0,
      line: { color: HAIR, width: 1, endArrowType: "triangle" } });
  });

  y += 1.46;
  hair(s, M, y, W - 2 * M);
  y += 0.3;
  s.addText("未来 18 个月", { x: M, y, w: 1.8, h: 0.34, fontSize: 14, bold: true, color: PRIM,
    fontFace: F, margin: 0 });
  tag(s, M + 1.5, y + 0.02, 1.7, 0.3, "本轮融资覆盖", "EAF1F2", PRIM, 10);
  y += 0.52;

  // 时间轴
  const tl = [
    ["2026 Q4", "软件公测", ["小程序 v1.3 正式版上线", "云端语音接入 + 演练页语音模式", "专家顾问网络组建", "1000 个种子家庭打磨内容"], PRIM],
    ["2027 H1", "商业闭环", ["付费订阅上线，验证单位经济模型", "签约首批康复机构，SaaS 试点", "「小星」玩具打样（xiaozhi 固件）", "自闭症干预语料库 V1"], ACC],
    ["2027 H2", "硬件就绪", ["小星完成 3C 认证并开启预售", "全双工语音升级（豆包 SC2.0）", "「小星」品牌音色复刻", "签约机构累计 100 家"], PRIM],
    ["2028", "生态放大", ["AI 玩具量产上市", "数据飞轮全速运转", "专家矩阵与语料库迭代至 V2", "探索海外华语家庭市场"], "4A7C59"],
  ];
  const axisY = y + 0.9;
  s.addShape(pres.shapes.LINE, { x: M, y: axisY, w: W - 2 * M, h: 0,
    line: { color: HAIR, width: 1.5 } });
  const tw = (W - 2 * M) / 4;
  tl.forEach(([t, tt, items, c], i) => {
    const x = M + i * tw;
    // 节点
    s.addShape(pres.shapes.OVAL, { x: x + 0.1, y: axisY - 0.11, w: 0.22, h: 0.22,
      fill: { color: c }, line: { color: "FFFFFF", width: 2 } });
    // 上方：时间与标题
    s.addText(t, { x: x, y: y, w: tw - 0.2, h: 0.3, fontSize: 13.5, bold: true, color: c,
      fontFace: FN, margin: 0 });
    s.addText(tt, { x: x, y: y + 0.32, w: tw - 0.2, h: 0.3, fontSize: 12.5, bold: true,
      color: INK, fontFace: F, margin: 0 });
    // 下方：事项
    const isUp = i % 2 === 0;
    const iy = isUp ? axisY + 0.3 : axisY + 0.3;
    s.addShape(pres.shapes.LINE, { x: x + 0.205, y: axisY + 0.11, w: 0, h: 0.2,
      line: { color: HAIR, width: 1 } });
    bullets(s, items, { x: x, y: iy, w: tw - 0.25, h: 1.3, fontSize: 10, color: MUTED });
  });
  foot(s, "里程碑以本轮融资到位为起点；硬件量产节奏受 3C 认证与供应链周期影响，保留调整空间");
  s.addNotes("时间轴要诚实：已交付的部分可以打开 git log 给投资人看，未来的部分标注清楚依赖条件。");
}

// ══════════════════════════════════════════════════════════════
// 19 · 商业模式
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(false);
  let y = head(s, "BUSINESS MODEL", "三条收入线，从订阅到软硬一体",
    "路径设计：C 端订阅验证付费意愿 → B 端机构建立专业背书与渠道 → 硬件放大客单价与数据壁垒。三条线共用同一套专家矩阵与知识库，边际成本递减。");

  const lines = [
    ["C 端家庭订阅", "第一步 · 已跑通计费", PRIM, "EAF1F2", [
      ["定价参考", "App 会员制：孪生演练 + 系统课程 + 周报；积分制已上线（演练 5 分 / 课程 2 分 / 周报 3 分）"],
      ["价值锚点", "对标机构干预费用的零头 —— 机构年支出数万元，我们定在千元级"],
      ["验证状态", "微信登录 + 积分中心全部上线，付费通道已就绪"],
    ]],
    ["B 端机构 SaaS", "第三步 · 渠道与背书", "4A7C59", "EDF3EC", [
      ["产品形态", "康复机构的「AI 助教」：家庭延伸干预工具 + 师训支持"],
      ["收费方式", "按席位 / 机构年费授权"],
      ["战略价值", "缓解 30 万人才缺口；一家机构即一个获客入口"],
    ]],
    ["硬件 AI 玩具", "第二步 · 放大客单价", ACC, "FDF3E4", [
      ["收入结构", "硬件一次性销售 + ¥19-29 / 月大脑订阅"],
      ["已被验证", "「硬件 + 订阅制内容」模式由跃然创新（BubblePal）验证，获 2 亿元 A 轮"],
      ["转化逻辑", "软件订阅用户自然转化为硬件用户，硬件用户反哺数据飞轮"],
    ]],
  ];
  const cw = (W - 2 * M - 2 * 0.32) / 3;
  lines.forEach(([t, st, c, fill, rows], i) => {
    const x = M + i * (cw + 0.32);
    card(s, x, y, cw, 3.42, fill);
    s.addText(t, { x: x + 0.28, y: y + 0.22, w: cw - 0.56, h: 0.36, fontSize: 17, bold: true,
      color: INK, fontFace: F, margin: 0 });
    tag(s, x + 0.28, y + 0.66, 2.1, 0.3, st, c, "FFFFFF", 10);
    hair(s, x + 0.28, y + 1.08, cw - 0.56);
    rows.forEach(([k, v], j) => {
      const ry = y + 1.22 + j * 0.72;
      s.addText(k, { x: x + 0.28, y: ry, w: cw - 0.56, h: 0.24, fontSize: 10, bold: true,
        color: c, fontFace: F, charSpacing: 1, margin: 0 });
      s.addText(v, { x: x + 0.28, y: ry + 0.24, w: cw - 0.56, h: 0.46, fontSize: 10.5,
        color: INK, fontFace: F, margin: 0, lineSpacingMultiple: 1.24 });
    });
  });

  y += 3.72;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y, w: W - 2 * M, h: 0.8, rectRadius: 0.08,
    fill: { color: DARK }, line: { width: 0, color: DARK } });
  s.addText("一句话", { x: M + 0.32, y, w: 1.2, h: 0.8, fontSize: 13, bold: true, color: ACC,
    fontFace: F, valign: "middle", margin: 0 });
  s.addText("同一个孩子，家长在小程序里学方法，孩子在玩具上练方法，机构在后台看进展 —— 三个付费方，一套大脑，一份成本。",
    { x: M + 1.6, y, w: W - 2 * M - 2.0, h: 0.8, fontSize: 14, bold: true, color: OND,
      fontFace: F, valign: "middle", margin: 0 });
  foot(s, "对标与验证：跃然创新（BubblePal）A 轮 2 亿元（中金领投，2025）；央视财经（2025-11）");
  s.addNotes("三条线的关系要讲成「递进」而不是「并列」：C 端验证、B 端背书、硬件放大。");
}

// ══════════════════════════════════════════════════════════════
// 20 · 市场规模
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(false);
  let y = head(s, "MARKET SIZE", "从千亿家庭支出切入，聚焦可服务市场",
    "TAM / SAM / SOM 均为本团队基于公开数据的测算假设，可按路演口径调整 —— 我们更看重三年内可触达的那一万组家庭。");

  const tiers = [
    ["TAM", "1000 亿元 / 年", "中国自闭症家庭康复干预总支出", "约 300 万患儿家庭 × 年均干预支出 3 万元（假设值）", PRIM, 1.0],
    ["SAM", "300 亿元", "家庭端数字化干预 + AI 玩具交集", "AI 玩具 2025 年 290 亿元 + 数字疗法家庭端渗透（假设值）", ACC, 0.62],
    ["SOM", "3 亿元", "5 年目标：10 万付费家庭 ARPU", "10 万付费家庭 × 3000 元 / 年 ARPU（假设值）", "4A7C59", 0.3],
  ];
  // 嵌套矩形表示 TAM>SAM>SOM
  const rx = W - M - 4.3, ry = y + 0.1;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: rx, y: ry, w: 4.3, h: 2.3, rectRadius: 0.08,
    fill: { color: "EAF1F2" }, line: { width: 0, color: "EAF1F2" } });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: rx + 0.34, y: ry + 0.42, w: 3.62, h: 1.6,
    rectRadius: 0.07, fill: { color: "FDF3E4" }, line: { width: 0, color: "FDF3E4" } });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: rx + 0.68, y: ry + 0.86, w: 2.94, h: 0.72,
    rectRadius: 0.06, fill: { color: "EDF3EC" }, line: { width: 0, color: "EDF3EC" } });
  s.addText("TAM", { x: rx + 0.14, y: ry + 0.1, w: 1, h: 0.26, fontSize: 11, bold: true,
    color: PRIM, fontFace: FN, margin: 0 });
  s.addText("SAM", { x: rx + 0.48, y: ry + 0.52, w: 1, h: 0.26, fontSize: 11, bold: true,
    color: ACCT, fontFace: FN, margin: 0 });
  s.addText("SOM · 5 年", { x: rx + 0.82, y: ry + 0.96, w: 1.6, h: 0.26, fontSize: 11, bold: true,
    color: "4A7C59", fontFace: FN, margin: 0 });
  s.addText("3 亿元", { x: rx + 0.82, y: ry + 1.18, w: 2.7, h: 0.36, fontSize: 20, bold: true,
    color: "2F5C3A", fontFace: FN, margin: 0 });

  const lw = W - 2 * M - 4.8;
  tiers.forEach(([k, v, t, d, c], i) => {
    const ty = y + i * 0.92;
    s.addText(k, { x: M, y: ty + 0.02, w: 0.8, h: 0.3, fontSize: 13, bold: true, color: c,
      fontFace: FN, margin: 0 });
    s.addText(v, { x: M + 0.9, y: ty - 0.06, w: 2.6, h: 0.42, fontSize: 24, bold: true,
      color: INK, fontFace: FN, margin: 0 });
    s.addText(t, { x: M + 3.5, y: ty + 0.02, w: lw - 3.5, h: 0.3, fontSize: 12.5, bold: true,
      color: INK, fontFace: F, margin: 0 });
    s.addText(d, { x: M + 3.5, y: ty + 0.34, w: lw - 3.5, h: 0.46, fontSize: 10, color: MUTED,
      fontFace: F, margin: 0, lineSpacingMultiple: 1.2 });
  });

  y += 2.92;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y, w: W - 2 * M, h: 1.24, rectRadius: 0.09,
    fill: { color: DARK }, line: { width: 0, color: DARK } });
  s.addText("三年目标（本轮融资要交付的）", { x: M + 0.34, y: y + 0.14, w: 4, h: 0.3,
    fontSize: 12, bold: true, color: PRIM2, fontFace: F, margin: 0 });
  s.addText("10,000 组付费家庭", { x: M + 0.34, y: y + 0.44, w: 4, h: 0.56, fontSize: 30,
    bold: true, color: ACC, fontFace: FN, margin: 0 });
  s.addText("10,000 组家庭 × 3,000 元 / 年 ARPU ≈ 3,000 万元年收入　——　这是 SOM（5 年 10 万家庭 / 3 亿元）的第一个十分之一，也是我们要先证明的那一段。",
    { x: M + 4.5, y: y + 0.2, w: W - 2 * M - 4.9, h: 0.86, fontSize: 13, color: OND,
      fontFace: F, margin: 0, valign: "middle", lineSpacingMultiple: 1.35 });
  foot(s, "数据来源：中商产业研究院（2025）；智研咨询（2024-12）；TAM / SAM / SOM 为本团队基于公开数据的测算假设");
  s.addNotes("口径说清楚：TAM/SAM/SOM 是假设测算，三年一万家庭才是本轮的硬承诺。答辩时优先讲后者。");
}

// ══════════════════════════════════════════════════════════════
// 21 · 竞争格局
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(false);
  let y = head(s, "COMPETITION", "错位竞争：专业干预 × AI 个性化的空白带",
    "机构连锁专业但贵且不进家庭；线上平台便宜但缺乏个性化与陪伴；通用 AI 玩具有场景但没有干预专业性。");

  const hdr = ["玩家", "干预专业性", "家庭场景", "AI 个性化", "硬件形态", "价格门槛"];
  const colW = [3.2, 1.85, 1.6, 1.6, 1.5, 1.35];
  const rows = [
    ["大米和小米等机构连锁", "强（线下康复）", "弱（以机构为主）", "弱", "无", "高", 0],
    ["恩启 / ALSOLIFE 等线上平台", "中（课程与评估）", "中", "弱-中", "无", "中", 0],
    ["通用 AI 玩具（跃然 BubblePal 等）", "弱（泛陪伴）", "强", "中", "有", "低", 0],
    ["星童猫咪（本项目）", "强（专家矩阵 + 循证库）", "强（家庭即主场）", "强（档案级个性化）", "原型已就绪", "低", 1],
  ];
  const tbl = [hdr.map((h) => ({ text: h, options: { bold: true, color: "FFFFFF", fill: { color: PRIM }, fontSize: 11.5, fontFace: F, align: "left" } }))];
  rows.forEach((r) => {
    const mine = r[6] === 1;
    const fill = mine ? "EAF1F2" : "FFFFFF";
    tbl.push(r.slice(0, 6).map((cell) => ({
      text: cell,
      options: { color: mine ? INK : MUTED, bold: mine, fontSize: mine ? 11.5 : 11,
        fontFace: F, fill: { color: fill } },
    })));
  });
  s.addTable(tbl, { x: M, y, w: colW.reduce((a, b) => a + b, 0), colW,
    border: { pt: 0.5, color: "E4DACB" }, rowH: [0.4, 0.52, 0.52, 0.52, 0.52],
    valign: "middle", margin: [5, 9, 5, 9] });

  y += 0.4 + 4 * 0.52 + 0.44;
  hair(s, M, y, W - 2 * M);
  y += 0.28;
  const adv = [
    ["专业性是架构级的", "8 位专家 Agent + 循证 RAG 不是内容包装，是代码里的真实编排（lib/agents.ts），可审计可迭代"],
    ["个性化是档案级的", "基于星星档案生成个性化「数字孪生」交互对象，每个孩子对应一个不同的模拟者"],
    ["硬件是通路不是噱头", "玩具是让干预进入孩子日常的唯一形态，也是拿不到的数据来源"],
  ];
  const cw = (W - 2 * M - 2 * 0.32) / 3;
  adv.forEach(([t, d], i) => {
    const x = M + i * (cw + 0.32);
    s.addShape(pres.shapes.OVAL, { x, y: y + 0.04, w: 0.16, h: 0.16, fill: { color: ACC },
      line: { width: 0, color: ACC } });
    s.addText(t, { x: x + 0.3, y, w: cw - 0.3, h: 0.3, fontSize: 13.5, bold: true, color: INK,
      fontFace: F, margin: 0 });
    s.addText(d, { x: x, y: y + 0.38, w: cw, h: 0.7, fontSize: 10.5, color: MUTED, fontFace: F,
      margin: 0, lineSpacingMultiple: 1.28 });
  });
  foot(s, "竞争信息依据公开资料与产品实测整理（2026-08）");
  s.addNotes("不要贬低竞品。定位是「三者交集的空白带」，强调我们是唯一同时具备专业性与家庭场景的。");
}

// ══════════════════════════════════════════════════════════════
// 22 · 三年一万家庭（目标推导）
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(false);
  let y = head(s, "THE GOAL", "三年，一万组家庭",
    "这不是一个愿望，是一个可以拆解到底的获客模型。每一组家庭从哪条渠道来，我们算得清楚。");

  // 左侧：柱状图
  const cw = 7.0;
  card(s, M, y, cw, 3.66, "FFFFFF");
  s.addText("累计服务家庭数（年末口径）", { x: M + 0.3, y: y + 0.18, w: cw - 0.6, h: 0.3,
    fontSize: 13, bold: true, color: PRIM, fontFace: F, margin: 0 });
  s.addChart(pres.charts.BAR, [{
    name: "累计服务家庭",
    labels: ["2026 H2\n种子期", "2027\n付费闭环", "2028\n硬件放量", "2029\n生态放大"],
    values: [1000, 3000, 6000, 10000],
  }], {
    x: M + 0.16, y: y + 0.54, w: cw - 0.32, h: 2.9, barDir: "col",
    varyColors: true, chartColors: [PRIM2, PRIM2, ACC, ACC],
    chartArea: { fill: { color: "FFFFFF" } }, plotArea: { fill: { color: "FFFFFF" } },
    catAxisLabelColor: MUTED, valAxisLabelColor: MUTED,
    catAxisLabelFontFace: F, valAxisLabelFontFace: FN,
    catAxisLabelFontSize: 10, valAxisLabelFontSize: 9.5,
    valGridLine: { color: "EFE7DA", size: 0.5 }, catGridLine: { style: "none" },
    showValue: true, dataLabelPosition: "outEnd", dataLabelColor: INK,
    dataLabelFontSize: 11.5, dataLabelFontBold: true, dataLabelFontFace: FN,
    showLegend: false, barGapWidthPct: 90,
  });

  // 右侧：渠道拆解
  const rx = M + cw + 0.36, rw = W - M - rx;
  s.addText("达成一万时的来源构成", { x: rx, y: y + 0.02, w: rw, h: 0.34, fontSize: 14,
    bold: true, color: PRIM, fontFace: F, margin: 0 });
  const ch = [
    ["机构渠道", "6,000", "100 家签约机构 × 平均 150 组在册家庭 × 40% 付费转化", ACC],
    ["线上与口碑", "3,000", "小程序自然流量 + 家长社区口碑 + 短视频内容获客", PRIM],
    ["硬件首发", "1,000", "小星玩具首批预售，软硬一体打包转化", "4A7C59"],
  ];
  let cy = y + 0.46;
  ch.forEach(([t, n, d, c]) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: rx, y: cy, w: rw, h: 1.02, rectRadius: 0.08,
      fill: { color: "FFFFFF" }, line: { color: "EDE3D2", width: 0.75 } });
    s.addText(n, { x: rx + 0.24, y: cy + 0.14, w: 1.5, h: 0.4, fontSize: 21, bold: true,
      color: c, fontFace: FN, margin: 0 });
    s.addText(t, { x: rx + 1.8, y: cy + 0.16, w: rw - 2.0, h: 0.3, fontSize: 12.5, bold: true,
      color: INK, fontFace: F, margin: 0, valign: "middle" });
    s.addText(d, { x: rx + 0.24, y: cy + 0.6, w: rw - 0.48, h: 0.34, fontSize: 9.5,
      color: MUTED, fontFace: F, margin: 0, lineSpacingMultiple: 1.2 });
    cy += 1.12;
  });

  y += 3.94;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y, w: W - 2 * M, h: 0.86, rectRadius: 0.08,
    fill: { color: BG2 }, line: { color: "E6DAC5", width: 0.75 } });
  s.addText("为什么这个数可信", { x: M + 0.32, y, w: 2.2, h: 0.86, fontSize: 13.5, bold: true,
    color: ACCT, fontFace: F, valign: "middle", margin: 0 });
  s.addText("主渠道是 B 端机构而非买量 —— 一家康复机构天然握着上百组精准家庭，SaaS 是渠道而非单纯收入线。CAC 因此可控，不依赖投放预算。",
    { x: M + 2.6, y: y + 0.06, w: W - 2 * M - 3.0, h: 0.74, fontSize: 12.5, color: INK,
      fontFace: F, margin: 0, valign: "middle", lineSpacingMultiple: 1.32 });
  foot(s, "机构规模、转化率与线上获客系数为本团队测算假设，随试点数据滚动修正");
  s.addNotes("这一页是全篇最重要的数字页。机构渠道是关键假设，答辩时要能说清「为什么机构愿意签约」：他们缺延伸工具，我们免费降低师训成本。");
}

// ══════════════════════════════════════════════════════════════
// 23 · 融资需求
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(false);
  let y = head(s, "THE ASK", "本轮融资：把 Demo 变成生意",
    "软件已经跑通，硬件链路已经打通。这 300 万要买的不是探索，是把已验证的东西放大到一万组家庭。");

  // 左侧：金额
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y, w: 3.5, h: 2.5, rectRadius: 0.1,
    fill: { color: DARK }, line: { width: 0, color: DARK } });
  s.addText("本轮融资", { x: M + 0.34, y: y + 0.26, w: 2.8, h: 0.3, fontSize: 12.5,
    bold: true, color: PRIM2, fontFace: F, margin: 0 });
  s.addText("300", { x: M + 0.34, y: y + 0.6, w: 2.2, h: 0.8, fontSize: 56, bold: true,
    color: ACC, fontFace: FN, margin: 0 });
  s.addText("万元", { x: M + 1.62, y: y + 0.94, w: 1.2, h: 0.4, fontSize: 20, bold: true,
    color: OND, fontFace: F, margin: 0 });
  s.addText("天使轮 · 出让 10%", { x: M + 0.34, y: y + 1.5, w: 2.8, h: 0.32, fontSize: 13.5,
    bold: true, color: OND, fontFace: F, margin: 0 });
  s.addText("18 个月跑道", { x: M + 0.34, y: y + 1.9, w: 2.8, h: 0.3, fontSize: 11.5,
    color: ONDM, fontFace: F, margin: 0 });

  // 资金用途图
  const px = M + 3.76, pwi = 3.5;
  s.addText("资金用途", { x: px, y: y + 0.02, w: pwi, h: 0.3, fontSize: 13, bold: true,
    color: PRIM, fontFace: F, margin: 0 });
  s.addChart(pres.charts.DOUGHNUT, [{
    name: "资金用途",
    labels: ["产品研发 40%", "硬件供应链 25%", "内容与专家网络 20%", "市场与运营 15%"],
    values: [40, 25, 20, 15],
  }], {
    x: px, y: y + 0.34, w: pwi, h: 2.16,
    chartColors: [PRIM, ACC, "4A7C59", PRIM2],
    showLegend: true, legendPos: "r", legendColor: MUTED, legendFontSize: 10, legendFontFace: F,
    showPercent: true, dataLabelColor: "FFFFFF", dataLabelFontSize: 10, dataLabelFontFace: FN,
    holeSize: 52, chartArea: { fill: { color: BG } },
  });

  // 里程碑
  const mx = M + 7.6, mw = W - M - mx;
  s.addText("18 个月里程碑", { x: mx, y: y + 0.02, w: mw, h: 0.3, fontSize: 13, bold: true,
    color: PRIM, fontFace: F, margin: 0 });
  const ms = [
    "小程序正式版上线，付费家庭达 1 万",
    "签约 100 家康复机构，完成 SaaS 试点",
    "AI 玩具完成打样、3C 认证并开启预售",
    "干预语料库与专家矩阵迭代至 V2",
  ];
  ms.forEach((t, i) => {
    const my = y + 0.44 + i * 0.5;
    s.addShape(pres.shapes.OVAL, { x: mx, y: my + 0.09, w: 0.16, h: 0.16,
      fill: { color: ACC }, line: { width: 0, color: ACC } });
    s.addText(t, { x: mx + 0.3, y: my, w: mw - 0.3, h: 0.42, fontSize: 11.5, color: INK,
      fontFace: F, margin: 0, valign: "middle", lineSpacingMultiple: 1.2 });
  });

  y += 2.78;
  hair(s, M, y, W - 2 * M);
  y += 0.26;
  const use = [
    ["产品研发 40%", "语音全双工升级 · 专家矩阵 V2 · 端侧 / 自部署选项"],
    ["硬件供应链 25%", "小星打样 · 3C 认证 · 首批量产备货"],
    ["内容与专家网络 20%", "专家顾问团审校 · 语料库扩充至 V1 · 课程扩容"],
    ["市场与运营 15%", "种子家庭运营 · 机构 BD · 品牌与内容获客"],
  ];
  const uw = (W - 2 * M - 3 * 0.28) / 4;
  use.forEach(([t, d], i) => {
    const x = M + i * (uw + 0.28);
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: uw, h: 0.06,
      fill: { color: [PRIM, ACC, "4A7C59", PRIM2][i] }, line: { width: 0, color: [PRIM, ACC, "4A7C59", PRIM2][i] } });
    s.addText(t, { x, y: y + 0.18, w: uw, h: 0.3, fontSize: 12.5, bold: true, color: INK,
      fontFace: F, margin: 0 });
    s.addText(d, { x, y: y + 0.5, w: uw - 0.1, h: 0.6, fontSize: 10, color: MUTED, fontFace: F,
      margin: 0, lineSpacingMultiple: 1.24 });
  });
  foot(s, "资金用途比例为示意分配，最终以融资协议与预算为准");
  s.addNotes("300 万 / 10% = 投后 3000 万。如果问估值锚，对标跃然创新 A 轮量级，说明天使轮定价留有大幅上行空间。");
}

// ══════════════════════════════════════════════════════════════
// 24 · 团队
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(false);
  let y = head(s, "TEAM", "懂技术，更懂这个人群",
    "技术、产品与商务的完整配置；专业内容由专家顾问团审校，产品与医学建议之间设有清晰的责任边界。");

  const members = [
    ["张程", "CEO / CTO", "40%", "哈工大人工智能研究院 · 全栈工程师、连续创业者", ACC],
    ["陈婉仪", "联合创始人", "20%", "美国印第安纳大学本硕 · 计算机", PRIM],
    ["高骏杰", "联合创始人", "20%", "本科宾夕法尼亚州立大学（PSU）· 硕士哥伦比亚大学", PRIM],
    ["期权池", "未来团队 / 顾问", "20%", "核心技术与商务人才激励", "7A8B8E"],
  ];
  const cw = (W - 2 * M - 3 * 0.3) / 4;
  members.forEach(([n, r, p, d, c], i) => {
    const x = M + i * (cw + 0.3);
    card(s, x, y, cw, 2.36, "FFFFFF");
    s.addShape(pres.shapes.OVAL, { x: x + 0.28, y: y + 0.28, w: 0.62, h: 0.62,
      fill: { color: c }, line: { width: 0, color: c } });
    s.addText(n[0], { x: x + 0.28, y: y + 0.28, w: 0.62, h: 0.62, fontSize: 20, bold: true,
      color: "FFFFFF", fontFace: F, align: "center", valign: "middle", margin: 0 });
    s.addText(n, { x: x + 1.04, y: y + 0.32, w: cw - 1.32, h: 0.32, fontSize: 16, bold: true,
      color: INK, fontFace: F, margin: 0 });
    s.addText(r, { x: x + 1.04, y: y + 0.64, w: cw - 1.32, h: 0.26, fontSize: 11, color: c,
      bold: true, fontFace: F, margin: 0 });
    s.addText(p, { x: x + cw - 1.0, y: y + 0.34, w: 0.72, h: 0.5, fontSize: 22, bold: true,
      color: c, fontFace: FN, align: "right", margin: 0 });
    hair(s, x + 0.28, y + 1.14, cw - 0.56);
    s.addText(d, { x: x + 0.28, y: y + 1.3, w: cw - 0.56, h: 0.84, fontSize: 11, color: MUTED,
      fontFace: F, margin: 0, lineSpacingMultiple: 1.3 });
  });

  y += 2.64;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y, w: W - 2 * M, h: 1.34, rectRadius: 0.09,
    fill: { color: BG3 }, line: { color: "D5E4E6", width: 0.75 } });
  s.addText("专家顾问网络（组建中）", { x: M + 0.34, y: y + 0.16, w: 3.4, h: 0.32,
    fontSize: 14, bold: true, color: PRIM, fontFace: F, margin: 0 });
  const adv = [
    ["儿童心理 / 发展行为儿科", "内容审校与专业背书"],
    ["持证康复师（BCBA 等）", "干预方法与课程体系把关"],
    ["硬件供应链合伙人", "量产、认证与成本管理"],
  ];
  const aw = (W - 2 * M - 0.68) / 3;
  adv.forEach(([t, d], i) => {
    const ax = M + 0.34 + i * aw;
    s.addText(t, { x: ax, y: y + 0.58, w: aw - 0.2, h: 0.3, fontSize: 12, bold: true,
      color: INK, fontFace: F, margin: 0 });
    s.addText(d, { x: ax, y: y + 0.88, w: aw - 0.2, h: 0.3, fontSize: 10.5, color: MUTED,
      fontFace: F, margin: 0 });
  });
  foot(s, null);
  s.addNotes("团队页要补创始人动机：为什么是你们做这件事。口述补充，不放进 PPT。");
}

// ══════════════════════════════════════════════════════════════
// 25 · 结尾（深色）
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(true);
  s.addShape(pres.shapes.OVAL, { x: -2.2, y: -2.2, w: 7.2, h: 7.2, fill: { color: DARK2 } });
  s.addShape(pres.shapes.OVAL, { x: 8.8, y: 3.6, w: 7.2, h: 7.2, fill: { color: DARK2 } });

  s.addText("C A R E   ·   A U T I S M   T O G E T H E R", { x: M, y: 1.5, w: W - 2 * M,
    h: 0.3, fontSize: 11, bold: true, color: PRIM2, charSpacing: 4, fontFace: F,
    align: "center", margin: 0 });
  s.addText("让每一颗星星", { x: M, y: 2.16, w: W - 2 * M, h: 0.9, fontSize: 48, bold: true,
    color: OND, fontFace: F, align: "center", margin: 0 });
  s.addText("都被温柔地看见", { x: M, y: 3.0, w: W - 2 * M, h: 0.9, fontSize: 48, bold: true,
    color: ACC, fontFace: F, align: "center", margin: 0 });

  hair(s, W / 2 - 2.6, 4.3, 5.2, true);

  s.addText("星童猫咪团队 · 三年，一万组家庭", { x: M, y: 4.58, w: W - 2 * M, h: 0.42,
    fontSize: 19, bold: true, color: OND, fontFace: F, align: "center", margin: 0 });
  s.addText("从 2 小时的专家在场，到 24 小时的温柔陪伴", { x: M, y: 5.1, w: W - 2 * M, h: 0.36,
    fontSize: 14, color: ONDM, fontFace: F, align: "center", margin: 0 });

  s.addText("Peter 张程 · +86 13159877586 / +852 44358635", { x: M, y: 6.1, w: W - 2 * M,
    h: 0.32, fontSize: 13, color: OND, fontFace: F, align: "center", margin: 0 });
  s.addText("github.com/zhangcheng0688/xingtong-cat", { x: M, y: 6.44, w: W - 2 * M, h: 0.3,
    fontSize: 11, color: "6E8488", fontFace: FN, align: "center", margin: 0 });
  foot(s, null, true);
  s.addNotes("结尾不要多说。念完这句话，停两秒，等对方开口。");
}

// ── 输出 ────────────────────────────────────────────────────
const out = path.join(__dirname, "星童猫咪-融资路演-2026.pptx");
pres.writeFile({ fileName: out }).then(() => {
  console.log("OK →", out);
  console.log("slides:", pres.slides.length);
});
