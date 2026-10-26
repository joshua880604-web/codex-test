# PMI Calculator

Route /pmi-calculator.html. Modes estimate, quote, cancellation. Complete fields are in inventory.json. See mortgage-tools-2026-10-26.md for model scope, dated rate card, renewal behavior, billing convention and evidence boundaries.

Original LTV = principal / original value. Purchase original value = min(price, appraisal). Premium = original principal × annual percentage /100/12. Estimate follows the dated insurer card; entered quotes remain constant. Fixed monthly amortization uses nominal rate/12 and an adjusted final contractual payment.

Request benchmark is the earlier scheduled or actual 80% date. Approval and borrower conditions remain necessary. Automatic termination is original-schedule 78%, current payments required; midpoint termination is payment floor(original months/2)+1. Compare alternative requested/automatic total premiums. Existing loans accept original value/principal/term/rate, completed payments, current balance, current-value information, current-payment status, other conditions and quoted monthly PMI. Reject fractional/inconsistent original terms and unsupported capitalized/current loan balances. No claim of actual cancellation or insurer underwriting.

Report uses the entire main column; trend uses the actual balance schedule; monthly/yearly tables preserve separate PMI scenarios, and CSV/PNG exports reuse the exact result. Inputs in PNG are opt-in. Thin borders, Inter, 1120px frame and 320px rail retained.

Tests include 6%/20% down, appraisal differences, 80/78/midpoint, zero principal, extra payments, past due, decline/appreciation, rate renewal, quote behavior, invalid dates and conservation. Sources: CFPB PMI cancellation guidance, NCUA HPA guidance, National MI original card linked on page.
