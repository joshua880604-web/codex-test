# 全站纯静态版本 — 2026-10-21

按用户要求改为 Next.js `output: export`，仅生成 HTML/CSS/JS/JSON 等静态资源。计算在浏览器执行，不需要服务器函数、Workers、数据库或外部 API。删除 `/api/rates` 和远程汇率代码；汇率仅保留手动和带原始日期的历史快照，BTC 可手动换算。旧分享链接 `mode=live` 映射到带日期快照，不冒充实时数据。

构建：`npm ci`、`npm run build`。输出 `out/`。本地使用 `npm run preview` 或 `npm start`，访问 http://localhost:3000。Node.js 24+ 仅用于开发、构建和本地静态预览，部署站点无需 Node 服务。

Cloudflare Pages 设置：构建命令 npm run build；输出目录 out；NODE_VERSION=24。直接上传时只上传 out 内文件。首页跳转配置在 public/_redirects。默认仍 noindex，正式收录须设置 SITE_URL 与 SITE_INDEXABLE=true 后重新构建。

Next.js 16 为带 .html 的 slug 产生 .html.html 文件及相邻 RSC 目录。构建后 finalize-static.mjs 将真实 HTML 归一化到既有 .html 文件名，清除冲突的同名 RSC 目录。当前站点使用普通 a 链接整页导航，不依赖 Next Link 的客户端路由/预取；未来引入该功能必须重验 RSC 路由。

当前 76 个目录入口、75 个计算器、172 个模式（金融 159），较前版少一个联网汇率模式，其余计算功能保留。官方数据与汇率快照需更新代码后重新构建，不在线自动刷新。源码中的出处链接仅在用户点击后访问，不是自动 API 请求。

476 项自动测试通过，静态生产构建通过。浏览器与导出文件检查结果见 evidence/browser-static-qa.json。本轮在本地实施，GitHub/托管发布状态另行记录。原站完整数值等价仍未验证。
