import { calculators, routeFor } from "@/lib/calculators";
const financial = [
  "mortgage",
  "pmi",
  "biweekly-mortgage",
  "discount-points",
  "amortization",
  "house-affordability",
  "debt-to-income-ratio",
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
    </>
  );
}
