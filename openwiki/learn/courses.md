---
type: 课程体系
title: 课程目录与个性化排序
description: 说明静态 28 门课程、42 节课、五类目录、档案适配评分和 API 列表投影。
tags: [learning, courses, personalization]
---
# 课程目录与个性化排序

`lib/courses.ts` 是静态课程源：`Course` 包含简介、循证说明、`fit(profile)` 和 lessons；`Lesson` 包含标题、分钟数、要点、练习。当前定义 28 门、42 节，五类 `CATEGORIES` 为行为基础、沟通语言、社交情绪、感觉与环境、家长赋能。不要以 README 的“24+ 方法”替代代码事实。

`rankCourses(profile)` 按各课程 `fit()` 的 0–3 分降序。适配函数读取 age、languageLevel、behaviors、sensory、interests；同分保持原数据顺序。`GET /api/learn?profile=id` 读取档案和 `Progress`，只投影列表所需字段、每课 done 状态、doneCount、lessonCount 与 fitScore，不发送 keyPoints/practice/quiz。

课程详情 Web 页面用同一 GET 结果，互动课 API 再从静态课程解析完整对象。新增课程必须同时：加入 `COURSES` 与合适 category、实现确定性 `fit`、提供至少一节并检查列表/详情/小程序首个未完成课时跳转。计费和完成见[互动课 API](lesson-api.md)。