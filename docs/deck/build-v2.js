// 星童猫咪 · 2026 商业计划书 v2（10-15 页压缩版 · 使命先行）
// node build-v2.js  →  星童猫咪-商业计划书-2026-v2.pptx
const pptxgen = require("pptxgenjs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.author = "星童猫咪团队";
pres.company = "星童猫咪";
pres.title = "星童猫咪 · 2026 商业计划书 v2";

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
const GREEN = "4A7C59";

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
// 01 · 封面（深色 · 使命先行）
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(true);
  s.addShape(pres.shapes.OVAL, { x: -2.4, y: -2.6, w: 7.6, h: 7.6, fill: { color: DARK2 }, line: { width: 0, color: DARK2 } });
  s.addShape(pres.shapes.OVAL, { x: 9.6, y: 4.4, w: 6.4, h: 6.4, fill: { color: DARK2 }, line: { width: 0, color: DARK2 } });

  s.addText("XINGTONG CAT · BUSINESS PLAN 2026", { x: M, y: 0.72, w: 7.5, h: 0.3,
    fontSize: 11, bold: true, color: PRIM2, charSpacing: 4, fontFace: F, margin: 0 });
  s.addText("让每颗星星", { x: M, y: 1.5, w: 8.2, h: 1.0, fontSize: 52, bold: true,
    color: OND, fontFace: F, margin: 0 });
  s.addText("都被温柔听懂", { x: M, y: 2.5, w: 8.2, h: 1.0, fontSize: 52, bold: true,
    color: ACC, fontFace: F, margin: 0 });
  s.addText("AI 驱动的自闭症家庭干预伙伴 —— 一个大脑，连接小程序、课程与玩具",
    { x: M, y: 3.72, w: 8.0, h: 0.4, fontSize: 15, color: ONDM, fontFace: F, margin: 0 });

  // 使命徽章
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 4.5, w: 4.9, h: 0.62, rectRadius: 0.31,
    fill: { color: ACC }, line: { width: 0, color: ACC } });
  s.addText("使命 · 三年服务 10,000 组自闭症家庭", { x: M, y: 4.5, w: 4.9, h: 0.62,
    fontSize: 14.5, bold: true, color: "2B2721", fontFace: F, align: "center",
    valign: "middle", margin: 0 });

  s.addText("微信小程序 · 多专家 Agent 矩阵 · 循环干预课程 · AI 玩具「小星」",
    { x: M, y: 5.5, w: 8.0, h: 0.34, fontSize: 12.5, color: OND, fontFace: F, margin: 0 });
  s.addText("全栈千问 × LangChain 稳定层 × RAGFlow 循证引擎 · 全链路已跑通",
    { x: M, y: 5.9, w: 8.0, h: 0.3, fontSize: 11, color: ONDM, fontFace: F, margin: 0 });

  // 新 IP 形象（透明底，深色背景上琥珀发光）
  s.addImage({ path: IMG("ip2.png"), x: 9.35, y: 1.7, w: 3.3, h: 3.06 });

  s.addText("星童猫咪团队", { x: M, y: 6.7, w: 4, h: 0.3, fontSize: 12, bold: true,
    color: ONDM, fontFace: F, margin: 0 });
  foot(s, null, true);
  s.addNotes("开场只讲一句话：我们要让每一颗星星都被温柔听懂。三年一万组家庭，是我们对这件事的量化承诺。");
}

// ══════════════════════════════════════════════════════════════
// 02 · 使命：为什么是我们，为什么是现在
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(false);
  let y = head(s, "MISSION · 使命", "把专业干预，带进每一个普通家庭",
    "他们被称为「星星的孩子」。我们相信：AI 第一次让「专业级的家庭干预」摆脱稀缺供给，成为每个家庭都负担得起的日常。");

  // 左侧使命陈述
  const lw = 6.1;
  card(s, M, y, lw, 2.9, BG2);
  s.addText("我们为什么存在", { x: M + 0.32, y: y + 0.24, w: lw - 0.64, h: 0.34,
    fontSize: 14, bold: true, color: ACCT, fontFace: F, margin: 0 });
  s.addText("确诊之后的头三年是干预的黄金窗口，但专业资源卡在城市、卡在价格、卡在排期。家长才是最了解孩子的人，却最不被赋能。",
    { x: M + 0.32, y: y + 0.66, w: lw - 0.64, h: 0.94, fontSize: 12.5, color: INK,
      fontFace: F, margin: 0, lineSpacingMultiple: 1.4 });
  s.addText("星童猫咪把「专家的方法」编译进 AI：家长在小程序里演练，孩子在玩具上练习，家庭第一次成为干预的主场。",
    { x: M + 0.32, y: y + 1.68, w: lw - 0.64, h: 1.0, fontSize: 12.5, bold: true,
      color: PRIM, fontFace: F, margin: 0, lineSpacingMultiple: 1.4 });

  // 右侧三个大数字
  const rx = M + lw + 0.4, rw = W - M - rx;
  const nums = [
    ["1 / 36", "美国 CDC（2025）儿童确诊比例，筛查普及后仍在上升"],
    ["300-500 万", "中国 0-14 岁自闭症儿童（行业报告口径）"],
    ["1300 万+", "中国谱系障碍人群总数（中国残联 2023 普查口径）"],
  ];
  nums.forEach(([n, d], i) => {
    const ny = y + i * 0.99;
    if (i > 0) hair(s, rx, ny - 0.06, rw);
    s.addText(n, { x: rx, y: ny, w: 2.9, h: 0.62, fontSize: 36, bold: true,
      color: i === 0 ? ACC : PRIM, fontFace: FN, margin: 0 });
    s.addText(d, { x: rx + 3.0, y: ny + 0.06, w: rw - 3.0, h: 0.72, fontSize: 11.5,
      color: MUTED, fontFace: F, margin: 0, valign: "middle", lineSpacingMultiple: 1.3 });
  });

  // 底部使命带
  y += 3.24;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y, w: W - 2 * M, h: 1.7, rectRadius: 0.1,
    fill: { color: DARK }, line: { width: 0, color: DARK } });
  s.addText("三年 · 10,000 组家庭", { x: M + 0.4, y: y + 0.24, w: 5.4, h: 0.5, fontSize: 26,
    bold: true, color: ACC, fontFace: F, margin: 0 });
  s.addText("十年 · 成为百万家庭的日常伙伴", { x: M + 0.4, y: y + 0.84, w: 5.4, h: 0.4,
    fontSize: 16, bold: true, color: OND, fontFace: F, margin: 0 });
  s.addText("一万组家庭不是市场规模的零头，而是一套可以被拆解、被验证、被复制的家庭干预新范式 —— 谁先证明它，谁就定义这个品类。",
    { x: M + 6.3, y: y + 0.28, w: W - 2 * M - 6.8, h: 1.2, fontSize: 13, color: ONDM,
      fontFace: F, margin: 0, valign: "middle", lineSpacingMultiple: 1.45 });
  foot(s, "数据来源：美国 CDC（2025）；《中国自闭症教育康复行业发展状况报告》；中国残联 2023 年残疾人普查");
  s.addNotes("使命页不念稿。右侧三个数字讲完停顿一下，再点底部：一万家庭是可拆解的范式，不是口号。");
}

// ══════════════════════════════════════════════════════════════
// 03 · 痛点：家庭干预，卡在「人」上
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(false);
  let y = head(s, "PROBLEM · 痛点", "方法不缺，缺的是能把方法带进家庭的人",
    "三组数字，说明这个缺口有多深 —— 二十年来没有结构性改善。");

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
  s.addText("30 万", { x: rx, y: y + 0.05, w: 2.6, h: 0.56, fontSize: 31, bold: true,
    color: PRIM, fontFace: FN, margin: 0 });
  s.addText("康复人才缺口", { x: rx + 2.7, y: y + 0.16, w: rw - 2.7, h: 0.44, fontSize: 13,
    bold: true, color: INK, fontFace: F, margin: 0, valign: "middle" });
  s.addText("40 小时/周", { x: rx, y: y + 0.75, w: 2.6, h: 0.56, fontSize: 31, bold: true,
    color: PRIM, fontFace: FN, margin: 0 });
  s.addText("最低干预强度，需持续 2-3 年", { x: rx + 2.7, y: y + 0.86, w: rw - 2.7, h: 0.44,
    fontSize: 13, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle" });
  s.addText("52.4%", { x: rx, y: y + 1.45, w: 2.6, h: 0.56, fontSize: 31, bold: true,
    color: PRIM, fontFace: FN, margin: 0 });
  s.addText("家庭有一人放弃工作全职照看", { x: rx + 2.7, y: y + 1.56, w: rw - 2.7, h: 0.44,
    fontSize: 13, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle" });

  y += 2.86;
  hair(s, M, y, W - 2 * M);
  y += 0.3;

  const pain = [
    ["家长不懂", "孩子不愿沟通、家长难以共情；不合理的干预反而加剧病情，身心与经济双重承压。"],
    ["机构贵且远", "机构年支出数万元，超半数家庭难以承担；且干预发生在机构，不在孩子真实的生活场景。"],
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
  s.addNotes("1:2500 与 1:130 两个口径基数不同，主动说明。落点：缺口在「人」，所以解法必须绕过「人」的稀缺。");
}

// ══════════════════════════════════════════════════════════════
// 04 · 解决方案：一个 AI 大脑 × 三个入口
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(false);
  let y = head(s, "SOLUTION · 解决方案", "同一个 AI 大脑，三个触达家庭的入口",
    "家长先学会教，孩子再日常练 —— 软件与硬件共用一套专家矩阵与循证知识库，边际成本递减。");

  // 中央大脑
  const cw2 = 4.5, cx = (W - cw2) / 2;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: cx, y: y + 0.1, w: cw2, h: 1.62, rectRadius: 0.12,
    fill: { color: DARK }, line: { width: 0, color: DARK }, shadow: shadow() });
  s.addText("星童大脑", { x: cx, y: y + 0.3, w: cw2, h: 0.44, fontSize: 20, bold: true,
    color: ACC, fontFace: F, align: "center", margin: 0 });
  s.addText("7 位专家 Agent 矩阵 · 循证知识引擎（RAG）\n儿童安全红线 · 档案级个性化",
    { x: cx, y: y + 0.82, w: cw2, h: 0.72, fontSize: 12, color: ONDM, fontFace: F,
      align: "center", margin: 0, lineSpacingMultiple: 1.35 });

  // 三个入口
  const ent = [
    ["家长入口", "微信小程序 · 演练场", "已上线", PRIM, BG3,
      "星星档案建档 → AI 生成「数字孪生」孩子 → 家长安全演练沟通技巧，观察专家逐句点评"],
    ["课程入口", "循环干预互动课程", "已上线", GREEN, "EDF3EC",
      "28 门循证课程、42 节互动课，讲师 Agent 对话式授课，按孩子档案个性化排序"],
    ["孩子入口", "AI 玩具「小星」", "原型就绪", ACC, "FDF3E4",
      "语音陪伴 + 情绪回应 + 干预游戏化，把练习嵌入孩子的日常生活，24 小时温柔在场"],
  ];
  const ew = (W - 2 * M - 2 * 0.4) / 3;
  ent.forEach(([k, t, st, c, fill, d], i) => {
    const x = M + i * (ew + 0.4);
    // 连接线
    arrow(s, cx + cw2 / 2, y + 1.86, 0, PRIM2);
    card(s, x, y + 2.06, ew, 2.3, fill);
    s.addText(k, { x: x + 0.26, y: y + 2.26, w: ew - 0.52, h: 0.26, fontSize: 10.5, bold: true,
      color: c, charSpacing: 2, fontFace: F, margin: 0 });
    s.addText(t, { x: x + 0.26, y: y + 2.54, w: ew - 0.52, h: 0.36, fontSize: 16, bold: true,
      color: INK, fontFace: F, margin: 0 });
    tag(s, x + 0.26, y + 2.96, 1.16, 0.3, st, c, "FFFFFF", 10);
    s.addText(d, { x: x + 0.26, y: y + 3.38, w: ew - 0.52, h: 0.86, fontSize: 11, color: MUTED,
      fontFace: F, margin: 0, lineSpacingMultiple: 1.32 });
  });

  y += 4.66;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y, w: W - 2 * M, h: 0.74, rectRadius: 0.08,
    fill: { color: BG2 }, line: { color: "E6DAC5", width: 0.75 } });
  s.addText("为什么是一个大脑", { x: M + 0.3, y, w: 2.1, h: 0.74, fontSize: 13, bold: true,
    color: ACCT, fontFace: F, valign: "middle", margin: 0 });
  s.addText("家长在小程序里学的方法，孩子转头就在玩具上练 —— 数据与档案全程打通，干预第一次形成「学 - 练 - 反馈」的家庭闭环。",
    { x: M + 2.5, y: y + 0.04, w: W - 2 * M - 2.9, h: 0.66, fontSize: 12.5, color: INK,
      fontFace: F, valign: "middle", margin: 0, lineSpacingMultiple: 1.3 });
  foot(s, null);
  s.addNotes("三个入口不是三条产品线，是同一个大脑的三种形态。强调闭环：学-练-反馈。");
}

// ══════════════════════════════════════════════════════════════
// 05 · 产品实景：已经能用，不是 PPT 产品
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(false);
  let y = head(s, "PRODUCT · 产品实景", "小程序 v1.3：全链路已真实跑通",
    "开源仓库 github.com/zhangcheng0688/xingtong-cat，微信开发者工具导入即跑，可现场演示。");

  const modules = [
    ["演练", "星星档案建档 → 一句话生成孪生场景 → 实时演练 + 观察专家逐句点评 → 结构化总结报告"],
    ["学习", "28 门循证干预课程、42 节互动课，按孩子档案个性化排序，讲师 Agent 对话式授课"],
    ["社区", "话题分类 + 专家答疑 + 点赞评论，家长互助氛围，真实干预案例沉淀"],
    ["我的", "孩子档案管理 · 积分余额 · 周报入口 · 微信 / 手机号双登录"],
  ];
  const mw = 6.0;
  modules.forEach(([t, d], i) => {
    const my = y + i * 1.06;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: my, w: mw, h: 0.92, rectRadius: 0.08,
      fill: { color: i % 2 ? "FFFFFF" : BG2 }, line: { width: 0, color: BG2 } });
    s.addText(t, { x: M + 0.28, y: my + 0.12, w: 0.9, h: 0.68, fontSize: 15, bold: true,
      color: PRIM, fontFace: F, margin: 0, valign: "middle" });
    s.addShape(pres.shapes.LINE, { x: M + 1.22, y: my + 0.2, w: 0, h: 0.52,
      line: { color: HAIR, width: 0.75 } });
    s.addText(d, { x: M + 1.4, y: my + 0.12, w: mw - 1.7, h: 0.68, fontSize: 11.5, color: INK,
      fontFace: F, margin: 0, valign: "middle", lineSpacingMultiple: 1.28 });
  });

  y += 4.34;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y, w: mw, h: 0.72, rectRadius: 0.08,
    fill: { color: ACC }, line: { width: 0, color: ACC } });
  s.addText("商业化已跑通　注册送 30 积分 · 演练 5 积分 / 场 · 课程 2 积分 / 节 · 周报 3 积分 / 期",
    { x: M + 0.28, y, w: mw - 0.56, h: 0.72, fontSize: 12, bold: true, color: "2B2721",
      fontFace: F, valign: "middle", margin: 0 });

  // 右侧手机截图
  const ix = M + 6.36, iw = W - M - ix;
  s.addText("真机界面", { x: ix, y: y - 4.5, w: iw, h: 0.3, fontSize: 12, bold: true,
    color: MUTED, fontFace: F, margin: 0 });
  const ph = 4.34, pwi = (500 / 1000) * ph;
  const startX = ix + (iw - 2 * pwi - 0.24) / 2;
  [["home.png", 0], ["learn.png", 1]].forEach(([f, i]) => {
    const px = startX + i * (pwi + 0.24);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: px - 0.05, y: y - 4.24, w: pwi + 0.1, h: ph + 0.1,
      rectRadius: 0.12, fill: { color: "FFFFFF" }, line: { color: "E3D9C7", width: 0.75 },
      shadow: shadow() });
    s.addImage({ path: IMG(f), x: px, y: y - 4.19, w: pwi, h: ph - 0.1,
      sizing: { type: "cover", w: pwi, h: ph - 0.1 } });
  });
  foot(s, null);
  s.addNotes("先演示再讲：建档 → 生成场景 → 演练 → 报告，全程约 90 秒。");
}

// ══════════════════════════════════════════════════════════════
// 06 · 技术底座：稳定，是儿童产品的第一性原理
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(false);
  let y = head(s, "TECHNOLOGY · 技术底座", "全栈自研链路，每一层都已实测跑通",
    "面向儿童场景，我们把「稳定性」放在模型能力之前：四重保险，永不空答，全程可审计。");

  const layers = [
    ["L1 · 模型层", "全栈千问（阿里百炼）", PRIM, BG3, [
      "对话大模型：多专家 Agent 与课程的推理内核",
      "语音识别 qwen3-omni-flash · 语音合成 qwen3-tts-flash",
      "向量检索 text-embedding-v4 · OpenAI 兼容网关",
      "文字 / 语音 / 向量一个供应商打通，链路最短",
    ]],
    ["L2 · 稳定层", "LangChain 编排内核", GREEN, "EDF3EC", [
      "30s 超时熔断 + 指数退避自动重试 ×3",
      "主模型异常时备用模型自动降级接管",
      "zod 结构化输出校验，坏 JSON 不入库",
      "COSTAR 提示词工程 + 字段级契约校验",
    ]],
    ["L3 · 知识层", "RAGFlow 循证引擎", ACC, "FDF3E4", [
      "10 篇循证干预知识：ABA / DTT / PRT / ESDM",
      "深度知识库检索 + 本地引擎双后端",
      "三道回退降级：任何故障下永不空答",
      "专家可审校、可溯源，内容不是黑盒",
    ]],
  ];
  const lw2 = (W - 2 * M - 2 * 0.32) / 3;
  layers.forEach(([k, t, c, fill, items], i) => {
    const x = M + i * (lw2 + 0.32);
    card(s, x, y, lw2, 3.5, fill);
    s.addText(k, { x: x + 0.26, y: y + 0.2, w: lw2 - 0.52, h: 0.26, fontSize: 10.5, bold: true,
      color: c, charSpacing: 2, fontFace: F, margin: 0 });
    s.addText(t, { x: x + 0.26, y: y + 0.48, w: lw2 - 0.52, h: 0.36, fontSize: 16.5, bold: true,
      color: INK, fontFace: F, margin: 0 });
    hair(s, x + 0.26, y + 0.96, lw2 - 0.52);
    bullets(s, items, { x: x + 0.26, y: y + 1.1, w: lw2 - 0.52, h: 2.2, fontSize: 10.5, color: INK });
  });

  y += 3.78;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y, w: W - 2 * M, h: 1.06, rectRadius: 0.09,
    fill: { color: DARK }, line: { width: 0, color: DARK } });
  s.addText("安全红线", { x: M + 0.32, y, w: 1.6, h: 1.06, fontSize: 14, bold: true, color: ACC,
    fontFace: F, valign: "middle", margin: 0 });
  s.addText("医疗诊断类问题一律转介专业机构 · 全量对话内容安全过滤 · 儿童隐私数据最小化采集 · 语音链路端到端实测：ASR → 大脑 → TTS 全程 < 3 秒",
    { x: M + 2.0, y: y + 0.08, w: W - 2 * M - 2.4, h: 0.9, fontSize: 12.5, color: OND,
      fontFace: F, valign: "middle", margin: 0, lineSpacingMultiple: 1.4 });
  foot(s, "全部组件已在生产架构中实测：语音端到端、RAG 检索、积分计费、双登录均已跑通（2026-08）");
  s.addNotes("这页回应「为什么不用裸调 API」：儿童场景容错率是零，稳定层是产品的地基不是可选项。");
}

// ══════════════════════════════════════════════════════════════
// 07 · 专家矩阵：8 位 Agent，一支随身干预团队
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(false);
  let y = head(s, "AGENT MATRIX · 专家矩阵", "8 位 AI 专家，组成每个家庭的随身干预团队",
    "不是聊天机器人列表，是有明确分工、契约与红线的工程化编排 —— 全部在 lib/agents.ts 中可审计。");

  const agents = [
    ["观察专家", "逐句点评家长演练，指出可改进的具体话术", PRIM],
    ["演练教练", "扮演「数字孪生」孩子，生成个性化演练场景", PRIM],
    ["课程讲师", "对话式讲授循证干预课，按档案调节奏", GREEN],
    ["周报分析师", "汇总一周互动数据，给出家庭干预建议", GREEN],
    ["社区答疑员", "解答家长日常疑问，沉淀案例知识", ACC],
    ["档案顾问", "维护星星档案，让每个孩子被「记住」", ACC],
    ["安全守门员", "全程内容过滤，敏感问题转介专业机构", "B44B2F"],
    ["玩具伙伴 toyChat", "孩子的语气与节奏，游戏里练干预目标", "8C6D1F"],
  ];
  const aw = (W - 2 * M - 3 * 0.28) / 4;
  agents.forEach(([t, d, c], i) => {
    const x = M + (i % 4) * (aw + 0.28);
    const ay = y + Math.floor(i / 4) * 1.86;
    card(s, x, ay, aw, 1.68, "FFFFFF");
    s.addShape(pres.shapes.RECTANGLE, { x, y: ay, w: aw, h: 0.07, fill: { color: c }, line: { width: 0, color: c } });
    s.addText(t, { x: x + 0.2, y: ay + 0.2, w: aw - 0.4, h: 0.34, fontSize: 13.5, bold: true,
      color: INK, fontFace: F, margin: 0 });
    s.addText(d, { x: x + 0.2, y: ay + 0.6, w: aw - 0.4, h: 0.94, fontSize: 10.5, color: MUTED,
      fontFace: F, margin: 0, lineSpacingMultiple: 1.32 });
  });

  y += 3.94;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y, w: W - 2 * M, h: 0.92, rectRadius: 0.08,
    fill: { color: BG3 }, line: { color: "D5E4E6", width: 0.75 } });
  s.addText("工程化而非拼装", { x: M + 0.3, y, w: 2.2, h: 0.92, fontSize: 13.5, bold: true,
    color: PRIM, fontFace: F, valign: "middle", margin: 0 });
  s.addText("统一 JSON 输出契约 · 字段级校验拦截异常 · 历史窗口截断控制成本 · 每位专家独立 COSTAR 提示词档案 —— 可以逐位审计、逐位迭代、逐位替换。",
    { x: M + 2.5, y: y + 0.06, w: W - 2 * M - 2.9, h: 0.8, fontSize: 12.5, color: INK,
      fontFace: F, valign: "middle", margin: 0, lineSpacingMultiple: 1.35 });
  foot(s, null);
  s.addNotes("投资人问壁垒时：Agent 矩阵的壁垒不在提示词，在编排契约 + 数据闭环 + 可审计性。");
}

// ══════════════════════════════════════════════════════════════
// 08 · 硬件「小星」：孩子的 24 小时温柔陪练
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(false);
  let y = head(s, "HARDWARE · AI 玩具「小星」", "把干预，做成孩子愿意抱住的伙伴",
    "软件教家长，玩具陪孩子 —— 同一套大脑，从屏幕里走进孩子的怀里。");

  // 左侧场景大图
  const iw = 6.0, ih = iw * (1092 / 2048);
  card(s, M, y, iw, ih + 0.24, "FFFFFF");
  s.addImage({ path: IMG("toy-scene2.png"), x: M + 0.12, y: y + 0.12, w: iw - 0.24, h: ih - 0.0,
    sizing: { type: "cover", w: iw - 0.24, h: ih - 0.0 } });

  // 右上：IP 设计演绎
  const rx = M + iw + 0.4, rw = W - M - rx;
  s.addText("IP 设计演绎（站在巨人肩膀上）", { x: rx, y: y + 0.02, w: rw, h: 0.32,
    fontSize: 14, bold: true, color: PRIM, fontFace: F, margin: 0 });
  const refs = [
    ["Hugging Face Reachy Mini", "开源桌面机器人标杆：圆润白机身 + 大屏眼睛 + 会动的触角 → 我们把触角演绎为一双会动的猫耳"],
    ["Casio Moflin", "毛绒亲和力与「无攻击性」体态 → 亲肤材质 + 胸前星标呼吸灯"],
    ["Ropet（CES 2025 明星）", "大眼睛、小身体比例激发保护欲 → 放大眼屏占比，去掉一切尖锐线条"],
  ];
  refs.forEach(([t, d], i) => {
    const ry = y + 0.42 + i * 0.72;
    s.addShape(pres.shapes.OVAL, { x: rx, y: ry + 0.06, w: 0.16, h: 0.16,
      fill: { color: ACC }, line: { width: 0, color: ACC } });
    s.addText(t, { x: rx + 0.3, y: ry, w: rw - 0.3, h: 0.28, fontSize: 12, bold: true,
      color: INK, fontFace: F, margin: 0 });
    s.addText(d, { x: rx + 0.3, y: ry + 0.28, w: rw - 0.3, h: 0.42, fontSize: 10, color: MUTED,
      fontFace: F, margin: 0, lineSpacingMultiple: 1.2 });
  });

  // 右下：硬件规格
  const sy = y + 2.62;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: rx, y: sy, w: rw, h: 1.58,
    rectRadius: 0.08, fill: { color: DARK }, line: { width: 0, color: DARK } });
  s.addText("硬件方案（原型就绪）", { x: rx + 0.26, y: sy + 0.14, w: rw - 0.52, h: 0.28,
    fontSize: 12, bold: true, color: ACC, fontFace: F, margin: 0 });
  bullets(s, [
    "ESP32-S3 · 4 麦克风阵列 · 5W 扬声器 · 情绪灯环 · 猫耳舵机 ×2",
    "BOM 成本 ¥60-100 · 固件基于开源 xiaozhi-esp32（MIT）二次开发",
    "语音直连小程序同一套 /api/voice/turn 大脑，端云一体",
  ], { x: rx + 0.26, y: sy + 0.5, w: rw - 0.52, h: 1.0, fontSize: 10.5, color: OND, paraSpaceAfter: 4 });

  foot(s, "设计参考：github.com/pollen-robotics/reachy_mini（开源 CAD）；casio.com/us/moflin；Ropet CES 2025 公开发布资料；固件生态：github.com/78/xiaozhi-esp32");
  s.addNotes("硬件不是噱头是通路：玩具是干预进入孩子日常的唯一形态。固件站在 xiaozhi 开源生态上，省一年开发。");
}

// ══════════════════════════════════════════════════════════════
// 09 · 数据飞轮（深色）
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(true);
  let y = head(s, "FLYWHEEL · 数据飞轮", "每一次互动，都让大脑更懂这个孩子",
    "通用 AI 玩具没有档案，机构没有家庭日常数据 —— 只有我们同时拥有两者。", true);

  const steps = [
    ["星星档案", "孩子的能力画像\n与干预目标"],
    ["家长演练", "小程序里学会\n怎么教"],
    ["玩具互动", "孩子在日常中\n真实练习"],
    ["周报洞察", "结构化进展\n反哺家庭"],
    ["档案加深", "个性化更准\n干预更有效"],
  ];
  const bw = 2.14, gap = 0.34, total = 5 * bw + 4 * gap, sx = (W - total) / 2;
  steps.forEach(([t, d], i) => {
    const x = sx + i * (bw + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: y + 0.3, w: bw, h: 1.5, rectRadius: 0.1,
      fill: { color: i === 4 ? ACC : DARK2 }, line: { color: "3A545C", width: 0.75 } });
    s.addText(t, { x, y: y + 0.52, w: bw, h: 0.34, fontSize: 14.5, bold: true,
      color: i === 4 ? "2B2721" : OND, fontFace: F, align: "center", margin: 0 });
    s.addText(d, { x, y: y + 0.92, w: bw, h: 0.72, fontSize: 10.5,
      color: i === 4 ? "3D2E10" : ONDM, fontFace: F, align: "center", margin: 0,
      lineSpacingMultiple: 1.3 });
    if (i < 4) arrow(s, x + bw + 0.05, y + 1.05, gap - 0.1, ACC);
  });
  // 回环箭头说明
  s.addText("⟲ 回到第一步，螺旋上升", { x: sx, y: y + 2.0, w: total, h: 0.3, fontSize: 11.5,
    color: ACC, fontFace: F, align: "center", margin: 0 });

  y += 2.62;
  hair(s, M, y, W - 2 * M, true);
  y += 0.3;
  const moats = [
    ["干预语料库", "真实家庭场景下的演练与互动语料，是任何通用模型拿不到的训练资产"],
    ["档案级个性化", "每个孩子对应一个独特的「数字孪生」，迁移成本随使用时间递增"],
    ["专家网络", "循证知识库由康复专家审校共建，专业背书构成内容护城河"],
  ];
  const mw2 = (W - 2 * M - 2 * 0.32) / 3;
  moats.forEach(([t, d], i) => {
    const x = M + i * (mw2 + 0.32);
    s.addShape(pres.shapes.OVAL, { x, y: y + 0.05, w: 0.16, h: 0.16, fill: { color: PRIM2 },
      line: { width: 0, color: PRIM2 } });
    s.addText(t, { x: x + 0.3, y, w: mw2 - 0.3, h: 0.3, fontSize: 13.5, bold: true, color: OND,
      fontFace: F, margin: 0 });
    s.addText(d, { x, y: y + 0.38, w: mw2, h: 0.76, fontSize: 10.5, color: ONDM, fontFace: F,
      margin: 0, lineSpacingMultiple: 1.3 });
  });
  foot(s, null, true);
  s.addNotes("飞轮的关键是「玩具回传数据」：硬件让数据采集进入家庭日常，这是纯软件竞品补不上的缺口。");
}

// ══════════════════════════════════════════════════════════════
// 10 · 商业模式
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(false);
  let y = head(s, "BUSINESS MODEL · 商业模式", "三条收入线，从订阅到软硬一体",
    "C 端订阅验证付费意愿 → 硬件放大客单价与数据壁垒 → B 端机构建立专业背书与渠道。三条线共用同一套大脑。");

  const lines = [
    ["C 端家庭订阅", "第一步 · 计费已跑通", PRIM, BG3, [
      ["产品形态", "小程序会员制：孪生演练 + 系统课程 + 周报"],
      ["积分制", "注册送 30 积分；演练 5 / 课程 2 / 周报 3，三档套餐随时加购"],
      ["价值锚点", "对标机构年支出数万元的零头 —— 我们定在千元级 / 年"],
    ]],
    ["硬件 AI 玩具", "第二步 · 放大客单价", ACC, "FDF3E4", [
      ["收入结构", "硬件一次性销售 + ¥19-29 / 月「大脑订阅」"],
      ["模式验证", "「硬件 + 订阅内容」由跃然创新 BubblePal 验证（A 轮 2 亿元）"],
      ["转化逻辑", "软件用户自然转化为硬件用户，硬件反哺数据飞轮"],
    ]],
    ["B 端机构 SaaS", "第三步 · 渠道与背书", GREEN, "EDF3EC", [
      ["产品形态", "康复机构的「AI 助教」：家庭延伸干预工具 + 师训支持"],
      ["收费方式", "按席位 / 机构年费授权"],
      ["战略价值", "缓解 30 万人才缺口；一家机构 = 一个精准获客入口"],
    ]],
  ];
  const cw3 = (W - 2 * M - 2 * 0.32) / 3;
  lines.forEach(([t, st, c, fill, rows], i) => {
    const x = M + i * (cw3 + 0.32);
    card(s, x, y, cw3, 3.42, fill);
    s.addText(t, { x: x + 0.28, y: y + 0.22, w: cw3 - 0.56, h: 0.36, fontSize: 17, bold: true,
      color: INK, fontFace: F, margin: 0 });
    tag(s, x + 0.28, y + 0.66, 2.3, 0.3, st, c, "FFFFFF", 10);
    hair(s, x + 0.28, y + 1.08, cw3 - 0.56);
    rows.forEach(([k, v], j) => {
      const ry = y + 1.22 + j * 0.72;
      s.addText(k, { x: x + 0.28, y: ry, w: cw3 - 0.56, h: 0.24, fontSize: 10, bold: true,
        color: c, fontFace: F, charSpacing: 1, margin: 0 });
      s.addText(v, { x: x + 0.28, y: ry + 0.24, w: cw3 - 0.56, h: 0.46, fontSize: 10.5,
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
  s.addNotes("三条线讲成「递进」：C 端验证、硬件放大、B 端背书与渠道。");
}

// ══════════════════════════════════════════════════════════════
// 11 · 市场与竞争
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(false);
  let y = head(s, "MARKET & COMPETITION · 市场与竞争", "千亿家庭支出中的空白带",
    "专业干预 × 家庭场景 × AI 个性化的三者交集，目前没有人占据。");

  // 左侧 TAM/SAM/SOM
  const lw3 = 5.1;
  s.addText("可服务市场（团队测算）", { x: M, y: y + 0.02, w: lw3, h: 0.32, fontSize: 14,
    bold: true, color: PRIM, fontFace: F, margin: 0 });
  const tiers = [
    ["TAM", "1000 亿元/年", "中国自闭症家庭康复干预总支出", PRIM, "EAF1F2"],
    ["SAM", "300 亿元", "家庭端数字化干预 + AI 玩具交集", ACCT, "FDF3E4"],
    ["SOM", "3 亿元", "5 年目标：10 万付费家庭 × 3000 元 ARPU", GREEN, "EDF3EC"],
  ];
  let ty = y + 0.46;
  tiers.forEach(([k, v, d, c, fill]) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: ty, w: lw3, h: 0.98, rectRadius: 0.09,
      fill: { color: fill }, line: { width: 0, color: fill } });
    s.addText(k, { x: M + 0.24, y: ty + 0.14, w: 0.9, h: 0.26, fontSize: 11, bold: true,
      color: c, fontFace: FN, margin: 0 });
    s.addText(v, { x: M + 0.24, y: ty + 0.42, w: 2.2, h: 0.42, fontSize: 19, bold: true,
      color: INK, fontFace: FN, margin: 0 });
    s.addText(d, { x: M + 2.6, y: ty + 0.1, w: lw3 - 2.84, h: 0.78, fontSize: 10,
      color: MUTED, fontFace: F, margin: 0, valign: "middle", lineSpacingMultiple: 1.25 });
    ty += 1.12;
  });

  // 右侧竞争表
  const rx = M + lw3 + 0.5, rw = W - M - rx;
  s.addText("错位竞争格局", { x: rx, y: y + 0.02, w: rw, h: 0.32, fontSize: 14, bold: true,
    color: PRIM, fontFace: F, margin: 0 });
  const hdr = ["玩家", "专业性", "家庭场景", "AI 个性化"];
  const colW = [2.6, 1.25, 1.25, 1.35];
  const rows = [
    ["机构连锁（大米和小米等）", "强", "弱", "弱", 0],
    ["线上平台（恩启 / ALSOLIFE）", "中", "中", "弱-中", 0],
    ["通用 AI 玩具（BubblePal 等）", "弱", "强", "中", 0],
    ["星童猫咪", "强", "强", "强", 1],
  ];
  const tbl = [hdr.map((h) => ({ text: h, options: { bold: true, color: "FFFFFF",
    fill: { color: PRIM }, fontSize: 11, fontFace: F, align: "left" } }))];
  rows.forEach((r) => {
    const mine = r[4] === 1;
    tbl.push(r.slice(0, 4).map((cell) => ({
      text: cell,
      options: { color: mine ? INK : MUTED, bold: mine, fontSize: mine ? 11.5 : 10.5,
        fontFace: F, fill: { color: mine ? "EAF1F2" : "FFFFFF" } },
    })));
  });
  s.addTable(tbl, { x: rx, y: y + 0.46, w: colW.reduce((a, b) => a + b, 0), colW,
    border: { pt: 0.5, color: "E4DACB" }, rowH: [0.38, 0.5, 0.5, 0.5, 0.5],
    valign: "middle", margin: [4, 8, 4, 8] });

  s.addText("我们的位置：专家矩阵 + 循证库构成的专业性，档案级个性化，家庭即主场，硬件通路 —— 四者同时成立，才有这张桌子上的位置。",
    { x: rx, y: y + 3.1, w: rw, h: 0.8, fontSize: 11.5, color: INK, fontFace: F, margin: 0,
      lineSpacingMultiple: 1.35 });

  foot(s, "数据来源：中商产业研究院（2025）；智研咨询（2024-12）；TAM / SAM / SOM 为本团队基于公开数据的测算假设；竞争信息依据公开资料与产品实测整理（2026-08）");
  s.addNotes("不贬低竞品。口径说清：TAM/SAM/SOM 是测算，竞争定位是「交集空白」。");
}

// ══════════════════════════════════════════════════════════════
// 12 · 路线图：三年，一万组家庭
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(false);
  let y = head(s, "ROADMAP · 路线图", "三年一万组家庭，每一步都有据可依",
    "左侧是目标拆解，右侧是已经在手的里程碑 —— 我们不是从 PPT 出发，是从跑通的系统出发。");

  // 左侧柱状图
  const cw4 = 6.6;
  card(s, M, y, cw4, 3.5, "FFFFFF");
  s.addText("累计服务家庭数（年末口径）", { x: M + 0.3, y: y + 0.18, w: cw4 - 0.6, h: 0.3,
    fontSize: 13, bold: true, color: PRIM, fontFace: F, margin: 0 });
  // 手绘画柱状图（避免原生图表在部分查看器中丢失）
  const bars = [
    ["2026 H2", "种子期", 1000, PRIM2],
    ["2027", "付费闭环", 3000, PRIM2],
    ["2028", "硬件放量", 6000, ACC],
    ["2029", "生态放大", 10000, ACC],
  ];
  const plotX = M + 0.5, plotY = y + 0.66, plotW = cw4 - 1.0, plotH = 2.06;
  const bw2 = 0.92, bgap = (plotW - 4 * bw2) / 5;
  // 基线
  s.addShape(pres.shapes.LINE, { x: plotX, y: plotY + plotH, w: plotW, h: 0,
    line: { color: HAIR, width: 1 } });
  bars.forEach(([yr, ph2, v, c], i) => {
    const bh = (v / 10000) * plotH;
    const bx = plotX + bgap + i * (bw2 + bgap);
    const by = plotY + plotH - bh;
    s.addShape(pres.shapes.RECTANGLE, { x: bx, y: by, w: bw2, h: bh,
      fill: { color: c }, line: { width: 0, color: c } });
    s.addText(v.toLocaleString("en-US"), { x: bx - 0.3, y: by - 0.32, w: bw2 + 0.6, h: 0.28,
      fontSize: 13, bold: true, color: INK, fontFace: FN, align: "center", margin: 0 });
    s.addText(yr, { x: bx - 0.3, y: plotY + plotH + 0.08, w: bw2 + 0.6, h: 0.26,
      fontSize: 10.5, bold: true, color: INK, fontFace: F, align: "center", margin: 0 });
    s.addText(ph2, { x: bx - 0.3, y: plotY + plotH + 0.34, w: bw2 + 0.6, h: 0.24,
      fontSize: 9.5, color: MUTED, fontFace: F, align: "center", margin: 0 });
  });

  // 右侧渠道拆解
  const rx = M + cw4 + 0.36, rw = W - M - rx;
  s.addText("达成一万时的来源构成", { x: rx, y: y + 0.02, w: rw, h: 0.34, fontSize: 14,
    bold: true, color: PRIM, fontFace: F, margin: 0 });
  const ch = [
    ["机构渠道", "6,000", "100 家签约机构 × 平均 150 组在册家庭 × 40% 付费转化", ACC],
    ["线上与口碑", "3,000", "小程序自然流量 + 家长社区口碑 + 内容获客", PRIM],
    ["硬件首发", "1,000", "小星玩具首批预售，软硬一体打包转化", GREEN],
  ];
  let cy = y + 0.46;
  ch.forEach(([t, n, d, c]) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: rx, y: cy, w: rw, h: 0.94, rectRadius: 0.08,
      fill: { color: "FFFFFF" }, line: { color: "EDE3D2", width: 0.75 } });
    s.addText(n, { x: rx + 0.24, y: cy + 0.1, w: 1.5, h: 0.4, fontSize: 20, bold: true,
      color: c, fontFace: FN, margin: 0 });
    s.addText(t, { x: rx + 1.8, y: cy + 0.12, w: rw - 2.0, h: 0.3, fontSize: 12.5, bold: true,
      color: INK, fontFace: F, margin: 0, valign: "middle" });
    s.addText(d, { x: rx + 0.24, y: cy + 0.52, w: rw - 0.48, h: 0.36, fontSize: 9.5,
      color: MUTED, fontFace: F, margin: 0, lineSpacingMultiple: 1.2 });
    cy += 1.04;
  });

  // 底部：已在手的里程碑
  y += 3.78;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y, w: W - 2 * M, h: 1.16, rectRadius: 0.09,
    fill: { color: BG3 }, line: { color: "D5E4E6", width: 0.75 } });
  s.addText("已在手", { x: M + 0.3, y, w: 1.2, h: 1.16, fontSize: 13.5, bold: true, color: PRIM,
    fontFace: F, valign: "middle", margin: 0 });
  const done = [
    "M1 · 8 位专家 Agent 矩阵上线",
    "M2 · 语音端到端链路打通（ASR→LLM→TTS）",
    "M3 · 积分商业化与双登录上线",
    "M4 · 云上生产部署套件就绪",
  ];
  const dw = (W - 2 * M - 1.8) / 4;
  done.forEach((t, i) => {
    s.addText("✓ " + t, { x: M + 1.6 + i * dw, y, w: dw - 0.1, h: 1.16, fontSize: 10.5,
      bold: true, color: INK, fontFace: F, valign: "middle", margin: 0, lineSpacingMultiple: 1.3 });
  });
  foot(s, "渠道规模与转化率为本团队测算假设，随试点数据滚动修正；里程碑状态来自仓库实测（2026-08）");
  s.addNotes("机构渠道是关键假设，答辩说清「机构为什么签」：他们缺家庭延伸工具，我们免费降低师训成本。");
}

// ══════════════════════════════════════════════════════════════
// 13 · 融资需求
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(false);
  let y = head(s, "THE ASK · 融资需求", "本轮融资：把已验证的系统，放大到一万组家庭",
    "软件已经跑通，硬件链路已经打通。这 300 万要买的不是探索，是放大。");

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
  const px2 = M + 3.76, pwi2 = 3.5;
  s.addText("资金用途", { x: px2, y: y + 0.02, w: pwi2, h: 0.3, fontSize: 13, bold: true,
    color: PRIM, fontFace: F, margin: 0 });
  // 手绘堆叠比例条（替代环形图，保证任何查看器可见）
  const segs = [
    ["产品研发", 40, PRIM], ["硬件供应链", 25, ACC], ["内容与专家", 20, GREEN], ["市场运营", 15, PRIM2],
  ];
  const sbX = px2, sbY = y + 0.62, sbW = pwi2, sbH = 0.5;
  let accX = sbX;
  segs.forEach(([t, v, c], i) => {
    const sw = (v / 100) * sbW;
    s.addShape(pres.shapes.RECTANGLE, { x: accX, y: sbY, w: sw, h: sbH,
      fill: { color: c }, line: { width: 0, color: c } });
    s.addText(v + "%", { x: accX, y: sbY, w: sw, h: sbH, fontSize: 12, bold: true,
      color: "FFFFFF", fontFace: FN, align: "center", valign: "middle", margin: 0 });
    accX += sw;
  });
  segs.forEach(([t, v, c], i) => {
    const ly = sbY + 0.72 + i * 0.4;
    s.addShape(pres.shapes.RECTANGLE, { x: sbX, y: ly + 0.06, w: 0.18, h: 0.18,
      fill: { color: c }, line: { width: 0, color: c } });
    s.addText(t + " " + v + "%", { x: sbX + 0.3, y: ly, w: pwi2 - 0.3, h: 0.3,
      fontSize: 11, color: INK, fontFace: F, margin: 0, valign: "middle" });
  });

  // 里程碑
  const mx = M + 7.6, mw2 = W - M - mx;
  s.addText("18 个月里程碑", { x: mx, y: y + 0.02, w: mw2, h: 0.3, fontSize: 13, bold: true,
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
    s.addText(t, { x: mx + 0.3, y: my, w: mw2 - 0.3, h: 0.42, fontSize: 11.5, color: INK,
      fontFace: F, margin: 0, valign: "middle", lineSpacingMultiple: 1.2 });
  });

  y += 2.78;
  hair(s, M, y, W - 2 * M);
  y += 0.26;
  const use = [
    ["产品研发 40%", "语音全双工升级 · 专家矩阵 V2 · 端侧选项"],
    ["硬件供应链 25%", "小星打样 · 3C 认证 · 首批量产备货"],
    ["内容与专家网络 20%", "专家顾问团审校 · 语料库扩充 · 课程扩容"],
    ["市场与运营 15%", "种子家庭运营 · 机构 BD · 内容获客"],
  ];
  const uw = (W - 2 * M - 3 * 0.28) / 4;
  use.forEach(([t, d], i) => {
    const x = M + i * (uw + 0.28);
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: uw, h: 0.06,
      fill: { color: [PRIM, ACC, GREEN, PRIM2][i] }, line: { width: 0, color: [PRIM, ACC, GREEN, PRIM2][i] } });
    s.addText(t, { x, y: y + 0.18, w: uw, h: 0.3, fontSize: 12.5, bold: true, color: INK,
      fontFace: F, margin: 0 });
    s.addText(d, { x, y: y + 0.5, w: uw - 0.1, h: 0.6, fontSize: 10, color: MUTED, fontFace: F,
      margin: 0, lineSpacingMultiple: 1.24 });
  });
  foot(s, null);
  s.addNotes("如果被问估值：300 万换 10%，投后 3000 万，对应的是已经跑通的系统与一万家庭的可拆解路径。");
}

// ══════════════════════════════════════════════════════════════
// 14 · 结尾（深色）
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide(true);
  s.addShape(pres.shapes.OVAL, { x: -2.2, y: -2.2, w: 7.2, h: 7.2, fill: { color: DARK2 }, line: { width: 0, color: DARK2 } });
  s.addShape(pres.shapes.OVAL, { x: 8.8, y: 3.6, w: 7.2, h: 7.2, fill: { color: DARK2 }, line: { width: 0, color: DARK2 } });

  s.addImage({ path: IMG("ip2.png"), x: 5.79, y: 0.62, w: 1.75, h: 1.63 });

  s.addText("C A R E   ·   A U T I S M   T O G E T H E R", { x: M, y: 2.36, w: W - 2 * M,
    h: 0.3, fontSize: 11, bold: true, color: PRIM2, charSpacing: 4, fontFace: F,
    align: "center", margin: 0 });
  s.addText("每一个星星的孩子", { x: M, y: 2.94, w: W - 2 * M, h: 0.9, fontSize: 46, bold: true,
    color: OND, fontFace: F, align: "center", margin: 0 });
  s.addText("都值得被温柔以待", { x: M, y: 3.78, w: W - 2 * M, h: 0.9, fontSize: 46, bold: true,
    color: ACC, fontFace: F, align: "center", margin: 0 });

  hair(s, W / 2 - 2.6, 4.94, 5.2, true);

  s.addText("星童猫咪 · 与 10,000 组家庭同行", { x: M, y: 5.2, w: W - 2 * M, h: 0.42,
    fontSize: 19, bold: true, color: OND, fontFace: F, align: "center", margin: 0 });
  s.addText("从 2 小时的专家在场，到 24 小时的温柔陪伴", { x: M, y: 5.7, w: W - 2 * M, h: 0.36,
    fontSize: 14, color: ONDM, fontFace: F, align: "center", margin: 0 });

  s.addText("Peter 张程 · +86 13159877586 / +852 44358635", { x: M, y: 6.24, w: W - 2 * M,
    h: 0.32, fontSize: 13, color: OND, fontFace: F, align: "center", margin: 0 });
  s.addText("github.com/zhangcheng0688/xingtong-cat", { x: M, y: 6.58, w: W - 2 * M, h: 0.3,
    fontSize: 11, color: "6E8488", fontFace: FN, align: "center", margin: 0 });
  foot(s, null, true);
  s.addNotes("结尾不要多说。念完这句话，停两秒，等对方开口。");
}

// ── 输出 ────────────────────────────────────────────────────
const out = path.join(__dirname, "星童猫咪-商业计划书-2026-v2.pptx");
pres.writeFile({ fileName: out }).then(() => {
  console.log("OK →", out);
  console.log("slides:", pres.slides.length);
});
