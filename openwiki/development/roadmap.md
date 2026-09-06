---
type: 路线图与边界
title: 产品路线图、合规线与已知技术债
description: 汇总开发计划中的 M1-M4、原型阶段限制和上线前必须解决的数据、支付、安全与合规事项。
tags: [roadmap, compliance, technical-debt]
---
# 产品路线图、合规线与已知技术债

权威计划在 `docs/开发计划.md`。已实现 Web 主链、原生小程序部分页面、LangChain LLM 内核、RAGFlow 适配、语音端点和玩具协议；这些不代表生产就绪。

- M1：完善小程序 UI、按住说话与真机微信登录联调。
- M2：微信支付/iOS 方案、实际云部署、JSON→SQLite/Postgres、微信内容安全。
- M3：实际 RAGFlow 灌库、扩容/专家审校语料、小程序上架、隐私与未成年人保护、可观测性。
- M4：ESP32-S3 原型、xiaozhi-esp32 二开、外壳与玩具对话回流周报。

最优先技术债不是样式：档案无 userId、众多 API 无授权、token 无过期、JSON 无事务、预览充值可直接加分、扣费失败无补偿、社区无审核/去重。具体改造面见[认证](../account/auth.md)、[积分](../account/credits.md)、[数据模型](../architecture/data-model.md)。

内容与产品必须保持非医疗诊断/治疗边界；现有知识/课程尚未专家审校。上线还需按计划处理算法/深度合成备案、隐私、未成年人保护、模型额度和风险升级。