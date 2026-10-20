# Mortgage Payoff Calculator

```json
{
  "id": "mortgage-payoff",
  "title": "Mortgage Payoff Calculator",
  "category": "Mortgage and Real Estate",
  "source_url": "https://www.calculator.net/mortgage-payoff-calculator.html",
  "modes": [
    "known remaining term / pay all",
    "known remaining term / extras",
    "known remaining term / biweekly",
    "known remaining term / normal",
    "unknown remaining term / extras",
    "unknown remaining term / biweekly",
    "unknown remaining term / normal"
  ],
  "fields": [
    "original principal and original years if known",
    "remaining years/months if known",
    "otherwise current balance and monthly payment",
    "annual rate",
    "extra monthly/yearly/lump amount"
  ],
  "outputs": [
    "remaining balance",
    "original vs accelerated payments and interest",
    "payoff duration",
    "interest/time saved",
    "amortization link"
  ],
  "assumptions": "Known term infers current balance; unknown term solves remaining payment count. Need catch negative amortization. Exact biweekly interest convention unknown.",
  "source_year": "unknown (page fetched in 2026)",
  "fetched_at": "2026-10-19",
  "limits": "Exact defaults, select options, input bounds and error states unknown; no interactive or visual validation."
}
```

Implementation, original control values, source submissions, and original visual parity are tracked separately in progress.json. Local availability is not full parity.

## Current functional correspondence — 2026-10-20

Source: https://www.calculator.net/mortgage-payoff-calculator.html

Current policy: independently implemented corresponding functions; source defaults, select options and exact numerical parity remain unverified where not observable. Expert fallback is explicitly authorized. See ../strict-functionality-policy.md and ../reference-function-map.json.

### Current balance · Extra payments (remaining-extra)

Local inputs: principal, payment, rate, extra_monthly, extra_yearly, extra_once, extra_once_month.

Local formula: Remaining balance = P(1+i)^k − A((1+i)^k−1)/i; simulate subsequent repayments.

Local default outputs: Current principal balance; Interest with strategy; Interest saved; Years to payoff.

### Current balance · Normal repayment (remaining-normal)

Local inputs: principal, payment, rate, extra_monthly, extra_yearly, extra_once, extra_once_month.

Local formula: Remaining balance = P(1+i)^k − A((1+i)^k−1)/i; simulate subsequent repayments.

Local default outputs: Current principal balance; Interest with strategy; Interest saved; Years to payoff.

### Current balance · Biweekly (remaining-biweekly)

Local inputs: principal, payment, rate, extra_monthly, extra_yearly, extra_once, extra_once_month.

Local formula: Remaining balance = P(1+i)^k − A((1+i)^k−1)/i; simulate subsequent repayments.

Local default outputs: Current principal balance; Interest with strategy; Interest saved; Years to payoff.

### Current balance · Pay off now (remaining-all)

Local inputs: principal, payment, rate, extra_monthly, extra_yearly, extra_once, extra_once_month.

Local formula: Remaining balance = P(1+i)^k − A((1+i)^k−1)/i; simulate subsequent repayments.

Local default outputs: Payoff balance; Future interest avoided.

### Original loan · Extra payments (known-extra)

Local inputs: principal, years, months, rate, elapsed, extra_monthly, extra_yearly, extra_once, extra_once_month.

Local formula: Remaining balance = P(1+i)^k − A((1+i)^k−1)/i; simulate subsequent repayments.

Local default outputs: Current principal balance; Interest with strategy; Interest saved; Years to payoff.

### Original loan · Normal repayment (known-normal)

Local inputs: principal, years, months, rate, elapsed, extra_monthly, extra_yearly, extra_once, extra_once_month.

Local formula: Remaining balance = P(1+i)^k − A((1+i)^k−1)/i; simulate subsequent repayments.

Local default outputs: Current principal balance; Interest with strategy; Interest saved; Years to payoff.

### Original loan · Biweekly (known-biweekly)

Local inputs: principal, years, months, rate, elapsed, extra_monthly, extra_yearly, extra_once, extra_once_month.

Local formula: Remaining balance = P(1+i)^k − A((1+i)^k−1)/i; simulate subsequent repayments.

Local default outputs: Current principal balance; Interest with strategy; Interest saved; Years to payoff.

### Original loan · Pay off now (known-all)

Local inputs: principal, years, months, rate, elapsed, extra_monthly, extra_yearly, extra_once, extra_once_month.

Local formula: Remaining balance = P(1+i)^k − A((1+i)^k−1)/i; simulate subsequent repayments.

Local default outputs: Payoff balance; Future interest avoided.
