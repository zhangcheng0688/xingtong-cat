---
type: 社区系统
title: 星友社区的帖子、评论与话题
description: 说明社区种子数据、筛选、发帖、点赞、评论 API 及当前匿名和重复点赞边界。
tags: [community, api, frontend]
---
# 星友社区的帖子、评论与话题

`app/api/community/route.ts` 在 GET 前调用 `store.seedPosts(SEED_POSTS)`；四条种子仅在同 ID 不存在时插入。GET 可用 `topic` 严格相等筛选，返回 posts 和固定 topics。POST 裁剪 title 50、content 2000、author 12；PATCH 的 `like` 做 `likes +=1`，`comment` 要求内容并裁剪 500。

Web `/community` 列表筛选，`/community/new` 发帖，`/community/[id]` 详情、点赞和评论。新帖页含“提问求助”，而 API 返回的话题列表包含“专家答疑”却不含前者，新增话题须统一这些枚举。小程序只有列表、筛选和点赞；点帖子仅提示详情未上线。

社区 API 故意接受客户端 author，且 GET/POST/PATCH 均无认证：可匿名写入，服务端不记录 userId；点赞不去重，刷新或直接请求可重复累加。任何账号化、审核、反刷或话题修复都须以[认证与 API 安全边界](../account/auth.md)为前置，并为 Post/Comment 增加作者和点赞关系模型。