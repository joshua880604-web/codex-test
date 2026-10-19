import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { calculators, calculatorBySlug, routeFor } from "@/lib/calculators";
import CalculatorClient from "@/components/CalculatorClient";
import Directory from "@/components/Directory";
import RealEstateDirectory from "@/components/RealEstateDirectory";
import { Sidebar } from "@/components/Shell";
export const dynamicParams = false;
export function generateStaticParams() {
  return [
    ...calculators.map((c) => ({ slug: routeFor(c.id).slice(1) })),
    { slug: "financial-calculator.html" },
    { slug: "about.html" },
    { slug: "privacy.html" },
  ];
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = calculatorBySlug(slug);
  return {
    title:
      c?.title ??
      (slug === "about.html"
        ? "About"
        : slug === "privacy.html"
          ? "Privacy"
          : "Financial Calculators"),
    description: c?.intro,
  };
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
    !["financial-calculator.html", "about.html", "privacy.html"].includes(slug)
  )
    notFound();
  const title =
    c?.title ??
    (slug === "about.html"
      ? "About Financial Calculators"
      : slug === "privacy.html"
        ? "Privacy"
        : "Financial Calculators");
  return (
    <div className="page-wrap">
      <main id="main">
        <div className="breadcrumb">
          <a href="/">home</a> /{" "}
          <a href="/financial-calculator.html">financial</a>
          {c && <> / {c.title.toLowerCase()}</>}
        </div>
        <h1>{title}</h1>
        {slug === "about.html" ? (
          <>
            <p>
              Independent English-language financial planning tools with
              formulas, schedules, and explicit assumptions.
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
          <CalculatorClient id={c.id} />
        ) : (
          <Directory />
        )}
        {c && !c.directory && (
          <section className="related">
            <h2>Related calculators</h2>
            {calculators
              .filter((x) => x.category === c.category && x.id !== c.id)
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
