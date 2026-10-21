# CAGR Calculator

Independent user-requested fixed-formula tool. No external data, policy parameters or original-source equivalence claim. USD display; user-entered rates/costs.

## CAGR (`rate`)

Calculate the compound annual growth rate from a beginning value, ending value and elapsed years.

Formula: CAGR = (ending / beginning)^(1 / years) − 1.

- begin: Beginning value; default 10000; unit $
- end: Ending value; default 20000; unit $
- years: Number of years; default 10; unit years

## Ending Value (`ending`)

Reverse CAGR to find a future ending value, without intermediate cash flows.

Formula: Ending = beginning × (1 + CAGR)^years.

- begin: Beginning value; default 10000; unit $
- rate: Annual rate; default 8; unit %
- years: Number of years; default 10; unit years

## Beginning Value (`beginning`)

Find the starting value implied by a CAGR, ending value and period.

Formula: Beginning = ending / (1 + CAGR)^years.

- end: Ending value; default 20000; unit $
- rate: Annual rate; default 8; unit %
- years: Number of years; default 10; unit years

## CAGR with Dates (`dates`)

Annualize between two dates using actual elapsed days divided by 365.2425.

Formula: Years = UTC elapsed days / 365.2425; CAGR = (ending / beginning)^(1 / years) − 1.

- begin: Beginning value; default 10000; unit $
- end: Ending value; default 20000; unit $
- start: Start date; default 2020-01-01; unit selection
- end_date: End date; default 2025-01-01; unit selection

See evergreen-additions-2026-10-21.md for assumptions, overlap decisions and checks.
