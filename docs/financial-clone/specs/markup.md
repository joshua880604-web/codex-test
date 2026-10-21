# Markup Calculator

Independent user-requested fixed-formula tool. No external data, policy parameters or original-source equivalence claim. USD display; user-entered rates/costs.

## Selling Price (`price`)

Calculate selling price from cost and a markup percentage.

Formula: Price = cost × (1 + markup); margin = markup / (1 + markup).

- cost: Cost per unit; default 100; unit $
- markup: Markup on cost; default 50; unit %

## Reverse Markup (`reverse`)

Find cost from the selling price and markup on cost.

Formula: Cost = price / (1 + markup).

- price: Selling price; default 150; unit $
- markup: Markup on cost; default 50; unit %

## Price from Margin (`margin`)

Calculate the selling price required for a margin percentage measured against revenue.

Formula: Price = cost / (1 − margin).

- cost: Cost per unit; default 100; unit $
- margin: Target profit margin; default 30; unit %

## Convert Rates (`convert`)

Convert a markup percentage directly to margin, or a margin percentage to markup.

Formula: Margin = markup / (1 + markup); markup = margin / (1 − margin).

- rate: Percentage to convert; default 50; unit %
- direction: Conversion direction; default Markup to margin; unit selection; options Markup to margin, Margin to markup

## Markup & Margin (`compare`)

Compare markup and margin using the same cost and selling price.

Formula: Markup = (price − cost) / cost; margin = (price − cost) / price.

- cost: Cost per unit; default 100; unit $
- price: Selling price; default 150; unit $

See evergreen-additions-2026-10-21.md for assumptions, overlap decisions and checks.
