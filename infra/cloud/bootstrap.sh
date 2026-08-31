#!/usr/bin/env bash
# 星童猫咪 · 云服务器一键初始化（Ubuntu 22.04/24.04，任意云通用）
# 用法：ssh root@你的服务器 'bash -s' < infra/cloud/bootstrap.sh
#   或先登录服务器：curl -fsSL https://raw.githubusercontent.com/zhangcheng0688/xingtong-cat/main/infra/cloud/bootstrap.sh | bash
set -euo pipefail

echo "==> [1/6] 系统依赖"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq git curl ufw >/dev/null

echo "==> [2/6] 安装 Docker"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
fi

echo "==> [3/6] Docker 加速器 + ES 内核参数"
mkdir -p /etc/docker
cat > /etc/docker/daemon.json <<'JSON'
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://docker.1ms.run",
    "https://docker.nju.edu.cn"
  ]
}
JSON
# Elasticsearch 硬性要求 vm.max_map_count >= 262144
sysctl -w vm.max_map_count=262144
grep -q "vm.max_map_count" /etc/sysctl.conf || echo "vm.max_map_count=262144" >> /etc/sysctl.conf
systemctl restart docker

echo "==> [4/6] 4G Swap（防构建时内存打满）"
if [ ! -f /swapfile ]; then
  fallocate -l 4G /swapfile && chmod 600 /swapfile
  mkswap /swapfile >/dev/null && swapon /swapfile
  echo "/swapfile none swap sw 0 0" >> /etc/fstab
fi

echo "==> [5/6] 防火墙：只开 22/80/443"
ufw allow 22/tcp >/dev/null
ufw allow 80/tcp >/dev/null
ufw allow 443/tcp >/dev/null
ufw --force enable >/dev/null

echo "==> [6/6] 拉取项目代码"
if [ ! -d /opt/xingtong-cat ]; then
  git clone https://github.com/zhangcheng0688/xingtong-cat.git /opt/xingtong-cat
else
  git -C /opt/xingtong-cat pull --ff-only
fi

cat <<'EOF'

✅ 初始化完成！接下来手动三步：

1) 配置生产环境变量（密钥）：
     cd /opt/xingtong-cat
     cp .env.example .env.production
     nano .env.production
   必填：KIMI_API_KEY / KIMI_BASE_URL / XINGTONG_MODEL、DASHSCOPE_*（语音）、
         KNOWLEDGE_BACKEND=ragflow、RAGFLOW_BASE_URL=http://ragflow:9380
   注意：RAGFLOW_API_KEY / RAGFLOW_DATASET_ID 要等下面第 3 步建库后回填。

2) 设置域名（已备案并解析到本机）：
     echo 'DOMAIN=api.你的域名.com' >> .env.production

3) 启动 + 初始化 RAGFlow：
     docker compose -f infra/docker-compose.prod.yml --env-file .env.production up -d --build
     ssh -L 9380:localhost:9380 root@本机   # 本地浏览器开 http://localhost:9380
     按 docs/RAGFlow接入.md 第二~四步：配百炼 embedding → 建库传 10 篇知识 → 拿 API Key
     把 RAGFLOW_API_KEY / RAGFLOW_DATASET_ID 回填 .env.production，然后：
     docker compose -f infra/docker-compose.prod.yml --env-file .env.production up -d

EOF
