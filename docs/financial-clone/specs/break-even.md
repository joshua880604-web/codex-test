# Break-Even Calculator

Independent user-requested fixed-formula tool. No external data, policy parameters or original-source equivalence claim. USD display; user-entered rates/costs.

## Break-Even Point (`units`)

Find break-even units and sales revenue from fixed costs and per-unit contribution margin.

Formula: Break-even units = fixed costs / (price − variable cost); whole units round up.

- fixed: Fixed costs per period; default 10000; unit $
- price: Selling price per unit; default 50; unit $
- variable: Variable cost per unit; default 30; unit $

## Target Profit (`profit`)

Find the number of units needed to cover fixed costs and earn a target operating profit.

Formula: Units = (fixed costs + target profit) / contribution margin per unit.

- fixed: Fixed costs per period; default 10000; unit $
- price: Selling price per unit; default 50; unit $
- variable: Variable cost per unit; default 30; unit $
- profit: Target profit per period; default 5000; unit $

## Break-Even Price (`price`)

Find the unit selling price required at an entered sales volume.

Formula: Required price = variable cost + (fixed costs + target profit) / units.

- fixed: Fixed costs per period; default 10000; unit $
- variable: Variable cost per unit; default 30; unit $
- units: Expected units sold; default 500; unit units
- profit: Target profit per period; default 0; unit $

See evergreen-additions-2026-10-21.md for assumptions, overlap decisions and checks.
