import About from '@/components/About';

import SiteLink from "@/components/SiteLink";
import {categoryPages,categoryPageBySlug} from '@/lib/category-pages';
import CategoryLanding from '@/components/CategoryLanding';
import {calculatorCategory,categoryHref} from '@/lib/calculator-categories';
import CalculatorDisclaimer from '@/components/CalculatorDisclaimer';
import SearchTasks from "@/components/SearchTasks";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { calculators, calculatorBySlug, routeFor } from "@/lib/calculators";
import CalculatorClient from "@/components/CalculatorEntry";
import { defaults, runCalculation } from "@/lib/calculators";
import Directory from "@/components/DirectoryEntry";
import { searchTasks } from "@/lib/keyword-targets";
import RealEstateDirectory from "@/components/RealEstateDirectory";
import { Sidebar } from "@/components/Shell";
import CalculatorGuide from "@/components/CalculatorGuide";
import Methodology from "@/components/Methodology";
import { calculatorMetadata, calculatorSchema, categoryPageSchema, pageMetadata } from "@/lib/seo";
import { directoryPath, serializeSchema, siteName } from "@/lib/site";
import { relatedCalculatorIds } from "@/lib/guides";
import { hasCalculatorWorkspace } from "@/lib/workspace-layout";
export const dynamicParams = false;
export function generateStaticParams() {
  return [
    ...calculators.map((c) => ({ slug: routeFor(c.id).slice(1) })),
    ...categoryPages.filter(page=>!calculators.some(c=>routeFor(c.id)===page.path)).map(page=>({slug:page.path.slice(1)})),
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
  const categoryPage=categoryPageBySlug(slug);
  const c = calculatorBySlug(slug);
  if(categoryPage)return pageMetadata(categoryPage.path,categoryPage.title,categoryPage.description);
  if (c) return calculatorMetadata(c);
  if (slug === "about.html")
    return pageMetadata(
      "/about.html",
      `About ${siteName}`,
      "Learn how CalculatorFree supports U.S. financial planning with free tools, explicit assumptions, sourced data and clear privacy and calculation limits.",
    );
  if (slug === "privacy.html")
    return pageMetadata(
      "/privacy.html",
      "Privacy",
      "How local calculator inputs, share links and offline exchange rates are handled.",
    );
  if (slug === "methodology.html")
    return pageMetadata(
      "/methodology.html",
      "Calculator Methodology: Validation, Defaults & Data Sources",
      "How we check calculations, where default inflation and return assumptions come from, which data versions we use, and what the models cover.",
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
  const categoryPage=categoryPageBySlug(slug);
  const c = calculatorBySlug(slug);
  if (
    !c && !categoryPage &&
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
  const displayCategory = c ? calculatorCategory(c.id) : undefined;
  const title =
    c?.title ??
    (slug === "about.html"
      ? "About our financial calculators"
      : slug === "privacy.html"
        ? "Privacy"
        : slug === "methodology.html"
          ? "Calculation methodology and sources"
          : "Financial Calculators");
  return (
    <div className={categoryPage ? "page-wrap calculator-page category-directory-page" : slug === "financial-calculator.html" ? "page-wrap directory-page" : slug === "methodology.html" ? "page-wrap methodology-page" : hasCalculatorWorkspace(c?.id ?? "") ? "page-wrap calculator-page workspace-page compact-calculator-page" + (c?.id === "cd" ? " cd-page" : "") : c && !c.directory ? "page-wrap calculator-page" : "page-wrap"}>
      <main id="main">
        <div className="breadcrumb">
          <SiteLink href="/">home</SiteLink> /{" "}
          <SiteLink href={!categoryPage&&displayCategory ? categoryHref(displayCategory.id) : "/financial-calculator.html"}>{!categoryPage&&displayCategory ? displayCategory.title : "financial"}</SiteLink>
          {categoryPage ? <> / {categoryPage.heading}</> : c && <> / {c.title.toLowerCase()}</>}
        </div>
        <h1>{categoryPage?.heading ?? title}</h1>
        {categoryPage&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeSchema(categoryPageSchema(categoryPage))}}/>}
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
          <About />
        ) : slug === "privacy.html" ? (
          <>
            <p>
              Calculator calculations run locally in your browser. You do not
              need an account, and this application does not provide persistent
              storage of your calculation inputs.
            </p>
            <h2>Google advertising</h2>
            <p>
              We use Google AdSense to serve advertisements. Google and its
              advertising partners may use cookies or similar technologies and
              receive information such as your IP address, browser and device
              details, and interactions with advertisements. Ad selection and
              personalization depend on the applicable settings and permissions.
            </p>
            <p>
              Read how{" "}
              <SiteLink href="https://policies.google.com/technologies/ads">
                Google uses information for advertising
              </SiteLink>
              . You can manage your ad preferences in{" "}
              <SiteLink href="https://myadcenter.google.com/">Google My Ad Center</SiteLink>{" "}
              and manage cookies through your browser settings.
            </p>
            <h2>Calculations and sharing</h2>
            <p>
              Tool links exclude inputs by default. If you choose to include inputs,
              they appear in the link’s address fragment and can be read by anyone
              who receives it. They are not encrypted and may remain in browser
              history. Existing query-based links may also expose values to server
              logs. Copied summaries and PNG images contain result amounts. Only
              share information you intend recipients to see. Currency conversion uses a manually entered
              rate or a dated snapshot bundled with the site. No external API
              requests are made for currency rates.
            </p>
          </>
        ) : categoryPage && !c ? (
          <CategoryLanding id={categoryPage.id}/>
        ) : c?.directory ? (
          <><RealEstateDirectory /><CalculatorDisclaimer id={c.id}/></>
        ) : c ? (
          <>
            <CalculatorClient calc={JSON.parse(JSON.stringify(c))} initialResult={initialResult} shortcuts={(searchTasks[c.id] ?? []).map(({keyword, mode}) => ({keyword, mode}))} />
            <CalculatorDisclaimer id={c.id}/>
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
                <SiteLink href={routeFor(x.id)} key={x.id}>
                  {x.title}
                </SiteLink>
              ))}
          </section>
        )}
      </main>
      {!["financial-calculator.html","methodology.html"].includes(slug) && <Sidebar calculatorId={c?.id} categoryId={categoryPage?.id} />}
    </div>
  );
}
