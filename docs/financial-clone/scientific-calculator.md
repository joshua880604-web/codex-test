# Scientific Calculator

Implemented locally on 2026-10-20 at `/scientific-calculator.html`, under Everyday Tools. The 71-entry financial reference directory remains unchanged; the combined directory now contains 76 entries, 75 working calculators and 171 modes.

Supports parentheses, arithmetic precedence, right-associative powers, scientific notation, implicit multiplication, pi/e, logarithms, roots, factorial, trigonometry and inverse trigonometry. Angles are explicitly selectable as degrees or radians. The keypad supports text selections, deletion, clear, square, reciprocal and sign changes; Enter calculates, Shift+Enter adds a newline.

Expressions are parsed by a bounded mathematical grammar without eval or dynamic code execution. Invalid syntax, non-real results, overflow and division by zero produce errors. Factorial accepts integers from 0 through 170. Percent means division by 100, so `100+10%` equals 100.1. Results show up to 12 significant digits using JavaScript double precision. Complex numbers, graphs and symbolic algebra are outside this calculator's scope. Functional equivalence to every key on the reference website has not been claimed.

Validation: 431 automated tests pass; production build passes; dedicated Chromium QA passes 12 checks including keypad operations, angle modes, precedence, errors, and no horizontal page overflow at 320, 390 and 768 pixels. Three reproducible examples and four FAQs are included. No new package dependency was added.

Publication: local only. IRR changes remain pending explicit public GitHub upload approval after an earlier automatic approval rejection. No public branch or deployment was updated during this task.
