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
