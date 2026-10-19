export default function Methodology() {
  return (
    <article className="calculator-guide">
      <p>
        These tools make financial calculations using the inputs and assumptions
        shown on each page. This page explains how the models are maintained and
        how to interpret their results.
      </p>
      <h2>How calculations are checked</h2>
      <p>
        Pure calculation functions are checked against independent equations,
        selected published examples and official parameter tables. Loan
        schedules are checked for principal conservation and final-payment
        limits. Worked examples link to reproducible calculator inputs.
      </p>
      <h2>Review status</h2>
      <p>
        Automated mathematical checks and selected reference cases are available
        in the public project. Complete equivalence with every original
        Calculator.net option, submission and visual detail remains under
        review. A passing default-input test is evidence of local operation, not
        proof of every business rule.
      </p>
      <h2>Data versions and scope</h2>
      <ul>
        <li>
          Federal tax estimates offer selected 2025 and 2026 rules; state/local
          tax, eligibility and complete return preparation are outside the
          stated model.
        </li>
        <li>
          401(k) and IRA projections keep the published 2026 contribution limits
          constant in future years; full plan eligibility and aggregate limit
          rules are not inferred.
        </li>
        <li>
          Owner-account RMD tables use IRS distribution factors effective from
          2022. Inherited accounts and some plan exceptions require separate
          treatment.
        </li>
        <li>
          Historical inflation uses BLS CPI-U records; missing official periods
          are not interpolated. Future inflation is an entered assumption.
        </li>
        <li>
          Currency results identify their provider and date. A saved reference
          snapshot is labeled as a fallback; it is not a live market quote.
        </li>
      </ul>
      <h2>Timing and rounding</h2>
      <p>
        Payment, contribution and withdrawal timing is model-specific.
        Calculations retain floating-point precision and display monetary
        amounts to two decimals. Lender daily-interest calculations,
        invoice-level tax rounding and independently rounded totals can differ
        from a planning model.
      </p>
      <h2>Sources and changes</h2>
      <p>
        Official source links appear with relevant calculation guides and result
        notes. The{" "}
        <a href="https://github.com/joshua880604-web/codex-test/tree/financial-calculators">
          public source repository
        </a>{" "}
        contains calculation code, tests and research. Read the{" "}
        <a href="https://github.com/joshua880604-web/codex-test/blob/financial-calculators/docs/financial-clone/calculation-audit.md">
          calculation audit
        </a>{" "}
        for identified fixes and remaining gaps.
      </p>
      <h2>Using the results</h2>
      <p>
        Check the units, tax year, jurisdiction and assumptions before comparing
        scenarios. Forecast returns are assumptions. Verify contractual
        payments, tax filings and benefit eligibility with the relevant lender,
        authority or qualified adviser.
      </p>
    </article>
  );
}
