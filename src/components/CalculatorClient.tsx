"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  calculators,
  defaults,
  routeFor,
  runCalculation,
} from "@/lib/calculators";
import type { Field, Result, Values } from "@/lib/types";
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
export default function CalculatorClient({ id }: { id: string }) {
  const calc = calculators.find((c) => c.id === id)!;
  const [modeId, setModeId] = useState(calc.modes[0].id);
  const mode = calc.modes.find((m) => m.id === modeId)!;
  const [values, setValues] = useState<Values>(() => defaults(mode)),
    [result, setResult] = useState<Result | null>(() => {
      try {
        return runCalculation(id, mode.id, defaults(mode));
      } catch {
        return null;
      }
    }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [feed, setFeed] = useState(""),
    [showAll, setShowAll] = useState(false),
    [notice, setNotice] = useState("");
  const [yearly, setYearly] = useState(false);
  const tableRows =
    yearly && result?.annualRows ? result.annualRows : result?.rows;
  const tableColumns =
    yearly && result?.annualColumns ? result.annualColumns : result?.columns;
  const resultRef = useRef<HTMLDivElement>(null),
    request = useRef(0);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search),
      found = calc.modes.find((m) => m.id === q.get("mode"));
    const initial = found ?? calc.modes[0],
      v = defaults(initial);
    for (const f of initial.fields) {
      const x = q.get(f.key);
      if (x !== null) v[f.key] = x;
    }
    setModeId(initial.id);
    setValues(v);
    try {
      setResult(runCalculation(id, initial.id, v));
    } catch {
      setResult(null);
    }
  }, [calc, id]);
  const update = (key: string, value: string) => {
    request.current++;
    setBusy(false);
    setValues((v) => ({ ...v, [key]: value }));
    setResult(null);
    setError("");
    setFeed("");
    setNotice("Inputs changed. Select Calculate to update the result.");
  };
  function switchMode(next: string) {
    request.current++;
    setBusy(false);
    const m = calc.modes.find((x) => x.id === next)!;
    setModeId(next);
    setValues(defaults(m));
    setResult(null);
    setError("");
    setFeed("");
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
      if (id === "currency" && mode.id === "live" && v.from !== v.to) {
        setBusy(true);
        const response = await fetch(
          "/api/rates?from=" +
            encodeURIComponent(v.from) +
            "&to=" +
            encodeURIComponent(v.to),
        );
        const data = await response.json();
        if (token !== request.current) return;
        if (!response.ok)
          throw new Error(
            data.error ??
              "Exchange rate feed unavailable. Use Custom Exchange Rate.",
          );
        v = { ...v, verified_rate: String(data.rate) };
        setFeed(
          `${data.stale ? "Market feed unavailable; using the saved reference snapshot. " : ""}Reference date(s): ${data.date}. Source: ${data.source}. ${v.from} → ${v.to}.`,
        );
      }
      const next = runCalculation(id, mode.id, v);
      if (token !== request.current) return;
      setResult(next);
      setShowAll(false);
      setYearly(false);
      setTimeout(
        () =>
          resultRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          }),
        0,
      );
    } catch (e) {
      if (token === request.current)
        setError(e instanceof Error ? e.message : "Unable to calculate.");
    } finally {
      if (token === request.current) setBusy(false);
    }
  }
  function reset() {
    request.current++;
    setBusy(false);
    setValues(defaults(mode));
    setResult(null);
    setError("");
    setNotice("Inputs reset to defaults.");
    setFeed("");
    setShowAll(false);
    setYearly(false);
  }
  async function share() {
    const q = new URLSearchParams({ mode: mode.id, ...values });
    q.delete("verified_rate");
    const url = window.location.origin + routeFor(id) + "?" + q.toString();
    try {
      await navigator.clipboard.writeText(url);
      setNotice("Calculation link copied.");
    } catch {
      setNotice(url);
    }
  }
  function download() {
    if (!tableRows || !tableColumns) return;
    const escape = (x: string | number) =>
      '"' +
      (typeof x === "string" && /^[=+@-]/.test(x)
        ? "'" + x
        : String(x)
      ).replaceAll('"', '""') +
      '"';
    const csv = [tableColumns, ...tableRows]
      .map((row) => row.map(escape).join(","))
      .join("\r\n");
    const a = document.createElement("a"),
      url = URL.createObjectURL(
        new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }),
      );
    a.href = url;
    a.download = id + "-schedule.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  function input(field: Field) {
    if (field.key === "verified_rate") return null;
    const inputId = id + "-" + mode.id + "-" + field.key;
    return (
      <div
        className={
          "field-row " + (field.type === "textarea" ? "field-wide" : "")
        }
        key={field.key}
      >
        <label htmlFor={inputId}>{field.label}</label>
        <div className="field-control">
          {field.type === "select" ? (
            <select
              id={inputId}
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
              value={values[field.key] ?? ""}
              rows={4}
              onChange={(e) => update(field.key, e.target.value)}
            />
          ) : (
            <input
              id={inputId}
              type={field.type === "date" ? "date" : "number"}
              step="any"
              min={field.min}
              max={field.max}
              required={!field.optional}
              value={values[field.key] ?? ""}
              onChange={(e) => update(field.key, e.target.value)}
            />
          )}{" "}
          {field.unit && <span className="unit">{field.unit}</span>}
          {field.hint && <small>{field.hint}</small>}
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
      {calc.modes.length > 1 && (
        <div className="mode-tabs" role="tablist" aria-label="Calculation mode">
          {calc.modes.map((m) => (
            <button
              role="tab"
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
        <form onSubmit={calculate} className="calculator-form">
          {main.map(input)}
          {advanced.length > 0 && (
            <details className="advanced" key={mode.id}>
              <summary>More options ({advanced.length})</summary>
              {advanced.map(input)}
            </details>
          )}
          <div className="form-actions">
            <button type="submit" className="calculate" disabled={busy}>
              {busy ? "Fetching rate…" : "Calculate"}{" "}
              <span aria-hidden="true">▶</span>
            </button>
            <button type="button" className="clear" onClick={reset}>
              Clear
            </button>
          </div>
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
      {feed && <p className="feed-source">{feed}</p>}
      {result && (
        <div ref={resultRef} className="result" aria-live="polite">
          <h2>Result</h2>
          <div className="result-main">
            <div className="metrics">
              {result.metrics.map((m, i) => (
                <div
                  className={i === 0 ? "metric primary" : "metric"}
                  key={m.label}
                >
                  <span>{m.label}</span>
                  <strong>
                    {m.format === "money"
                      ? new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(m.value)
                      : amount(
                          m.value,
                          m.digits ??
                            (m.format === "percent"
                              ? 4
                              : Number.isInteger(m.value)
                                ? 0
                                : 4),
                        )}
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
          <div className="result-actions">
            <button onClick={share}>Share calculation</button>
            <button onClick={() => window.print()}>Print</button>
            {result.rows && <button onClick={download}>Download CSV</button>}
          </div>
          {result.notes?.map((note, i) => (
            <p className="result-note" key={i}>
              {note}
            </p>
          ))}
          {result.rows && result.columns && (
            <>
              <h3>Calculation details</h3>
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
                        <th key={i}>{c}</th>
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
        </div>
      )}
      <section className="explanation">
        <h2>How to use this calculator</h2>
        <p>
          {mode.description} Enter amounts in the units shown, select the
          applicable options, and click Calculate. Use Clear to restore the
          starting values.
        </p>
        <h3>Calculation formula</h3>
        <p className="formula">{mode.formula}</p>
        <h3>Assumptions and accuracy</h3>
        <p>
          Review timing, rates, fees, and result notes when comparing scenarios.
          Future returns and rates are assumptions rather than guaranteed
          outcomes. Monetary figures are displayed to two decimal places;
          intermediate calculations retain additional precision.
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
