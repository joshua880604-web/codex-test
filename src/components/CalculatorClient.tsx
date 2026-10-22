"use client";
import {searchTasks} from "@/lib/keyword-targets";
import { useEffect, useRef, useState, type FormEvent } from "react";
import ScientificKeypad from "./ScientificKeypad";
import ResultShare from "./ResultShare";
import {inputHint,resultContext} from "@/lib/result-context";
import { sharedInputs } from "@/lib/sharing";
import MarriageFields from "./MarriageFields";
import { defaults } from "@/lib/types";
import { routeFor } from "@/lib/catalog";
import { runClientCalculation } from "@/lib/calculate-client";
import type { Calculator, Field, Result, Values } from "@/lib/types";
const amount = (n: number, digits = 2) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
const colors = [
  "#336699",
  "#83a94b",
  "#d49b43",
  "#7d85ab",
  "#b26969",
  "#64a7a0",
];
export default function CalculatorClient({ calc, initialResult }: { calc: Calculator; initialResult: Result | null }) {
  const id = calc.id;
  const runCalculation = (_id: string, mode: string, values: Values) => runClientCalculation(calc.id, calc.category, mode, values);
  const [modeId, setModeId] = useState(calc.modes[0].id);
  const mode = calc.modes.find((m) => m.id === modeId)!;
  const [values, setValues] = useState<Values>(() => defaults(mode)),
    [result, setResult] = useState<Result | null>(initialResult),
    [error, setError] = useState(""),
    [showAll, setShowAll] = useState(false),
    [notice, setNotice] = useState("");
  const [yearly, setYearly] = useState(false);
  const tableRows =
    yearly && result?.annualRows ? result.annualRows : result?.rows;
  const tableColumns =
    yearly && result?.annualColumns ? result.annualColumns : result?.columns;
  const context = result ? resultContext(id,mode.id,values,result) : null;
  const resultRef = useRef<HTMLDivElement>(null),
    request = useRef(0);
  useEffect(() => {
    let lastSource:string|null=null;
    function hydrate() {
      const source=window.location.hash.startsWith('#calc=')?window.location.hash:window.location.search;
      if(source===lastSource)return;
      lastSource=source;
      try {
        const shared=sharedInputs(calc,window.location.search,window.location.hash);
        if(!shared)return;
        const token=++request.current;
        const {mode:initial,values:v}=shared;
        setModeId(initial.id);setValues(v);setResult(null);setError("");setNotice("");setShowAll(false);setYearly(false);
        runCalculation(id,initial.id,v).then(next=>{
          if(token===request.current)setResult(next);
        }).catch(error=>{
          if(token===request.current){setResult(null);setError("Shared inputs could not be calculated: "+(error instanceof Error?error.message:"Check the entered values."));}
        });
      }catch(error){request.current++;setResult(null);setError(error instanceof Error?error.message:"Invalid calculation link.");}
    }
    hydrate();
    window.addEventListener("hashchange",hydrate);window.addEventListener("popstate",hydrate);
    return ()=>{request.current++;window.removeEventListener("hashchange",hydrate);window.removeEventListener("popstate",hydrate);};
  }, [calc,id]);
  const update = (key: string, value: string) => {
    request.current++;
    setValues((v) => ({ ...v, [key]: value }));
    setResult(null);
    setError("");
    setNotice("Inputs changed. Select Calculate to update the result.");
  };
  function switchMode(next: string) {
    request.current++;
    const m = calc.modes.find((x) => x.id === next)!;
    setModeId(next);
    setValues(defaults(m));
    setResult(null);
    setError("");
    setNotice("");
    setShowAll(false);
    setYearly(false);
  }
  async function calculate(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setResult(null);
    let v = { ...values };
    const token = ++request.current;
    try {
      const next = await runCalculation(id, mode.id, v);
      if (token !== request.current) return;
      setResult(next);
      setShowAll(false);
      setYearly(false);
      setTimeout(
        () =>
          resultRef.current?.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
            block: "start",
          }),
        0,
      );
    } catch (e) {
      if (token === request.current)
        setError(e instanceof Error ? e.message : "Unable to calculate.");
    }
  }
  function reset() {
    request.current++;
    setValues(
      (id === "vat" || (id === "commission" && mode.id === "any-two"))
        ? Object.fromEntries(mode.fields.map((f) => [f.key, ""]))
        : defaults(mode),
    );
    setResult(null);
    setError("");
    setNotice(
      (id === "vat" || (id === "commission" && mode.id === "any-two"))
        ? "Inputs cleared. Enter any two values."
        : "Inputs reset to defaults.",
    );
    setShowAll(false);
    setYearly(false);
  }
  function download(extra?: { rows: (number | string)[][]; columns: string[] }) {
    const rows = extra?.rows ?? tableRows, columns = extra?.columns ?? tableColumns;
    if (!rows || !columns) return;
    const escape = (x: string | number) =>
      '"' +
      (typeof x === "string" && /^[=+@-]/.test(x)
        ? "'" + x
        : String(x)
      ).replaceAll('"', '""') +
      '"';
    const csv = [columns, ...rows]
      .map((row) => row.map(escape).join(","))
      .join("\r\n");
    const a = document.createElement("a"),
      url = URL.createObjectURL(
        new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }),
      );
    a.href = url;
    a.download = id + (extra ? "-retirement" : "") + "-schedule.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  function input(field: Field, person?: string) {
    if (field.key === "verified_rate") return null;
    const inputId = id + "-" + mode.id + "-" + field.key;
    const hint = field.hint ?? inputHint(id,mode.id,field.key) ?? (id === "401k" && mode.id === "projection" ? ({
      match: "The percentage your employer adds for each eligible dollar you contribute. 50% means $0.50 per $1.",
      match_limit: "The portion of salary eligible for matching. At 6%, contributions above 6% of salary receive no additional match.",
      balance: "Your existing account total. Included once before future contributions and growth.",
    } as Record<string, string>)[field.key] : undefined);
    const describedBy = [field.unit ? inputId + "-unit" : "", hint ? inputId + "-hint" : ""].filter(Boolean).join(" ") || undefined;
    return (
      <div
        className={
          "field-row " + (field.type === "textarea" ? "field-wide" : "")
        }
        key={field.key}
      >
        <label htmlFor={inputId}>{person ?? field.label}</label>
        <div className="field-control">
          <div className={"field-entry"+(field.type === "textarea" ? " entry-textarea" : "")+(field.unit && field.unit.length > 12 ? " unit-long" : "")}>
          {field.type === "select" ? (
            <select
              id={inputId}
              aria-label={person ? field.label : undefined}
              aria-describedby={describedBy}
              value={values[field.key] ?? ""}
              onChange={(e) => update(field.key, e.target.value)}
            >
              {field.options
                ?.filter(
                  (x) =>
                    !(
                      id === "currency" &&
                      ["from", "to"].includes(field.key) &&
                      values.popular === "Yes"
                    ) ||
                    [
                      "USD",
                      "EUR",
                      "GBP",
                      "JPY",
                      "AUD",
                      "CAD",
                      "CHF",
                      "CNY",
                      "HKD",
                      "SGD",
                      "INR",
                      "NZD",
                      "KRW",
                      "MXN",
                      "BRL",
                      "ZAR",
                      "SEK",
                      "NOK",
                      "DKK",
                      values[field.key],
                    ].includes(x),
                )
                .map((x) => (
                  <option key={x}>{x}</option>
                ))}
            </select>
          ) : field.type === "textarea" ? (
            <textarea
              id={inputId}
              aria-label={person ? field.label : undefined}
              aria-describedby={describedBy}
              value={values[field.key] ?? ""}
              rows={4}
              onChange={(e) => update(field.key, e.target.value)}
            />
          ) : (
            <input
              id={inputId}
              aria-label={person ? field.label : undefined}
              aria-describedby={describedBy}
              type={field.type === "date" ? "date" : "number"}
              inputMode={field.type === "date" ? undefined : "decimal"}
              step={field.step ?? "any"}
              min={field.min}
              max={field.max}
              required={!field.optional}
              value={values[field.key] ?? ""}
              onChange={(e) => update(field.key, e.target.value)}
            />
          )}{" "}
          {field.unit && <span id={inputId + "-unit"} className="unit">{field.unit}</span>}
          </div>
          {hint && <small id={inputId + "-hint"}>{hint}</small>}
        </div>
      </div>
    );
  }
  const simple = mode.fields.length <= 14,
    visible = mode.fields.filter((f) => f.key !== "verified_rate"),
    main = simple ? visible : visible.slice(0, 8),
    advanced = simple ? [] : visible.slice(8);
  return (
    <>
      <p className="intro">{calc.intro}</p>
      {searchTasks[id] && <nav className="task-shortcuts" aria-label="Calculation shortcuts">{searchTasks[id].map(task=><button type="button" key={task.keyword} onClick={()=>switchMode(task.mode)}>{task.keyword}</button>)}</nav>}
      {calc.modes.length > 1 && (
        <div className="mode-tabs" role="tablist" aria-label="Calculation mode">
          {calc.modes.map((m) => (
            <button
              role="tab"
              tabIndex={modeId === m.id ? 0 : -1}
              onKeyDown={(e) => {
                if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
                e.preventDefault();
                const current = calc.modes.findIndex(x => x.id === modeId);
                const index = e.key === "Home" ? 0 : e.key === "End" ? calc.modes.length - 1 : (current + (e.key === "ArrowRight" ? 1 : -1) + calc.modes.length) % calc.modes.length;
                switchMode(calc.modes[index].id);
                document.getElementById("tab-" + calc.modes[index].id)?.focus();
              }}
              aria-selected={modeId === m.id}
              aria-controls="calculator-panel"
              id={"tab-" + m.id}
              key={m.id}
              onClick={() => switchMode(m.id)}
              className={modeId === m.id ? "active" : ""}
            >
              {m.title}
            </button>
          ))}
        </div>
      )}
      <div
        id="calculator-panel"
        role="tabpanel"
        aria-labelledby={calc.modes.length > 1 ? "tab-" + modeId : undefined}
      >
        <p className="mode-description">{mode.description}</p>
        <form onKeyDown={e=>{if(id === "scientific" && (e.target as HTMLElement).tagName === "TEXTAREA" && e.key === "Enter" && !e.shiftKey){e.preventDefault();e.currentTarget.requestSubmit();}}} onSubmit={calculate} className="calculator-form" onInvalidCapture={(e) => {
          const field = e.target as HTMLInputElement;
          const details = field.closest("details");
          if (details) details.open = true;
          setResult(null);
        }}>
          {id === "marriage-tax" ? <MarriageFields fields={visible} values={values} renderField={input} /> : main.map(f => input(f))}
          {id !== "marriage-tax" && advanced.length > 0 && (
            <details className="advanced" key={mode.id}>
              <summary>More options ({advanced.length})</summary>
              {advanced.map(f => input(f))}
            </details>
          )}
          {id === "scientific" && <ScientificKeypad values={values} update={update} />}
          <div className="form-actions">
            <button type="submit" className="calculate">
              Calculate{" "}
              <span aria-hidden="true">▶</span>
            </button>
            <button type="button" className="clear" onClick={reset}>
              {id === "vat" || (id === "commission" && mode.id === "any-two") ? "Clear" : "Reset"}
            </button>
          </div>
          {["Investment","Retirement"].includes(calc.category)&&mode.fields.some(field=>["return","rate","inflation","nominal"].includes(field.key))&&<p className="assumption-help">Planning rates are editable assumptions. <a href="/methodology.html#default-assumptions">About default values and their sources</a>.</p>}
        </form>
      </div>
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}
      {result && (
        <div ref={resultRef} className="result" aria-live="polite" tabIndex={-1}>
          <h2>Result</h2>
          {id === "irr" && result.metrics.length > 1 && <p className="notice" role="status">Multiple IRRs detected. There is no single unambiguous rate for these cash flows; the first result is not a recommended return.</p>}
          <div className="result-main">
            <div className="metrics">
              {(id === "marriage-tax" ? [...result.metrics.slice(-1), ...result.metrics.slice(0, -1)] : result.metrics).map((m, i) => (
                <div
                  className={i === 0 ? "metric primary" : "metric"}
                  key={m.label}
                >
                  <span>{id === "marriage-tax" && i === 0 ? (m.value < -0.005 ? "Estimated annual tax savings after marriage" : m.value > 0.005 ? "Estimated annual additional tax after marriage" : "Estimated annual tax difference after marriage") : m.label}</span>
                  <strong>
                    {m.displayValue ?? (m.format === "money"
                      ? new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: m.currency ?? "USD",
                        }).format(id === "marriage-tax" && i === 0 ? Math.abs(m.value) : m.value)
                      : amount(
                          m.value,
                          m.digits ??
                            (m.format === "percent"
                              ? 4
                              : Number.isInteger(m.value)
                                ? 0
                                : 4),
                        ))}
                    {m.format === "percent" ? "%" : ""}
                  </strong>
                </div>
              ))}
            </div>
            {result.chart && result.chart.some((x) => x.value > 0) && (
              <div className="chart">
                <div
                  role="img"
                  aria-label={result.chart
                    .map((x) => `${x.label}: ${amount(x.value)}`)
                    .join("; ")}
                  className="donut"
                  style={{
                    background: (() => {
                      const total = result.chart!.reduce(
                        (s, x) => s + Math.max(0, x.value),
                        0,
                      );
                      let start = 0;
                      return (
                        "conic-gradient(" +
                        result
                          .chart!.map((x, i) => {
                            const end =
                              start + (Math.max(0, x.value) / total) * 100;
                            const segment = `${colors[i % colors.length]} ${start}% ${end}%`;
                            start = end;
                            return segment;
                          })
                          .join(",") +
                        ")"
                      );
                    })(),
                  }}
                >
                  <div />
                </div>
                <ul>
                  {result.chart.map((x, i) => (
                    <li key={x.label}>
                      <span style={{ background: colors[i % colors.length] }} />
                      {x.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {context && <p className="result-context">{context}</p>}
          <div className="result-actions">
            <button onClick={() => window.print()}>Print</button>
            {result.rows && <button onClick={() => download()}>Download CSV</button>}
          </div>
          {id === "marriage-tax" && <p className="result-note">Compared with your combined unmarried federal income tax. Savings means the married-joint estimate is lower; additional tax means it is higher. This does not compare married filing separately or include state/local tax.</p>}
          {result.notes?.map((note, i) => (
            <p className="result-note" key={i}>
              {note}
            </p>
          ))}
          {result.rows && result.columns && (
            <>
              <h3>Calculation details</h3>
              {id === "401k" && mode.id === "projection" && <p className="result-note">Each row represents one projection year. Age is your age at year end; salary and contributions apply to that year. Balance is the account total after annual growth and year-end contributions. Amounts are in USD.</p>}
              <p className="table-help">Scroll horizontally or vertically to see more. Download CSV for the complete schedule.</p>
              {result.annualRows && (
                <div className="result-actions" aria-label="Schedule period">
                  <button
                    aria-pressed={!yearly}
                    onClick={() => {
                      setYearly(false);
                      setShowAll(false);
                    }}
                  >
                    {result.schedulePeriod ?? "Per payment"}
                  </button>
                  <button
                    aria-pressed={yearly}
                    onClick={() => {
                      setYearly(true);
                      setShowAll(false);
                    }}
                  >
                    Yearly
                  </button>
                </div>
              )}
              <div
                className="table-scroll"
                tabIndex={0}
                role="region"
                aria-label="Calculation detail table"
              >
                <table>
                  <thead>
                    <tr>
                      {tableColumns!.map((c, i) => (
                        <th scope="col" key={i}>{id === "401k" && mode.id === "projection" ? ({Age: "Year-end age", Employee: "Employee contribution", Employer: "Employer contribution", Balance: "Year-end balance"} as Record<string,string>)[c] ?? c : c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows!
                      .slice(0, showAll ? undefined : 36)
                      .map((row, i) => (
                        <tr key={i}>
                          {row.map((x, j) => (
                            <td key={j}>
                              {typeof x === "number"
                                ? amount(x, Number.isInteger(x) ? 0 : 2)
                                : x}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {tableRows!.length > 36 && (
                <button
                  className="show-rows"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll
                    ? "Show first 36 rows"
                    : `Show all ${tableRows!.length} rows`}
                </button>
              )}
            </>
          )}
          {result.additionalTables?.map(table => <section key={table.title}>
            <h3>{table.title}</h3>
            {table.note && <p className="result-note">{table.note}</p>}
            <div className="result-actions"><button onClick={() => download(table)}>Download retirement CSV</button></div>
            <div className="table-scroll" role="region" aria-label={table.title + " table"} tabIndex={0}>
              <table><thead><tr>{table.columns.map(column => <th scope="col" key={column}>{column}</th>)}</tr></thead>
                <tbody>{table.rows.map((row, i) => <tr key={i}>{row.map((value, j) => <td key={j}>{typeof value === "number" ? amount(value, Number.isInteger(value) ? 0 : 2) : value}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </section>)}
          <ResultShare key={mode.id} id={id} title={calc.title} path={routeFor(id)} mode={mode} values={values} result={result}/>
        </div>
      )}
      <section className="explanation">
        <h2>How to use this calculator</h2>
        <p>
          {mode.description} Enter amounts in the units shown, select the
          applicable options, and click Calculate.{" "}
          {id === "vat" || (id === "commission" && mode.id === "any-two")
            ? "Use Clear to empty the fields."
            : "Use Reset to restore the starting values."}
        </p>
        <h3>Calculation formula</h3>
        <p className="formula">{mode.formula}</p>
        <h3>Assumptions and accuracy</h3>
        <p>
          {calc.category === "Everyday Tools" ? "Check the selected mode, units, date endpoints and result notes. Currency selection controls display and rounding, not exchange rates. Calendar calculations do not include holidays or local time-of-day." : "Review timing, rates, fees and result notes when comparing scenarios. Future returns and rates are assumptions rather than guaranteed outcomes. Monetary display follows the currency’s precision; intermediate calculations retain additional digits."}
        </p>
        {[
          "income-tax",
          "marriage-tax",
          "take-home-paycheck",
          "rmd",
          "401k",
          "ira",
          "roth-ira",
        ].includes(id) && (
          <p>
            Year-specific parameters are documented in the calculation notes.
            Rule eligibility and individual circumstances can change the result.
          </p>
        )}
      </section>
    </>
  );
}
