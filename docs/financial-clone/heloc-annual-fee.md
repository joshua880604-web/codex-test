# HELOC annual-fee correction — October 20, 2026

User-requested explanation: an annual fee maintains the open HELOC account; it is typically associated with the draw period, and some lenders charge none. This calculator now explicitly models draw-period-only annual fees; lender terms still need checking.

Previously the annual charge/12 was added to both draw and repayment rows, repayment installments, total fees and the APR cash-flow stream. It is now added only to draw rows. Repayment installments contain principal/interest without annual-fee allocation. Total fees equal upfront closing costs plus the draw-period allocation; APR uses those same corrected rows. Zero fee is supported; zero draw months charge no annual fee and show zero for the inactive draw-payment metric. A separate metric reports annual fees during draw.

The input label is Annual fee, with an accessible explanation. The charge query key is preserved for existing share links. The model continues to spread the yearly fee evenly over 12 draw months, prorating partial years, for monthly average costs and estimated APR. It does not simulate a lender's once-yearly billing dates; actual billing dates may change cash-flow APR. This assumption is stated in the input hint, formula, result notes and guide.

A one-year zero-interest draw on 12,000, two-year repayment, 120 annual fee and 50 closing costs gives 10 average monthly draw cost, 500 monthly repayment and 170 total fees (not 410). The 24 repayment months have no annual fee. The 120 total annual fees are separate from 50 upfront costs.

Validation: 412 tests passed, including independent phase-boundary, fee total, zero-draw/no-fee, prorating, unchanged interest and discounted cash-flow checks. TypeScript and production build passed. Dedicated browser checks verify fee input/help, correct first repayment row, no-fee entry, maximum-credit mode and 320/390/768px layout. Initial HTML checks cover 79 pages. Original-site form/visual parity is not newly certified; no deployment or external account was changed.
