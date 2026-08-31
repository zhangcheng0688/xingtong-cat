# RAGFlow 接入指南

> 定位说明（重要）：**RAGFlow 不是一个 npm 包**，它是一个独立部署的检索引擎
> （Docker 容器组：Elasticsearch + MySQL + MinIO + Redis + RAGFlow Server）。
> 我们的 Next.js 后端通过它的官方 HTTP API 调用它。
> 项目代码侧已全部就绪（`lib/knowledge.ts` 双后端 + 自动回退），
> 你只需要把引擎跑起来、建库、拿三个值填进 `.env.local`。

## 一、启动 RAGFlow 引擎

本机 Docker 由 colima 提供（已安装，未启动）：

```bash
colima start --cpu 4 --memory 8   # RAGFlow 全家桶建议至少 4C8G
```

然后两条路任选：

### 路径 A · 官方标准版（推荐，踩坑最少）

```bash
git clone --depth 1 https://github.com/infiniflow/ragflow.git
cd ragflow/docker
docker compose up -d
```

### 路径 B · 本项目简化模板

```bash
cd infra/ragflow
docker compose up -d
```

> 本模板是我们按官方结构精简的参考版（slim 镜像，不含内置嵌入模型——
> 反正我们要外接百炼的 qwen3.7-text-embedding）。若启动异常，以路径 A 为准。

启动后打开 `http://localhost:9380`，注册一个账号（首个注册用户即管理员）。

## 二、配置嵌入模型（接阿里百炼）

RAGFlow 需要嵌入模型把知识切成向量。复用我们已有的百炼工作区：

1. RAGFlow 页面右上角头像 → **模型提供商** → 添加 **OpenAI-API-Compatible**；
2. 填写：
   - Base URL：`https://ws-gv2fw79dg9wydavs.cn-beijing.maas.aliyuncs.com/compatible-mode/v1`
   - API Key：你的百炼工作区 Key（同 `.env.local` 的 `KIMI_API_KEY`）
   - 模型类型：**Embedding**，模型名：`qwen3.7-text-embedding`
3. 点测试通过后保存。（向量维度等参数以 RAGFlow 测试按钮返回为准）

## 三、建知识库并灌入种子知识

1. 左侧 **知识库** → 新建，命名「星童干预知识库」，嵌入模型选上一步配的；
2. 上传本项目 `data/knowledge/` 下的 10 篇 Markdown
   （ABA、沟通促进、DSM-5、情绪共调、地板时光、专业边界、场景库、感统、社交故事、视觉支持）；
3. 点 **解析**（Parse），等状态变成「成功」；
4. 从浏览器地址栏 `/dataset/<这串就是 dataset_id>` 复制数据集 ID。

## 四、拿 API Key

右上角头像 → **API** → **Create new key**，复制 `ragflow-...` 开头的 Key。

## 五、填进项目环境变量

`.env.local` 追加四个值：

```bash
KNOWLEDGE_BACKEND=ragflow
RAGFLOW_BASE_URL=http://localhost:9380
RAGFLOW_API_KEY=ragflow-xxxxxxxx
RAGFLOW_DATASET_ID=<第三步复制的数据集ID>   # 多个库用逗号分隔
```

## 六、验证

```bash
node scripts/test-knowledge.ts
```

输出 `检索后端=ragflow` 且命中 3 条即为接入成功。

## 七、稳定性设计（已内置在代码里）

- **超时**：RAGFlow 检索 10 秒超时（`AbortSignal.timeout`），不会拖死演练流程；
- **自动回退**：RAGFlow 不可达 / 返回错误 / 无命中，三种情况都自动回退到
  本地 10 篇种子知识的关键词检索，用户侧无感知；
- **随时切回**：把 `KNOWLEDGE_BACKEND` 改回 `local`（或删掉 RAGFLOW_* 变量）即可。

## 八、检索 API 参考（代码里已封装）

`POST {RAGFLOW_BASE_URL}/api/v1/retrieval`，Header `Authorization: Bearer <API_KEY>`，
Body：`question`（必填）、`dataset_ids`（必填）、`page`、`page_size`、
`similarity_threshold`（默认 0.2）、`vector_similarity_weight`（默认 0.3）、`keyword`。
返回 `data.chunks[]`（含 `content`、`similarity`、`doc_name`）。
官方文档：https://ragflow.io/docs/http_api_reference
