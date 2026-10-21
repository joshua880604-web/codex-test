# Emergency Fund Calculator

Independent user-requested fixed-formula tool. No external data, policy parameters or original-source equivalence claim. USD display; user-entered rates/costs.

## Reserve Goal (`goal`)

Choose your reserve months to estimate an emergency fund target and savings gap.

Formula: Target = essential monthly expenses × reserve months; gap = max(0, target − savings).

- expenses: Essential monthly expenses; default 3000; unit $
- months: Target reserve months; default 6; unit months
- savings: Current emergency savings; default 5000; unit $

## Savings Plan (`plan`)

Find the number of whole monthly deposits needed to reach your selected emergency reserve.

Formula: Months = ceil(max(0, target − current savings) / monthly deposit).

- expenses: Essential monthly expenses; default 3000; unit $
- months: Target reserve months; default 6; unit months
- savings: Current emergency savings; default 5000; unit $
- deposit: Monthly savings deposit; default 500; unit $

See evergreen-additions-2026-10-21.md for assumptions, overlap decisions and checks.
