# 第十九届国际道学研讨会网站

2027 年第十九届国际道学研讨会的公开网站、报名系统与内容管理后台。应用以 Cloudflare Worker 运行，普通访客无需 ChatGPT 或其他账户即可浏览和报名。

## 系统组成

- 公开会议网站：主题、议题、主办单位、日程、考察、会场与常见问题。
- 在线报名：服务端校验、提交频率限制、D1 持久化与登记编号。
- 管理后台：独立管理员密码、签名会话 Cookie、报名筛选与 CSV 导出。
- 内容管理：会议文字配置与 Cloudflare KV 图片素材上传、替换和删除。
- 自动部署：`main` 分支通过 GitHub Actions 验证、迁移 D1 并发布 Cloudflare Worker。

## 本地运行

需要 Node.js 22.13 或更高版本。

```bash
npm install
npm run db:migrate:local
npm run dev
```

本地首页通常为 `http://localhost:3000`，后台为 `http://localhost:3000/admin`。若要完整测试登录，需要在忽略提交的 `.dev.vars` 中配置下面列出的管理员密钥。

## Cloudflare 资源

项目通过 [wrangler.jsonc](./wrangler.jsonc) 声明：

- D1：`dao-conference-2027`，绑定名 `DB`
- KV：`dao-conference-2027-media`，绑定名 `MEDIA`
- 登录和报名频率限制：`LOGIN_RATE_LIMITER`、`REGISTRATION_RATE_LIMITER`

首次部署需要先登录并创建资源：

```bash
npx wrangler login
npx wrangler d1 create dao-conference-2027
npx wrangler kv namespace create dao-conference-2027-media
npm run db:migrate:remote
```

D1 创建命令返回的 `database_id` 和 KV 创建命令返回的 `id` 必须写入 `wrangler.jsonc`。随后通过 `wrangler secret put` 配置以下 Worker 密钥：

- `ADMIN_EMAIL`：管理员邮箱
- `ADMIN_NAME`：后台显示名称
- `ADMIN_PASSWORD_SALT`：随机盐值
- `ADMIN_PASSWORD_HASH`：密码经 PBKDF2-SHA256、210000 次迭代得到的 Base64URL 值
- `ADMIN_SESSION_SECRET`：至少 32 字节的随机会话签名密钥

密钥只保存在 Cloudflare，不应写入 Git 或 `.openai/hosting.json`。

## 验证与发布

```bash
npm run lint
npm test
npm run deploy:cloudflare
```

生产环境部署后：

- `/` 为公开会议网站
- `/admin` 为受密码保护的后台
- `/api/admin/registrations/export` 在管理员登录后导出 UTF-8 CSV

## GitHub 自动部署

[Cloudflare 部署工作流](./.github/workflows/deploy-cloudflare.yml)需要仓库 Actions secrets：

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

API Token 至少需要 Workers Scripts、D1 和 Workers KV 的编辑权限。管理员登录密钥继续保存在 Cloudflare Worker Secrets 中，不复制到 GitHub。

## 数据与安全边界

- 前台为公开访问；后台不依赖 ChatGPT 登录。
- 后台 Cookie 使用 `HttpOnly`、`Secure` 和 `SameSite=Strict`。
- 密码不会明文存储；生产环境只有 PBKDF2 哈希与盐值。
- 报名数据位于 D1，会议图片位于 KV；GitHub 仓库不包含生产数据。
- D1 数据与 KV 文件不会因常规 Worker 部署而被覆盖。
