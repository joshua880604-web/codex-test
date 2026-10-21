# 美国关键词数据落地 — 2026-10-21

依据用户本轮八张 Google Keyword Planner 截图，记录美国、英语、过去 12 个月月均搜索量。完整查询词与部分被截断的截图标签按此前发送的查询清单对应；所有数值均为用户资料，未经独立审计。精确统计日期未提供。近义词可能共享搜索量，不相加预测流量；广告竞争度不是自然排名难度。

## 已实施

- 整理 79 行资料（包含 1 行无搜索量估计）；Cash Back vs Low Interest 未显示在截图中，不补造数值。见 research/us-keywords-2026-10-21.json。
- 36 个页面标题依据已查询的主词调整；汽车贷款、工资、租金预算、提前还贷、HELOC、房屋净值贷款、再融资等保持稳定 URL，不新增重复页面。
- 当前全部 75 个计算器共 99 个用途入口，覆盖 149 个不重复的主词和辅助表达。近义词合并到同一计算卡片的 Related searches，避免同一模式生成多段重复说明。
- 日复利、月复利和 2026 税年链接带相应预选参数。收益率、税年和模式须在实际表单生效后才算通过，不只核验字符串出现。
- 现有用途支持现金套现再融资、房贷额外还款、提前结清、租金预算和退休提款。High yield savings 明确仅使用用户输入的利率，没有当前银行利率推荐或 API 请求。
- 新增债务雪球模式：月度计息并支付各债最小额后，以剩余余额从小到大分配额外还款；相同余额按较高 APR 优先。原有 avalanche 高 APR 优先模式不变。无新增借款和费用，利率/最低还款额固定，不声称雪球必然省息。
- 新增 Markup from Cost 模式：售价=成本×(1+加价率)，同时显示利润和毛利率，明确加价率与利润率分母不同。
- 增加上述两项可复算算例和相关 FAQ。数学守恒与独立手算结果有测试覆盖。

## 尚不作为对应功能宣传的词

- closing cost calculator：现有首付工具接受已知费用，未自动估算完整分项结算成本。
- lease vs buy car calculator：现有租车与车贷分别可算，未制作同口径比较模式。
- compound interest calculator with withdrawals：退休工具支持提款，但不冒充通用存取款增长模型。
- discounted payback period calculator：普通回收期与折现回收期分开，未将普通结果改标题宣传。
- social security break even calculator：当前比较领取方案现值，没有明确交叉年龄结果。
- mutual fund expense ratio calculator：当前可输入费率估算费用影响，不提供从费用金额倒推费率的专用工具。
- credit card payoff calculator extra payments：可输入总月供，但尚无独立“基础月供+额外月供”的对照结果。

上述词在数据文件中保留 feature_gap_do_not_target，待补功能再布局。本轮未以关键词代替缺失功能。

## 验证与发布

483 项测试及静态生产构建通过；80 页 SEO 检查和 75 页 / 149 个表达的静态正文、链接、标题归属检查通过。浏览器记录见 evidence/browser-static-qa.json、browser-seo-qa.json、browser-demand-qa.json。

仍为纯静态，无外部 API，默认 noindex；正式 SEO 收录需要真实域名与构建配置。无自然排名/AI 引用效果结论。尚未上传 GitHub 或部署。原站完整数值等价未验证。

本轮浏览器实测：76 个入口 / 174 个模式通过，外部请求 0、API 请求 0、脚本错误 0；SEO/算例共 117 项检查（109 个算例）；研究词预选、模式链接与两档手机/平板布局专项 13 项通过。
