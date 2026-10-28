import SiteLink from '@/components/SiteLink';
import {pageMetadata} from '@/lib/seo';
import {guidesPath,editorialGuides,editorialSchema} from '@/lib/editorial-guides';
import {directoryPath,serializeSchema} from '@/lib/site';
export const metadata=pageMetadata(guidesPath,'Financial Guides: Worked Comparisons & Calculator Examples','Compare financial options with worked examples, transparent assumptions, official sources and calculator inputs you can change.');
export default function Guides(){return <div className="page-wrap glossary-page guides-page"><main id="main">
 <nav className="breadcrumb" aria-label="Breadcrumb"><SiteLink href={directoryPath}>Calculators</SiteLink> / <span aria-current="page">Guides</span></nav>
 <h1>Financial guides</h1><p>Work through a financial decision with clear assumptions, numerical comparisons and sources. Open the linked calculator examples to see how your own inputs change the results.</p>
 <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeSchema(editorialSchema())}}/>
 {editorialGuides.map(guide=><article className="guide-card" key={guide.path}><p className="glossary-category">{guide.topic} · Comparison guide</p><h2><SiteLink href={guide.path}>{guide.heading}</SiteLink></h2><p>{guide.cardIntro}</p><p>{guide.updatedOn?'Updated: ':'Calculation and source checks: '}<time dateTime={guide.updatedOn??guide.publishedOn}>{new Date((guide.updatedOn??guide.publishedOn)+'T00:00:00Z').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'})}</time></p><SiteLink href={guide.path}>Read the comparison →</SiteLink></article>)}
 <p><SiteLink href="/methodology">Calculation methodology and review status</SiteLink> · <SiteLink href="/glossary/">Financial glossary</SiteLink></p>
 </main></div>;}
