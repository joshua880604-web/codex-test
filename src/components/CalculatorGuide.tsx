import type { Calculator } from "@/lib/types";
import { routeFor } from "@/lib/calculators";
import { guides, notesCheckedOn } from "@/lib/guides";
export default function CalculatorGuide({
  calculator,
}: {
  calculator: Calculator;
}) {
  const guide = guides[calculator.id];
  const checkedOn = guide?.checkedOn ?? notesCheckedOn;
  return (
    <section className="calculator-guide" aria-label="Calculation guide">
      {guide && (
        <>
          <h2>Understanding this calculation</h2>
          <p>{guide.summary}</p>
          <h2>Worked examples</h2>
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
          <h2>Common questions</h2>
          {guide.questions.map((item) => (
            <section key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </section>
          ))}
          <h2>Scope and assumptions</h2>
          <p>{guide.scope}</p>
          <h2>Sources</h2>
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
      </p>
    </section>
  );
}
