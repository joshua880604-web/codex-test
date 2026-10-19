import { calculators, routeFor } from "@/lib/calculators";
const financial = [
  "mortgage",
  "house-affordability",
  "mortgage-payoff",
  "refinance",
  "fha-loan",
  "va-mortgage",
  "down-payment",
  "apr",
  "home-equity-loan",
  "heloc",
  "rental-property",
  "rent",
  "rent-vs-buy",
];
const other = [
  ["Area", "area"],
  ["Concrete", "concrete"],
  ["BTU", "btu"],
  ["Stair", "stair"],
  ["Tile", "tile"],
  ["Square Footage", "square-footage"],
  ["Roofing", "roofing"],
];
export default function RealEstateDirectory() {
  return (
    <>
      <p>Choose a tool for financing, owning, or investing in real estate.</p>
      <h2>Financial</h2>
      <ul className="estate-list">
        {financial.map((id) => {
          const c = calculators.find((x) => x.id === id)!;
          return (
            <li key={id}>
              <a href={routeFor(id)}>{c.title}</a>
              <span> — {c.intro}</span>
            </li>
          );
        })}
      </ul>
      <h2>Other</h2>
      <p>
        These construction and measurement tools are outside the financial
        section and open on the reference website.
      </p>
      <ul>
        {other.map(([title, slug]) => (
          <li key={slug}>
            <a
              href={"https://www.calculator.net/" + slug + "-calculator.html"}
              target="_blank"
              rel="noreferrer"
            >
              {title} Calculator ↗
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
