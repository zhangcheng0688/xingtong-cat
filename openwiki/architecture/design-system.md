---
type: 设计系统
title: 移动端设计系统与共享组件
description: 说明 Web 小程序形态的视觉 token、全局样式、吉祥物与导航组件的职责边界。
tags: [frontend, design-system, ui]
---
# 移动端设计系统与共享组件

`app/globals.css` 是 Web 设计 token 的唯一代码来源：纸张/奶油底色、暖炭文字、星橙、雾青、鼠尾草等色彩，以及 `app-shell`、`card`、`btn-primary`、`chip`、消息气泡和输入框类。`app/layout.tsx` 导入它并限制为移动优先的壳；不要在各页面复制颜色或按钮规则。

`components/TabBar.tsx` 固定四个主 Tab：演练 `/home`、学习 `/learn`、社区 `/community`、我的 `/me`。`components/NavBar.tsx` 服务二级页，使用浏览器 `history.back()` 返回，可接收右侧插槽。`components/Mascot.tsx` 以 SVG 输出“小星”和可选气泡，避免以图片替换而丢失可缩放性。

原生端的对应样式在 `miniprogram/app.wxss`，tab 配置在 `miniprogram/app.json`；两者视觉相近但不是共享组件库。产品调研与详细视觉案例在 `docs/design/index.html`，不参与运行时。

## 修改规则

1. 修改全局视觉 token 或基础类时，检查 Web 所有 Tab 与登录/建档二级页。
2. 新增主域先决定是否属于四 Tab；否则使用 `NavBar`，不要伪造第五个 Tab。
3. 小程序样式需单独同步；Web CSS 不会编译进微信工程。
4. `npm run build` 是最低编译检查；关键页面需在窄屏手动检查。