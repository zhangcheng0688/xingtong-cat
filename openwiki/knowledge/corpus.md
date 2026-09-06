---
type: 知识语料
title: 本地干预知识语料库
description: 说明 data/knowledge Markdown 的元数据格式、装载边界、内容责任和扩容方式。
tags: [knowledge, corpus, content]
---
# 本地干预知识语料库

`data/knowledge/` 是默认零依赖语料，涵盖 ABA、情绪共同调节、感觉统合、视觉支持、社交故事、沟通促进、地板时光、场景库、DSM-5 与专业边界等主题。运行时不按文件名建立显式索引：文件名去 `.md` 后成为 chunk ID，frontmatter 形成检索字段。

```md
---
title: 标题
tags: [标签]
scenarios: [场景]
method_id: stable-id
---
正文
```

数组需要单行方括号格式，因 `parseFrontmatter` 是轻量解析器，不支持复杂 YAML。正文会完整进入检索摘要并注入模型，新增内容要短、可验证、避免将诊断/处方写成家庭建议。

`KB_DIR` 依赖 `process.cwd()`，容器构建必须包含 `data/knowledge`；现有 `.dockerignore` 未排除它。产品 README 明确语料尚未经专家顾问团审校，正式发布应先建立来源、版本、审校人与适用范围记录。RAGFlow 扩容不替代本地回退，见[检索](retrieval.md)。