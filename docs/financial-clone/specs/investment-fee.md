# Investment Fee Calculator

Independent user-requested fixed-formula tool. No external data, policy parameters or original-source equivalence claim. USD display; user-entered rates/costs.

## Fee Impact (`impact`)

Estimate expense-ratio and advisor-fee costs and their long-term effect on your balance.

Formula: Balance = opening × (1 + return) × (1 − applicable fund fee) × (1 − advisor fee) + year-end deposit.

- balance: Starting investment; default 10000; unit $
- deposit: Annual contribution; default 1000; unit $
- years: Investment years; default 20; unit years
- rate: Annual rate; default 8; unit %
- basis: Return input basis; default Before fund fees; unit selection; options Before fund fees, After fund fees
- fund: Fund expense ratio; default 0.2; unit %
- advisor: Annual advisor fee; default 0; unit %

## Compare Fees (`compare`)

Compare two fee structures under the same return and annual contribution assumptions.

Formula: Compare annual balance recurrences for option A and B; advantage = B − A.

- balance: Starting investment; default 10000; unit $
- deposit: Annual contribution; default 1000; unit $
- years: Investment years; default 20; unit years
- rate: Annual rate; default 8; unit %
- basis: Return input basis; default Before fund fees; unit selection; options Before fund fees, After fund fees
- fund: Fund expense ratio; default 0.2; unit %
- advisor: Annual advisor fee; default 0; unit %
- fund_b: Option B fund expense ratio; default 0.05; unit %
- advisor_b: Option B advisor fee; default 0; unit %

See evergreen-additions-2026-10-21.md for assumptions, overlap decisions and checks.
