# 小红书云端发布 Worker

部署到 Railway / Fly / 任意 Docker 主机。主站（Netlify Next.js）用 `XHS_WORKER_SECRET` 调用。

> 非官方自动化：有封号与接口变更风险；页面会提示用户先预览再确认。

## Worker 环境变量

| 变量 | 说明 |
|------|------|
| `XHS_WORKER_SECRET` | 与主站相同的共享密钥（必填） |
| `PORT` | 默认 `8787` |
| `XHS_CHROME_HEADLESS` | Docker 默认 `1` |
| `XHS_CHROME_NO_SANDBOX` | Docker 默认 `1` |

## 主站（Netlify）环境变量

| 变量 | 说明 |
|------|------|
| `XHS_WORKER_URL` | Worker 公网根地址，如 `https://xxx.up.railway.app` |
| `XHS_WORKER_SECRET` | 与 Worker 相同 |
| `XHS_SESSION_CRYPTO_KEY` | AES 加密绑定会话（≥16 字符；可不设则回退 `SESSION_SECRET`） |
| `DATABASE_URL` | 需已跑 `XhsBinding` 迁移 |

Prisma：`npx prisma migrate deploy`（或仓库里的 `npm run db:deploy`）。

## 本地跑 Worker

```bash
cd tools/cutpost
python -m venv .venv
# Windows:
.\.venv\Scripts\activate
pip install -r requirements.txt
cd ../..
set XHS_WORKER_SECRET=dev-secret
python services/xhs-worker/app.py
```

主站 `.env.local`：

```
XHS_WORKER_URL=http://127.0.0.1:8787
XHS_WORKER_SECRET=dev-secret
XHS_SESSION_CRYPTO_KEY=dev-crypto-key-16+
```

## Railway 部署要点

1. Root Directory 留空（仓库根），Dockerfile 路径设为 `services/xhs-worker/Dockerfile`
2. 配置 `XHS_WORKER_SECRET`
3. 健康检查：`GET /health`
4. 公网域名的 **Target Port** 必须等于容器内 `$PORT`（Railway 常为 `8080`），不要填 Dockerfile 里的 `EXPOSE 8787`
5. 把公网 URL 填进 Netlify 的 `XHS_WORKER_URL`

## 产品路径

`/zh/xhs`：生成草稿 → 登录本站 → 扫码绑定 → 预览 → 确认发布。结果页「发到小红书」会把行程写入 `sessionStorage` 并跳转到该页。
