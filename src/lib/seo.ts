import guideInsights from "./guide-insights.json";
import {keywordTitles,searchTasks} from "./keyword-targets";
import type { Metadata } from "next";
import catalog from "./catalog-data.json";
import {
  absoluteURL,
  directoryPath,
  siteConfig,
  siteName,
  type SiteConfig,
} from "./site";
import type { Calculator } from "./types";
import {glossaryPath,glossaryTerms,glossaryTermPath} from './glossary';
import { longTailContent } from './long-tail-content';
const titles: Record<string, string> = {
  vat: "VAT Calculator - Add VAT, Remove VAT & Find the Rate",
  mortgage: "Mortgage Calculator - Monthly Payment & Amortization",
  loan: "Loan Calculator - Payments, Interest & Payoff",
  retirement: "Retirement Calculator - Savings & Monthly Withdrawals",
  "401k": "401(k) Calculator - Contributions & Employer Match",
  "income-tax": "Income Tax Calculator - 2025 & 2026 Federal Estimate",
  "compound-interest":
    "Compound Interest Calculator - Growth & Contributions",
  interest: "Interest Calculator - Savings Growth & Contributions",
};
export function pageMetadata(
  path: string,
  title: string,
  description: string,
  config = siteConfig(),
): Metadata {
  const url = absoluteURL(path, config);
  return {
    title,
    description,
    alternates: url ? { canonical: url } : undefined,
    robots: { index: config.indexable, follow: true },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName,
      title,
      description,
      ...(url ? { url } : {}),
    },
    twitter: { card: "summary", title, description },
  };
}
export function calculatorMetadata(calc: Calculator, config = siteConfig()) {
  return pageMetadata(
    catalog.find((c) => c.id === calc.id)!.local_route,
    keywordTitles[calc.id] ?? titles[calc.id] ?? calc.title,
    searchTasks[calc.id]?.[0].description ?? calc.intro,
    config,
  );
}
// Dates record reviewed content changes, never the current build time.
export const contentUpdatedOn: Record<string, string> = {
  ...Object.fromEntries(Object.entries(longTailContent).map(([id,content])=>[catalog.find(c=>c.id===id)!.local_route,content.updatedOn])),
  "/fha-loan-calculator.html": "2026-10-25",
  "/marriage-calculator.html": "2026-10-25",
  "/compound-interest-calculator.html": "2026-10-25",
  "/average-return-calculator.html": "2026-10-25",
  "/irr-calculator.html": "2026-10-25",
  "/401k-calculator.html": "2026-10-25",
  "/ira-calculator.html": "2026-10-25",
  "/roth-ira-calculator.html": "2026-10-25",
  "/rmd-calculator.html": "2026-10-25",
  "/tax-calculator.html": "2026-10-25",
  "/estate-tax-calculator.html": "2026-10-25",
  "/take-home-pay-calculator.html": "2026-10-25",
  "/social-security-calculator.html": "2026-10-25",
};
export function sitemapEntries(config: SiteConfig = siteConfig()) {
  if (!config.origin || !config.indexable) return [];
  return [
    ...catalog.map((c) => c.local_route),
    directoryPath,
    "/about.html",
    "/privacy.html",
    "/methodology.html",
    glossaryPath,
    ...glossaryTerms.map(term=>glossaryTermPath(term.slug)),
  ].map((path) => ({ url: absoluteURL(path, config)!, ...(contentUpdatedOn[path] ? { lastModified: contentUpdatedOn[path] } : {}) }));
}
export function calculatorSchema(calc: Calculator, config = siteConfig()) {
  const path = catalog.find((c) => c.id === calc.id)!.local_route,
    url = absoluteURL(path, config);
  const app = {
    "@type": "WebApplication",
    name: calc.title,
    description: calc.intro,
    applicationCategory: calc.category === "Everyday Tools" ? "UtilitiesApplication" : "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    featureList: searchTasks[calc.id]?.map(task=>task.keyword) ?? calc.modes.map(mode=>mode.title),
    isAccessibleForFree: true,
    inLanguage: "en",
    ...(url ? { "@id": url + "#calculator", url } : {}),
  };
  const graph: Record<string, unknown>[] = [app];
  if (url) {
    graph.push({
      "@type": "WebPage",
      "@id": url + "#page",
      url,
      name: calc.title,
      description: calc.intro,
      inLanguage: "en",
      mainEntity: { "@id": url + "#calculator" },
      isPartOf: { "@type": "WebPage", url: absoluteURL(directoryPath, config) },
      hasPart: calc.directory ? undefined : [
        ...(calc.id in guideInsights ? [
          { "@type": "WebPageElement", "@id": url + "#reading-results", name: "Reading your result" },
          { "@type": "WebPageElement", "@id": url + "#compare-scenarios", name: "Compare two scenarios" },
        ] : []),
        { "@type": "WebPageElement", "@id": url + "#worked-examples", name: "Worked examples" },
        { "@type": "WebPageElement", "@id": url + "#scope-assumptions", name: "Scope and assumptions" },
      ],
    });
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Financial calculators",
          item: absoluteURL(directoryPath, config),
        },
        { "@type": "ListItem", position: 2, name: calc.title, item: url },
      ],
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}
