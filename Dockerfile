# ---- 构建阶段 ----
FROM node:24-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- 运行阶段 ----
FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
# 应用代码（含 data/knowledge 种子知识，运行期读取）
COPY --from=builder /app ./
EXPOSE 3000
CMD ["npm", "run", "start"]
