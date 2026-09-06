---
type: 部署与发布
title: Docker、Compose、Caddy 与 GitHub 发布
description: 说明生产镜像、Compose 服务、云初始化和 main 分支 SSH 发布流程及已知部署缺口。
tags: [operations, deployment, docker]
---
# Docker、Compose、Caddy 与 GitHub 发布

`Dockerfile` 三阶段使用 `node:24-bookworm-slim`：安装 lockfile 依赖、执行 `npm run build`、复制整个 `/app` 后 `npm run start`。它不是 standalone 镜像，因此会带源码/node_modules；`data/knowledge` 会随镜像，`data/store` 由 volume 持久化。

`infra/docker-compose.prod.yml` 组合 app、Caddy、Elasticsearch、MySQL、MinIO、Redis、RAGFlow。app 挂 `appstore:/app/data/store`；Caddy 对外映射 80/443，并按 `infra/cloud/Caddyfile` 反代 `app:3000`；RAGFlow 仅 `expose:9380` 供容器网使用，依赖 ES/MySQL health；ES/MySQL/MinIO/Redis 各用命名卷，RAGFlow 依赖其环境变量/默认回退。Caddy 证书状态在 caddy_data/caddy_config volumes；应用运行环境来自 `.env.production`。`bootstrap.sh` 安装 Docker、设 Elasticsearch `vm.max_map_count`、swap、UFW，并 clone 到 `/opt/xingtong-cat`。

`.github/workflows/deploy.yml` 在 push main 或手动触发后，SSH 至服务器、`git pull --ff-only`、用 `.env.production` 执行 compose up build；它依赖 `SERVER_HOST`、`SERVER_USER`、`SERVER_SSH_KEY`。不要把任何实际变量写入 Wiki。

## 上线前检查

- `docker compose -f infra/docker-compose.prod.yml --env-file .env.production config`
- `docker compose ... up -d --build` 后以现有 `/api/community` 检查可达性；`docs/云上部署.md` 提到的 `/api/health` **尚不存在**。
- 文档所称 SSH 隧道 localhost:9380 与当前 RAGFlow `expose` 不匹配；需绑定 loopback port 或提供受控代理。
- RAGFlow 依赖服务有默认密码回退，生产必须覆盖；app/caddy/ragflow 也未定义 healthcheck。

## 生产运行契约

启动前校验必填 app/LLM/微信/域名和非默认 RAGFlow secret，缺失即拒绝部署；以 secret store 注入，不依赖 Compose 默认密码。为 app 增加检查 Next 可达和本地 `data/knowledge` 可读的 health endpoint，为 Caddy 检查反代，为 RAGFlow 检查 HTTP readiness；Compose 以 `depends_on: service_healthy` 门控依赖服务，但 app 对 RAGFlow 保持非阻塞。

RAGFlow 不可用时，应用应记录不含敏感查询的结构化降级事件并运行 local 检索。`data/knowledge` 不可读时 health 不健康并阻止新演练，不能静默生成无知识会话；`data/store` 不可写时 health 不健康并拒绝所有产生状态的请求，同时返回不含敏感字段的诊断原因。定期备份并演练恢复 `appstore` 和 RAGFlow 数据卷，最小权限隔离服务网络/管理端。

部署验证至少包括：compose config、首次启动、appstore 重启后用户/token/积分/session/report/progress/toy 仍在、RAGFlow 延迟时 local 命中、Caddy HTTPS 反代、缺变量启动失败，以及模拟知识卷不可读和数据卷不可写。RAGFlow 配置见[运维](ragflow-ops.md)，变量见[配置](configuration.md)。