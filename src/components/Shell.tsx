import {siteName} from "@/lib/site";
import MobileNavigation from "./MobileNavigation";
import CalculatorSearch from "./CalculatorSearch";
import SiteBenefits, { FreeBadge } from "./SiteBenefits";
import { calculators, routeFor } from "@/lib/calculators";
export function Header() {
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="/financial-calculator.html" aria-label={`${siteName} home`}>
            <svg className="calculator-mark" viewBox="0 0 32 36" width="32" height="36" aria-hidden="true" focusable="false">
              <rect width="32" height="36" rx="8" fill="#e5f3f0" />
              <rect x="6" y="6" width="20" height="6" rx="2" fill="#003b66" />
              <path d="M7 19h6m-3-3v6M7 28h6" fill="none" stroke="#003b66" strokeWidth="2" strokeLinecap="round" />
              <rect x="18" y="16" width="9" height="15" rx="3" fill="#ffda78" />
              <path d="M20.5 22h4m-4 4h4" fill="none" stroke="#003b66" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="brand-wordmark"><span>Calculator</span><span className="brand-free">Free</span><span className="brand-domain">.io</span></span>
          </a>
          <MobileNavigation/>
          <span className="header-description">
            <FreeBadge />
          </span>
        </div>
      </header>
      <nav className="top-nav" aria-label="Main navigation">
        <div>
          <a className="selected" href="/financial-calculator.html">
            Financial Calculators
          </a>
          <a href="/financial-calculator.html#everyday">Everyday Tools</a>
          <a href="/real-estate-calculator.html">Real Estate</a>
          <a href="/financial-calculator.html#saving-investing">Investment</a>
          <a href="/financial-calculator.html#retirement">Retirement</a>
          <a href="/glossary/">Glossary</a>
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
      <CalculatorSearch id="sidebar-search" compact/>
      <SiteBenefits />
      <section className="side-group" aria-labelledby="side-financial-heading">
      <h2 className="side-heading" id="side-financial-heading">
        <a href="/financial-calculator.html">Financial Calculators</a>
      </h2>
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
      </section>
      <section className="side-group side-group-secondary" aria-labelledby="side-everyday-heading">
      <h2 className="side-heading" id="side-everyday-heading">Everyday Tools</h2>
      <div className="side-links">{calculators.filter(c=>c.category === "Everyday Tools").map(c=><a key={c.id} href={routeFor(c.id)}>{c.title}</a>)}</div>
      </section>
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
        <span> · </span>
        <a href="/glossary/">Glossary</a>
      </div>
      <p>
        © {new Date().getFullYear()} {siteName}. Independent planning
        tools.
      </p>
    </footer>
  );
}
