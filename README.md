# Financial Calculators

面向英文用户的本地金融计算器站。项目目录：`/workspace/financial-calculators`。

当前覆盖原金融区的全部 **71 个入口**：70 个具有计算功能的工具，以及原站本就没有计算表单的 Real Estate 目录。各工具有独立路由和计算函数，未放置 Coming soon 页面，也未用固定结果代替计算。

**此版本可以本地运行，但尚未完成 Calculator.net 全部交互、字段和视觉的一对一验收。** 不要把本地默认值测试通过解释为原站功能完全一致。精确状态见 `docs/financial-clone/progress.json`、`coverage.json` 和 `remaining-work.md`。

## 本地运行

要求 Node.js 24+。当前环境已经安装依赖，并完成生产构建。开发：

```bash
cd /workspace/financial-calculators
npm run dev
```

生产运行：

```bash
npm run build
npm run start
```

在运行服务器的机器访问 `http://localhost:3000/financial-calculator.html`。当前目录在云端；用户电脑上的 localhost 不指向这台云端机器。远程查看需要宿主支持的端口预览或转发，不能把该地址当作已发布的网址。

在新环境恢复依赖：`npm ci`。依赖版本由 `package-lock.json` 固定。启动脚本使用 Node 24 的环境代理支持；保留宿主注入的代理和 CA 配置。

**未创建任何公开站点或执行部署。**

## 检查

```bash
npm run typecheck
npm test
npm run build
```

本地浏览器检查：先启动生产服务器，再运行 `node scripts/browser-qa.mjs`。脚本优先使用已安装的 Playwright，当前云端回退到宿主提供的模块。Chromium 默认 `/usr/bin/chromium`，可以用 `CHROMIUM_PATH` 指定。其他环境需提供自己的 Playwright 和 Chromium；不会自动下载浏览器。

检查报告和截图保存在 `docs/financial-clone/evidence/`。浏览器检查覆盖本地全部金融入口和模式，并抽查桌面/平板/手机布局、输入变更、重置、CSV、搜索和 404。原站视觉/提交检查另行记录，尚未完成。

## 结构

- `src/lib/finance.ts`：借贷、年金、利率换算、IRR、现金流等基础数学函数。
- `src/lib/calculators/`：按房产汽车、投资、退休、税薪、其他工具分别实现的具体业务模型。
- `src/lib/tax.ts`：2025/2026 联邦税估算、资本利得、社保计税、OBBBA 扣除与选定抵免。
- `src/components/`：英文目录、独立表单、结果摘要、图表、表格、分享和导出。
- `src/app/api/rates/`：公开参考汇率/比特币报价接口；不发送计算金额、不需要用户账户。
- `docs/financial-clone/research/`：逐工具研究、官方参数、参考案例和数据来源。
- `.agents/skills/financial-calculator-clone/SKILL.md`：已安装的项目专用 skill。

## 数据与模型

- IRS 2025/2026 税阶、标准扣除、选定扣除/抵免；SSA 2026 工资基数和退休年龄规则。
- IRS RMD Table III、完整 Table II 20–120+ 岁矩阵；不对出版物未提供的年龄插值。
- BLS CPI-U：1913 至 2026 年 9 月实际取得的数据。2026 年均尚不存在，2025 年 10 月官方缺失值不插补。
- Frankfurter v2：165 个实际返回的法币和带日期的参考快照。联网失败时清楚标识已存快照及各组成日期，不能将其称作实时市场报价。
- BTC 使用 Coinbase 公共 spot endpoint；若不可达则明确报错，允许手动输入，绝不填造 BTC 价格。
- 金额内部保留浮点精度，最终显示两位小数；还款测试检查本金守恒与末期截断。并未声称等同于所有银行的逐日/逐分舍入政策。

税务、养老、费用和比较模型的适用范围写在各结果注释与 `remaining-work.md`。没有把不明确的规则藏在任意常量里，也没有宣称未运行的检查已经通过。

本轮补充：贷款还款表支持按期／年度切换并导出对应 CSV；汽车贷款增加 8 个州的有来源税基规则（税率仍手动输入）；现金返还比较纳入税费和置换车辆；折旧增加实际日期分摊并修正余额递减法末年处理；债券修正月末付息日期。232 项自动检查通过，完整原站一致性仍待核对。
