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
const titles: Record<string, string> = {
  vat: "VAT Calculator - Add VAT, Remove VAT & Find the Rate",
  mortgage: "Mortgage Calculator - Monthly Payment & Amortization",
  loan: "Loan Calculator - Payments, Interest & Payoff",
  retirement: "Retirement Calculator - Savings & Monthly Withdrawals",
  "401k": "401(k) Calculator - Contributions & Employer Match",
  "income-tax": "Income Tax Calculator - 2025 & 2026 Federal Estimate",
  "compound-interest":
    "Compound Interest Calculator - Equivalent Rate Converter",
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
export function sitemapEntries(config: SiteConfig = siteConfig()) {
  if (!config.origin || !config.indexable) return [];
  return [
    ...catalog.map((c) => c.local_route),
    directoryPath,
    "/about.html",
    "/privacy.html",
    "/methodology.html",
  ].map((path) => ({ url: absoluteURL(path, config)! }));
}
export function calculatorSchema(calc: Calculator, config = siteConfig()) {
  const path = catalog.find((c) => c.id === calc.id)!.local_route,
    url = absoluteURL(path, config);
  const app = {
    "@type": "WebApplication",
    name: calc.title,
    description: calc.intro,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
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
