# 原站直接访问核验 — 2026-10-20

本轮实际访问原站 Loan、HELOC、Retirement、401K、VAT 页面；尝试 Loan 两组自定义参数页和 HELOC 自定义参数页，均返回读取工具 Internal Error / URL inaccessible。普通页面可读，但输入数值和下拉选择被替换为 [Input] / [Select]。因此不能宣称成功提交原站表单或完成同输入对照。

## 可取得的证据

| 工具 | 原站可见数值 | 本地对应结果 | 证据强度 |
| --- | --- | --- | --- |
| Loan | 月付 1,110.21；120 次合计 133,224.60；利息 33,224.60 | 本地 100,000 / 10 年 / 6% 月复利月付，显示数值相同 | 重建场景吻合；原站输入不可见 |
| HELOC | 提款期月付 333.33；偿还期月付 477.83；总付 106,008.69；利息 56,008.69 | 本地 50,000 / 8% / 5 年提款期 / 15 年偿还期 / 无费用，显示数值相同 | 表格可见本金和 60 个月提款期；利率和偿还期重建，费用选项不可见 |
| 401K | 原站明文说明：50% 匹配、最多覆盖工资 6%，雇主最多为工资 3% | 年薪 60,000、本人工资 6% 缴款时，雇主 1,800 | 公开规则吻合；非提交表单 |
| VAT | 原站正文 10% 税率，净价 5 / 10 / 20 对应税 0.50 / 1 / 2 | 本地对应金额一致 | 明文数值算例吻合；非提交表单 |

Retirement 页面可确认四组输入功能，但此次没有可读的计算结果。401K 的整体累积、提款结果也没有取得。不能根据两者表单存在而判定数值一致。

## 可重跑记录

运行 `node --import tsx scripts/direct-reference-check.mts` 计算本地对应案例；输出 JSON 保存原站本轮人工摘录的数值、证据类型、推定输入限制及差异。脚本本身不会访问原站，不能替代新一轮在线核验。

- evidence/direct-reference-check-2026-10-20.json
- 同输入原站提交验证数：0
- 完整等价通过工具数：0
- 本轮未修改计算公式。

## 原站链接

- https://www.calculator.net/loan-calculator.html
- https://www.calculator.net/heloc-calculator.html
- https://www.calculator.net/retirement-calculator.html
- https://www.calculator.net/401k-calculator.html
- https://www.calculator.net/vat-calculator.html
