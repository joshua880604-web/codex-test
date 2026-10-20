# Pension Calculator

```json
{
  "id": "pension",
  "title": "Pension Calculator",
  "category": "Retirement",
  "source_url": "https://www.calculator.net/pension-calculator.html",
  "modes": [
    "lump sum vs monthly",
    "single life vs joint survivor",
    "work longer"
  ],
  "fields": {
    "lump sum vs monthly": [
      "retirement age",
      "lump sum",
      "return",
      "monthly pension",
      "COLA"
    ],
    "single life vs joint survivor": [
      "retirement age",
      "life expectancy",
      "spouse age at retirement",
      "spouse life expectancy",
      "single monthly",
      "joint monthly",
      "return",
      "COLA"
    ],
    "work longer": [
      "retirement age1/monthly1",
      "retirement age2/monthly2",
      "return",
      "COLA"
    ]
  },
  "outputs": [
    "option comparison and breakeven (proposed)"
  ],
  "assumptions": [
    "Discount or accumulate cash flows to common comparison date; continue survivor payments through spouse expectancy. No pension entitlement calculation from years worked."
  ],
  "source_year": null,
  "limits": [
    "Joint survivor percentage assumption and result details unknown."
  ]
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/pension-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Lump Sum vs. Monthly Pension (lump)

Local inputs: age, life, lump, monthly, return, cola.

Local formula: Pension value = present value of monthly pension benefits, adjusted for COLA.

Local default outputs: Present value of pension; Lump sum; Pension value advantage; Undiscounted break-even years.

### Single Life vs. Joint Survivor (survivor)

Local inputs: age, life, spouse, spouse_life, single, joint, survivor, return, cola.

Local formula: Discount single-life benefits, joint benefits during your life, and the survivor benefit thereafter.

Local default outputs: Single-life present value; Joint-survivor present value; Joint-survivor value advantage.

### Work Longer (longer)

Local inputs: age1, payment1, age2, payment2, life, return, cola.

Local formula: Discount each benefit stream to the earlier retirement age.

Local default outputs: Earlier pension present value; Later pension present value; Later pension advantage.
