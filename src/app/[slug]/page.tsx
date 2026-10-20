import SearchTasks from "@/components/SearchTasks";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { calculators, calculatorBySlug, routeFor } from "@/lib/calculators";
import CalculatorClient from "@/components/CalculatorClient";
import { defaults, runCalculation } from "@/lib/calculators";
import Directory from "@/components/Directory";
import RealEstateDirectory from "@/components/RealEstateDirectory";
import { Sidebar } from "@/components/Shell";
import CalculatorGuide from "@/components/CalculatorGuide";
import Methodology from "@/components/Methodology";
import { calculatorMetadata, calculatorSchema, pageMetadata } from "@/lib/seo";
import { directoryPath, serializeSchema } from "@/lib/site";
import { relatedCalculatorIds } from "@/lib/guides";
export const dynamicParams = false;
export function generateStaticParams() {
  return [
    ...calculators.map((c) => ({ slug: routeFor(c.id).slice(1) })),
    { slug: "financial-calculator.html" },
    { slug: "about.html" },
    { slug: "privacy.html" },
    { slug: "methodology.html" },
  ];
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = calculatorBySlug(slug);
  if (c) return calculatorMetadata(c);
  if (slug === "about.html")
    return pageMetadata(
      "/about.html",
      "About",
      "Learn about these independent financial calculators, their calculation methods and review status.",
    );
  if (slug === "privacy.html")
    return pageMetadata(
      "/privacy.html",
      "Privacy",
      "How calculator inputs, share links and public exchange-rate requests are handled.",
    );
  if (slug === "methodology.html")
    return pageMetadata(
      "/methodology.html",
      "Calculation Methodology & Sources",
      "Review calculation methods, official data versions, rounding, testing evidence and model limitations.",
    );
  return pageMetadata(
    directoryPath,
    "Financial Calculators for Loans, Savings & Retirement",
    "Browse mortgage, loan, investment, retirement, tax and everyday finance calculators with formulas and explicit assumptions.",
  );
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = calculatorBySlug(slug);
  if (
    !c &&
    ![
      "financial-calculator.html",
      "about.html",
      "privacy.html",
      "methodology.html",
    ].includes(slug)
  )
    notFound();
  let initialResult = null;
  if (c && !c.directory) {
    try { initialResult = runCalculation(c.id, c.modes[0].id, defaults(c.modes[0])); } catch { /* Valid empty defaults may need user input. */ }
  }
  const title =
    c?.title ??
    (slug === "about.html"
      ? "About Financial Calculators"
      : slug === "privacy.html"
        ? "Privacy"
        : slug === "methodology.html"
          ? "Calculation methodology and sources"
          : "Financial Calculators");
  return (
    <div className="page-wrap">
      <main id="main">
        <div className="breadcrumb">
          <a href="/">home</a> /{" "}
          <a href={c?.category === "Everyday Tools" ? "/financial-calculator.html#everyday-tools" : "/financial-calculator.html"}>{c?.category === "Everyday Tools" ? "everyday tools" : "financial"}</a>
          {c && <> / {c.title.toLowerCase()}</>}
        </div>
        <h1>{title}</h1>
        {c && !c.directory && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: serializeSchema(calculatorSchema(c)),
            }}
          />
        )}
        {slug === "methodology.html" ? (
          <Methodology />
        ) : slug === "about.html" ? (
          <>
            <p>
              Independent English-language financial planning tools with
              formulas, schedules, and explicit assumptions.
            </p>
            <p>
              Read our{" "}
              <a href="/methodology.html">
                calculation methodology, data versions and review status
              </a>
              , or inspect the{" "}
              <a href="https://github.com/joshua880604-web/codex-test/tree/financial-calculators">
                public project and tests
              </a>
              .
            </p>
            <p>
              This project is independent of Calculator.net. Calculations run in
              your browser; reference rates are fetched only when requested.
            </p>
          </>
        ) : slug === "privacy.html" ? (
          <>
            <p>
              Calculator inputs are processed locally in your browser. This
              application does not add advertising, analytics, accounts, or
              persistent calculation storage.
            </p>
            <p>
              Share links include the input values in the URL. Only share values
              you intend recipients to see. The market currency conversion mode
              requests a public reference rate; calculator amounts are not sent
              to the rate provider.
            </p>
          </>
        ) : c?.directory ? (
          <RealEstateDirectory />
        ) : c ? (
          <>
            <CalculatorClient calc={JSON.parse(JSON.stringify(c))} initialResult={initialResult} />
            <SearchTasks id={c.id} />
            <CalculatorGuide calculator={c} />
          </>
        ) : (
          <Directory />
        )}
        {c && !c.directory && (
          <section className="related">
            <h2>Related calculators</h2>
            {calculators
              .filter((x) =>
                relatedCalculatorIds[c.id]
                  ? relatedCalculatorIds[c.id].includes(x.id)
                  : x.category === c.category && x.id !== c.id,
              )
              .sort((a, b) =>
                relatedCalculatorIds[c.id]
                  ? relatedCalculatorIds[c.id].indexOf(a.id) -
                    relatedCalculatorIds[c.id].indexOf(b.id)
                  : 0,
              )
              .slice(0, 8)
              .map((x) => (
                <a href={routeFor(x.id)} key={x.id}>
                  {x.title}
                </a>
              ))}
          </section>
        )}
      </main>
      <Sidebar />
    </div>
  );
}
