import SiteLink from '@/components/SiteLink';
import {pageMetadata} from '@/lib/seo';
import {guidesPath,recastGuide,editorialSchema} from '@/lib/editorial-guides';
import {directoryPath,serializeSchema} from '@/lib/site';
export const metadata=pageMetadata(guidesPath,'Financial Guides: Worked Comparisons & Calculator Examples','Compare financial options with worked examples, transparent assumptions, official sources and calculator inputs you can change.');
export default function Guides(){return <div className="page-wrap glossary-page guides-page"><main id="main">
 <nav className="breadcrumb" aria-label="Breadcrumb"><SiteLink href={directoryPath}>Calculators</SiteLink> / <span aria-current="page">Guides</span></nav>
 <h1>Financial guides</h1><p>Work through a financial decision with clear assumptions, numerical comparisons and sources. Open the linked calculator examples to see how your own inputs change the results.</p>
 <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeSchema(editorialSchema())}}/>
 <article className="guide-card"><p className="glossary-category">Mortgages · Comparison guide</p><h2><SiteLink href={recastGuide.path}>{recastGuide.heading}</SiteLink></h2><p>See what a $50,000 principal payment changes, how recasting differs from keeping the old payment, and how to evaluate a separate refinance offer.</p><p>Calculation and source checks: <time dateTime={recastGuide.publishedOn}>October 27, 2026</time></p><SiteLink href={recastGuide.path}>Read the comparison →</SiteLink></article>
 <p><SiteLink href="/methodology">Calculation methodology and review status</SiteLink> · <SiteLink href="/glossary/">Financial glossary</SiteLink></p>
 </main></div>;}
