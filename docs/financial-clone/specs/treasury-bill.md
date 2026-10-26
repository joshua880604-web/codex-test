# Treasury Bill Calculator

ID treasury-bill; modes discount/price. Approved independent new tool, reviewed2026-10-27. Canonical https://www.calculatorfree.io/treasury-bill-calculator; static file /treasury-bill-calculator.html.

Defaults: face$10,000,91 days,bank discount4.5% or price$98 per$100 face,annualization year365,fee0,federal24%,additional surtax0. Face100..1e9 in$100 increments; days integer1..366; year365/366; discount0..99%; quote>0 and<=100; calculated purchase price>0 and<=face; sum federal+surtax<100%. Fee0..1e9. Annualization overflow gives a readable error.

Price=face(1−discount×days/360), or face×price-per100/100. Interest=face−price. Holding return=interest/price. Bank discount=interest/face×360/days. Simple annualization=holding return×selected-year-days/days; effective annual comparison=(face/price)^(selected-year-days/days)−1. Simple365/366 annualization is explicitly NOT official Treasury auction Investment Rate. Effective annual comparison assumes same-rate reinvestment, not a forecast. Changing annualization basis never changes360-day pricing.

Tax=(face−price)×entered federal+surtax. State/local bill-interest tax0. Net profit=face−price−fee−tax; net holding return uses total cost(price+fee), retaining fee losses. Tax estimation ignores fee basis adjustments and tax-year/accrual rules. Two cash-flow rows: purchase−(price+fee), maturity+(face−tax). No daily interest payout or growth curve is invented. Manual quotes only; no secondary-sale/premium valuation,investor eligibility,ladder or retirement-account model. A52-week example uses364 days, not automatically365; input actual settlement-to-maturity days.

Shared compact workspace,mode tabs/select,Calculate/Reset,validation,full metrics,CSV,richPNG with opt-in inputs and freebadge,share/print. Independent pricing example from TreasuryDirect:1,000 face,182 days,0.145% discount =>999.2669444444 unrounded purchase price. Quote example:10,000 face at98,fee10,tax24% =>net profit142. See investment-decisions-2026-10-27.md. Native Safari and broker/auction submitted-result parity unverified.
