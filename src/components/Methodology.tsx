
import SiteLink from "@/components/SiteLink";
import {defaultAssumptions,methodologyDatasets,methodologyCheckedOn,validationExamples,exampleLink,projectURL,sourceURL,methodologySchema} from '@/lib/methodology';
import {serializeSchema} from '@/lib/site';
const dateLabel=(date:string)=>new Date(date+'T12:00:00Z').toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'});
export default function Methodology(){
 const assumptions=defaultAssumptions(),datasets=methodologyDatasets();
 const renderAssumption=(item:typeof assumptions[number])=><div key={item.id+'-'+item.key} className="method-default">
  <dt><SiteLink href={item.path}>{item.calculator}</SiteLink><span>{item.modeTitle} · {item.label}</span></dt>
  <dd className="method-default-value">{item.value}{item.unit==='%'?'%':item.unit?' '+item.unit:''}<span>Illustrative preset</span></dd>
  <dd className="method-default-basis">{item.basis} <SiteLink href={item.sourcePath}>Configured value in the source code</SiteLink></dd>
 </div>;
 return <article className="calculator-guide methodology-content">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeSchema(methodologySchema())}}/>
  <p className="method-intro">A useful result starts with a clear model. Here is how we check calculations, choose starting values and distinguish an assumption from a published data point.</p>
  <p className="content-date">Documentation checked <time dateTime={methodologyCheckedOn}>{dateLabel(methodologyCheckedOn)}</time> against the current implementation. Dataset dates are listed separately below.</p>
  <nav className="guide-nav method-nav" aria-label="Methodology sections"><SiteLink href="#validation">Validation</SiteLink><SiteLink href="#default-assumptions">Default assumptions</SiteLink><SiteLink href="#data-sources">Data sources</SiteLink><SiteLink href="#timing-rounding">Timing &amp; rounding</SiteLink><SiteLink href="#model-scope">Scope &amp; review</SiteLink><SiteLink href="#corrections">Report an issue</SiteLink></nav>
  <section aria-labelledby="validation"><h2 id="validation">How calculations are checked</h2>
   <ol className="method-checks">
    <li><strong>Specify the calculation.</strong> Each mode declares its inputs, units, formula and timing. A nominal rate, effective annual return and rate per period are treated according to the selected model.</li>
    <li><strong>Compare with independent arithmetic.</strong> Tests use closed-form equations, separately calculated fixtures, selected published examples and versioned official tables. The examples below let you reproduce two simple checks.</li>
    <li><strong>Exercise boundaries and schedules.</strong> Checks include zero rates, negative returns where supported, invalid inputs, cash-flow timing and loan principal conservation. Final payments are limited to the remaining balance and interest in the repayment model.</li>
    <li><strong>Check the usable result.</strong> Browser checks cover representative calculations, example links, mode switching, mobile layout and result sharing. Default-input checks establish that a mode runs; they do not prove every possible financial rule or browser combination.</li>
   </ol>
   <div className="method-examples">{validationExamples.map(example=><section key={example.title}><h3>{example.title}</h3><p>{example.explanation}</p><SiteLink href={exampleLink(example)}>Reproduce this check <span aria-hidden="true">→</span></SiteLink></section>)}</div>
   <p>Inspect the <SiteLink href={projectURL+'/tree/static-preview-20261021/tests'}>automated calculation tests</SiteLink> and <SiteLink href={sourceURL+'docs/financial-clone/methodology-review-2026-10-22.md'}>dated validation and scope record</SiteLink>.</p>
  </section>
  <section aria-labelledby="default-assumptions"><h2 id="default-assumptions">Where default assumptions come from</h2>
   <p className="method-key-point"><strong>Forecast inputs are illustrative starting values.</strong> They make a calculator ready to try. They are editable presets in its configuration, not recommended assumptions, live quotes or forecasts supplied by an authority. No cited historical-average series underlies the return and inflation presets shown here.</p>
   <p>For example, the retirement tool’s inflation preset and the historical BLS inflation series have different roles. The first is an assumption about the future; the second records past price changes. Different tools can start with different values.</p>
   <dl className="method-defaults">{assumptions.slice(0,4).map(renderAssumption)}</dl>
   <details className="method-more-defaults"><summary>More default examples ({assumptions.length-4})</summary><dl className="method-defaults">{assumptions.slice(4).map(renderAssumption)}</dl></details>
   <p>These values are read from the same field configurations used by the calculators. An example link or a shared calculation may supply different inputs; the current form values determine the result.</p>
   <h3>See the effect of changing an assumption</h3><p>With a 6% nominal annual return, the exact real annual return is about <strong>3.4146%</strong> at 2.5% inflation, or <strong>2.4155%</strong> at 3.5% inflation, before taxes and fees. Compare <SiteLink href="/real-return-calculator.html?mode=rate&nominal=6&inflation=2.5">the 2.5% inflation example</SiteLink> with <SiteLink href="/real-return-calculator.html?mode=rate&nominal=6&inflation=3.5">the 3.5% example</SiteLink>. These scenarios illustrate sensitivity; neither is a forecast.</p>
  </section>
  <section aria-labelledby="data-sources"><h2 id="data-sources">Published data, versions and coverage</h2><p>Official rules and stored observations have identifiable sources and dates. They are separate from editable planning assumptions. This static site does not refresh those datasets when you open a calculator.</p>
   <div className="method-datasets">{datasets.map(dataset=><section key={dataset.id}><h3>{dataset.name}</h3><p className="method-version">{dataset.version}</p><p>{dataset.scope}</p><ul>{dataset.sources.map(source=><li key={source.url}><SiteLink href={source.url}>{source.title}</SiteLink></li>)}</ul><p className="content-date">Bundled data record dated <time dateTime={dataset.checked}>{dateLabel(dataset.checked)}</time>.</p></section>)}</div>
  </section>
  <section aria-labelledby="timing-rounding"><h2 id="timing-rounding">Timing, fees and rounding</h2>
   <ul><li><strong>Timing:</strong> monthly, annual, beginning-of-period and end-of-period cash flows can give different results. The active mode, formula and result notes state the convention.</li>
    <li><strong>Return basis:</strong> check whether a rate is nominal or effective, whether fees are already deducted, and whether values are in current or inflation-adjusted dollars. A fund return already net of its expense ratio should not have that fee deducted a second time.</li>
    <li><strong>Precision:</strong> most financial calculations retain JavaScript floating-point precision internally and round for display. Currency formatting follows the selected currency’s minor units; percentages generally show four decimals unless a mode specifies otherwise. Some tools deliberately round whole units or allocate currency minor units.</li>
    <li><strong>Real-world differences:</strong> a lender’s daily-interest convention, payment-by-payment cent rounding, taxes, fees or invoice rules may differ from a planning illustration. Rounded rows may not sum exactly to an independently rounded total.</li></ul>
   <p>Definitions: <SiteLink href="/glossary/compound-interest/">compound interest</SiteLink>, <SiteLink href="/glossary/real-rate-of-return/">real return</SiteLink>, <SiteLink href="/glossary/expense-ratio/">expense ratio</SiteLink> and <SiteLink href="/glossary/amortization/">amortization</SiteLink>.</p>
  </section>
  <section aria-labelledby="model-scope"><h2 id="model-scope">Model scope and review status</h2>
   <p>These are independent planning tools. Assumptions such as constant returns, full vesting, selected tax rules or a single-product business model apply only where the tool states them. A successful test case does not establish complete tax eligibility, contractual payment terms or equivalence with every option on another calculator website.</p>
   <p>Source notes and automated checks are public. AI tools have assisted implementation and drafting; numerical results are produced by formula-based code in your browser, without a runtime AI service. We do not currently publish a named independent professional review for every calculator.</p>
   <p>Use each calculator’s <strong>Scope and assumptions</strong> and result notes alongside this overview. The <SiteLink href={sourceURL+'docs/financial-clone/methodology-review-2026-10-22.md'}>review record</SiteLink> separates the checks performed from remaining limitations.</p>
  </section>
  <section aria-labelledby="corrections"><h2 id="corrections">Corrections and reporting a calculation issue</h2>
   <p>For a useful report, include the calculator name and mode, non-sensitive sample inputs, the actual result, the expected result and its formula or source. Browser/device details help with display problems. Avoid posting account numbers or personal tax records.</p>
   <p><SiteLink className="method-report" href={projectURL+'/issues/new'}>Report an issue on GitHub <span aria-hidden="true">↗</span></SiteLink> <span className="method-report-note">GitHub sign-in may be required. No report is sent automatically.</span></p>
   <p>When a correction is made, the change history and any associated tests provide a record. Dataset and documentation dates change when the relevant records are checked or revised; they are not automatically advanced with the calendar. You can inspect the <SiteLink href={projectURL+'/commits/static-preview-20261021/'}>public change history</SiteLink>.</p>
  </section>
 </article>;
}
