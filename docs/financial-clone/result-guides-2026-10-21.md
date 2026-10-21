# 结果解释与可引用算例优化 — 2026-10-21

用户要求将域名放到最后，继续优化其他 SEO/GEO 项目。本轮不配置域名、不启用收录、不修改计算模型，也不添加外部 API。

## 页面内容

- 12 个高需求工具新增独立结果解释：Mortgage、Mortgage Payoff、Rent、House Affordability、Auto Loan、Savings、Retirement、HELOC、401K、Debt Payoff、RMD、Take-Home Paycheck。
- 每页提供直接回答、实际结果标签的定义、两步同口径比较流程，以及至少三条单位/时点/适用范围检查。
- 全部 75 个计算器指南增加 Examples、Questions、Assumptions、Sources 页内导航；增强页面增加 Reading results 和 Compare scenarios 锚点。
- WebPage 结构化数据只引用实际存在的结果解释与方案比较段落。不新增虚构作者、专业审核身份、评级、FAQ 富结果或 AI 引用承诺。
- 新增解释的检查日期独立标注为对本地模型的核对，不将其混称为官方参数更新或独立专业审核。

## 七个新增可复算算例

1. 无债务时的租金预算：月收入 $10,000、30% 房租比例与 36% 总债务比例，预算 $3,000。
2. 同收入加入 $1,800 月债务，预算降到 $1,800。
3. $100,000 房贷、6%、30 年，加入年度税 $1,200 与保险 $600，初始总月供 $749.55，而本息仍为 $599.55。
4. 立即退休、两年每年需要 $12,000、现有 $5,000、零收益零通胀，即时缺口 $19,000。
5. $1,000 余额每月取 $300、零收益，第四笔为 $100。
6. HELOC 零利率但提款期年费 $120，年费单列而非记作利息。
7. 汽车价格 $12,000、首付 $2,000、十个月零利息且无税费，月供 $1,000，说明贷款支付总额与首付不同。

算例覆盖 5 个工具，全部通过真实函数计算和预先写定的独立手算预期。全站算例从 109 增至 116；既有模型数量仍为 174。

## 验证

- `npm test`：491 项通过，新增 7 个指南算例测试和结果标签/内容结构校验。
- `npm run build`：纯静态构建通过。
- `python scripts/check-guide-insights.py`：75 页导航与 12 页解释正文、比较流程、锚点通过。
- `python scripts/check-seo-build.py`：80 页静态 SEO 检查通过，预览仍 noindex。
- `node --import tsx scripts/check-page-intents.mts`：75 个工具 / 149 个词与表达的页面归属检查通过。
- 浏览器结果记录：evidence/browser-seo-qa.json 和 evidence/browser-guide-insights-qa.json。

没有测量真实收录、排名、自然流量或 AI 引用。本轮提升解释质量与可复核性，不能据此保证搜索效果。域名、正式 canonical/sitemap 和 Search Console 留待用户要求时处理。

浏览器验证完成：124 项检查覆盖 116 个可复算算例；12 个增强指南均通过锚点导航与 390px/768px 检查，脚本错误为 0。
