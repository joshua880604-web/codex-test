# Bond Calculator

```json
{
  "id": "bond",
  "title": "Bond Calculator",
  "category": "Investment",
  "source_url": "https://www.calculator.net/bond-calculator.html",
  "modes": [
    "solve price",
    "solve face",
    "solve yield",
    "solve maturity",
    "solve coupon",
    "bond pricing between coupons"
  ],
  "fields": [
    "price",
    "face",
    "yield",
    "maturity years",
    "annual coupon amount/percent",
    "coupon frequency",
    "maturity date",
    "settlement date",
    "day count 30/360,Actual/360,Actual/365,Actual/Actual"
  ],
  "outputs": [
    "missing selected value",
    "dirty price",
    "clean price",
    "accrued interest",
    "days since coupon"
  ],
  "assumptions": [
    "Coupon-date price=sum(discounted coupons)+discounted redemption; enter four values to solve fifth. Separate dated pricing requires coupon calendar/accrual conventions."
  ],
  "source_year": null,
  "limits": [
    "Exact 30/360 variant unknown; holiday/end-of-month convention unknown."
  ]
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/bond-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Solve Price (price)

Local inputs: face, coupon, coupon_unit, yield, years, frequency.

Local formula: Price = coupon × annuity factor + face/(1+y/f)^(years×f).

Local default outputs: price.

### Solve Face (face)

Local inputs: price, coupon, coupon_unit, yield, years, frequency.

Local formula: Price = coupon × annuity factor + face/(1+y/f)^(years×f).

Local default outputs: face.

### Solve Yield (yield)

Local inputs: price, face, coupon, coupon_unit, years, frequency.

Local formula: Price = coupon × annuity factor + face/(1+y/f)^(years×f).

Local default outputs: yield.

### Solve Maturity (years)

Local inputs: price, face, coupon, coupon_unit, yield, frequency.

Local formula: Price = coupon × annuity factor + face/(1+y/f)^(years×f).

Local default outputs: Years to maturity.

### Solve Coupon (coupon)

Local inputs: price, face, coupon_unit, yield, years, frequency.

Local formula: Price = coupon × annuity factor + face/(1+y/f)^(years×f).

Local default outputs: coupon.

### Settlement-Date Pricing (dated)

Local inputs: face, coupon, coupon_unit, yield, frequency, settlement, maturity, daycount.

Local formula: Dirty price discounts all remaining payments; clean price = dirty price − accrued coupon.

Local default outputs: Clean price; Dirty price; Accrued interest; Interest accrued days.
