# Real Return Calculator

Independent user-requested fixed-formula tool. No external data, policy parameters or original-source equivalence claim. USD display; user-entered rates/costs.

## Real Return (`rate`)

Convert a nominal annual return into an inflation-adjusted real rate using the exact Fisher relationship.

Formula: Real return = (1 + nominal return) / (1 + inflation) − 1.

- nominal: Nominal annual return; default 8; unit %
- inflation: Annual inflation rate; default 3; unit %

## Purchasing Power (`value`)

Estimate the future purchasing power of an investment under constant return, inflation and an optional simplified annual tax rate.

Formula: After-tax rate = nominal − max(nominal, 0) × tax; real value = principal × ((1 + after-tax rate) / (1 + inflation))^years.

- principal: Starting amount; default 10000; unit $
- nominal: Nominal annual return; default 8; unit %
- inflation: Annual inflation rate; default 3; unit %
- years: Number of years; default 10; unit years
- tax: Assumed tax on positive annual gains; default 0; unit %

## Required Nominal Return (`nominal`)

Find the nominal annual return needed for a target real return at an entered inflation rate.

Formula: Nominal = (1 + real return) × (1 + inflation) − 1.

- real: Target real annual return; default 5; unit %
- inflation: Annual inflation rate; default 3; unit %

See evergreen-additions-2026-10-21.md for assumptions, overlap decisions and checks.
