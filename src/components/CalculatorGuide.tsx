import guideInsights from "@/lib/guide-insights.json";
import type { Calculator } from "@/lib/types";
import { routeFor } from "@/lib/calculators";
import { guides, notesCheckedOn } from "@/lib/guides";
import GlossaryLinks from './GlossaryLinks';
export default function CalculatorGuide({
  calculator,
}: {
  calculator: Calculator;
}) {
  const guide = guides[calculator.id];
  const insight = guideInsights[calculator.id as keyof typeof guideInsights];
  const checkedOn = guide?.checkedOn ?? notesCheckedOn;
  return (
    <section className="calculator-guide" aria-label="Calculation guide">
      {guide && (
        <>
          <nav className="guide-nav" aria-label="Calculation guide sections">
            {insight && <a href="#reading-results">Reading results</a>}
            {insight && <a href="#compare-scenarios">Compare scenarios</a>}
            <a href="#worked-examples">Examples</a><a href="#common-questions">Questions</a>
            <a href="#scope-assumptions">Assumptions</a><a href="#sources">Sources</a>
          </nav>
          <h2>Understanding this calculation</h2>
          <p>{insight?.answer ?? guide.summary}</p>
          <GlossaryLinks id={calculator.id}/>
          {insight && <>
            <h2 id="reading-results">Reading your result</h2>
            <dl className="result-definitions">{insight.results.map(item=><div key={item.label}><dt>{item.label}</dt><dd>{item.meaning}</dd></div>)}</dl>
            <h2 id="compare-scenarios">Compare two scenarios</h2>
            <ol>{insight.compare.map(step=><li key={step}>{step}</li>)}</ol>
            <h3>Check before comparing</h3><ul>{insight.checks.map(check=><li key={check}>{check}</li>)}</ul>
            <p className="content-date">Result explanations checked <time dateTime={insight.checkedOn}>{insight.checkedOn}</time> against this calculator’s local model. Model scope and sources appear below.</p>
          </>}
          <h2 id="worked-examples">Worked examples</h2>
          {guide.examples.map((example) => {
            const query = new URLSearchParams({
              mode: example.mode,
              ...Object.fromEntries(
                Object.entries(example.values).map(([k, v]) => [k, String(v)]),
              ),
            });
            return (
              <section className="worked-example" key={example.title}>
                <h3>{example.title}</h3>
                <p>{example.inputs}</p>
                <ol>
                  {example.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <p>
                  <strong>{example.answer}</strong>
                </p>
                <a href={routeFor(calculator.id) + "?" + query}>
                  Try these inputs
                </a>
              </section>
            );
          })}
          <h2 id="common-questions">Common questions</h2>
          {guide.questions.map((item) => (
            <section key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </section>
          ))}
          <h2 id="scope-assumptions">Scope and assumptions</h2>
          <p>{guide.scope}</p>
          <h2 id="sources">Sources</h2>
          <ul>
            {guide.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url}>{source.title}</a>
              </li>
            ))}
          </ul>
          <p className="content-date">
            Calculation notes checked{" "}
            <time dateTime={checkedOn}>{new Date(checkedOn + "T12:00:00Z").toLocaleDateString("en-US", {year:"numeric",month:"long",day:"numeric",timeZone:"UTC"})}</time>. Examples
            are mathematical checks under the stated assumptions.
          </p>
        </>
      )}
      <details className="model-reference">
        <summary>Calculation methods and formulas</summary>
        {calculator.modes.map((mode) => (
          <section key={mode.id}>
            <h3>{mode.title}</h3>
            <p>{mode.description}</p>
            <p className="formula">{mode.formula}</p>
          </section>
        ))}
      </details>
      <p>
        See our{" "}
        <a href="/methodology.html">
          calculation methodology and review status
        </a>{" "}
        for data versions, rounding and validation limitations.
        {" "}<a href="/methodology.html#default-assumptions">How default assumptions are chosen</a>.
      </p>
    </section>
  );
}
