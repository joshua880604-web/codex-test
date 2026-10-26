# Biweekly Mortgage Payment Calculator

Route /biweekly-mortgage-calculator.html, mode biweekly. Fields: current principal, nominal annual rate, remaining whole years plus 0–11 months, extra per biweekly payment. Term 1–480 months; rate 0–30%; principal positive.

Monthly contractual payment uses ordinary annuity math at annual/12. Biweekly payment = monthly/2 + extra. Amortize with annual/26, 26 equally spaced modeled periods/year, immediate crediting and capped last payment. Matched-budget monthly payment = biweekly×26/12. Report payment, annual budget, interest savings against standard and matched monthly, count and payoff years. Group 26 rows/year. No day-count simulation, payment-calendar dates, ownership costs, partial-payment holding or service charges. Explain 26 versus 24 and possible 27 calendar pay dates.

Use actual result rows for full-main-column trend, detail tables, CSV and opt-in-input PNG. Independent high-precision closed-form fixture plus zero-rate/partial-term/final-payment/annual-conservation tests. FNCalculator is a scenario reference, not a numeric-parity certification.
