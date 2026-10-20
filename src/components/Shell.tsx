import { calculators, routeFor } from "@/lib/calculators";
export function Header() {
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="/financial-calculator.html">
            <span className="calculator-mark" aria-hidden="true">
              ▦
            </span>{" "}
            Financial<span>Calculators</span>
          </a>
          <span className="header-description">
            Free financial planning tools
          </span>
        </div>
      </header>
      <nav className="top-nav" aria-label="Main navigation">
        <div>
          <a className="selected" href="/financial-calculator.html">
            Financial Calculators
          </a>
          <a href="/financial-calculator.html#everyday-tools">Everyday Tools</a>
          <a href="/real-estate-calculator.html">Real Estate</a>
          <a href="/financial-calculator.html#investment">Investment</a>
          <a href="/financial-calculator.html#retirement">Retirement</a>
        </div>
      </nav>
    </>
  );
}
export function Sidebar() {
  const ids = [
    "mortgage",
    "loan",
    "auto-loan",
    "interest",
    "payment",
    "retirement",
    "amortization",
    "investment",
    "currency",
    "inflation",
    "finance",
    "mortgage-payoff",
    "income-tax",
    "compound-interest",
    "salary",
    "401k",
    "interest-rate",
    "sales-tax",
  ];
  return (
    <aside className="sidebar">
      <div className="side-heading">
        <a href="/financial-calculator.html">Financial Calculators</a>
      </div>
      <div className="side-links">
        {ids.map((id) => {
          const c = calculators.find((x) => x.id === id)!;
          return (
            <a key={id} href={routeFor(id)}>
              {c.title.replace(" Calculator", "")}
            </a>
          );
        })}
      </div>
      <a className="more-tools" href="/financial-calculator.html">
        More Financial Calculators »
      </a>
      <div className="side-heading">Everyday Tools</div>
      <div className="side-links">{calculators.filter(c=>c.category === "Everyday Tools").map(c=><a key={c.id} href={routeFor(c.id)}>{c.title}</a>)}</div>
      <div className="side-note">
        <h3>Plan with clear assumptions</h3>
        <p>
          Compare scenarios and review the formula, dates, and calculation
          details for each tool.
        </p>
      </div>
    </aside>
  );
}
export function Footer() {
  return (
    <footer>
      <div>
        <a href="/financial-calculator.html">All Financial Calculators</a>
        <span> · </span>
        <a href="/about.html">About</a>
        <span> · </span>
        <a href="/privacy.html">Privacy</a>
        <span> · </span>
        <a href="/methodology.html">Methodology &amp; sources</a>
      </div>
      <p>
        © {new Date().getFullYear()} Financial Calculators. Independent planning
        tools.
      </p>
    </footer>
  );
}
