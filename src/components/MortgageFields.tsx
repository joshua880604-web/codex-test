import type { ReactNode } from "react";
import { mortgageCostSummary, mortgageLoanBasis } from "@/lib/mortgage-inputs";
import type { Field, Values } from "@/lib/types";

export default function MortgageFields({ fields, values, mode, update, renderField }: {
  fields: Field[]; values: Values; mode: string;
  update: (key: string, value: string) => void;
  renderField: (field: Field) => ReactNode;
}) {
  const direct = mortgageLoanBasis(values);
  const field = (key: string) => {
    const f = fields.find(f => f.key === key);
    return f ? renderField(["years", "loan_amount"].includes(key) ? { ...f, hint: "" } : f) : null;
  };
  const housing = ["tax", "tax_unit", "insurance", "insurance_unit", "hoa", "hoa_unit", "other", "other_unit", "tax_growth", "insurance_growth", "hoa_growth", "other_growth"];
  const pmi = ["property_value", "pmi_method", "pmi_credit", "pmi", "pmi_unit", "pmi_policy", "pmi_years", "appraised_value"];
  const timing = ["months", "start", "extra_monthly", "extra_start", "extra_yearly", "extra_yearly_start", "extra_once", "extra_once_month", "dated"];
  const extras = ["extra_monthly", "extra_yearly", "extra_once"].some(key => Number(values[key]) > 0) || Boolean(values.dated?.trim());
  const group = (keys: string[]) => keys.map(key => <span className="mortgage-field" key={key}>{field(key)}</span>);
  return <div className="mortgage-fields">
    <fieldset className="mortgage-basis">
      <legend>Input method</legend>
      <div>{["Home price & down payment", "Loan amount"].map(basis => <label key={basis}>
        <input type="radio" name="mortgage-input-method" value={basis} checked={direct ? basis === "Loan amount" : basis !== "Loan amount"} onChange={() => update("loan_basis", basis)} />
        <span>{basis === "Home price & down payment" ? "Home price + down payment" : basis}</span>
      </label>)}</div>
    </fieldset>
    {direct ? field("loan_amount") : <>
      {field("price")}
      <div className="mortgage-down-pair">{field("down")}{field("down_unit")}</div>
    </>}
    {field("years")}{field("rate")}
    {direct && <p className="mortgage-input-help">Existing loan? Use its current balance and remaining term.</p>}
    {mode !== "biweekly" && <>
      <details className="advanced mortgage-options" data-mortgage-group="housing">
        <summary><span>Taxes, insurance & fees</span><small>{mortgageCostSummary(values)}</small></summary>
        <p className="mortgage-input-help">Annual amounts below are included in your monthly total. Home insurance is separate from PMI.</p>
        {direct && <p className="mortgage-input-help">Percentage costs use the original home value entered under PMI & home value.</p>}
        {group(housing)}
      </details>
      <details className="advanced mortgage-options" data-mortgage-group="pmi">
        <summary><span>PMI & home value</span><small>{values.pmi_method === "Automatic estimate" ? `Automatic estimate · credit ${values.pmi_credit}` : `Manual · ${values.pmi || "0"}${values.pmi_unit === "Percent of loan" ? "% of loan/yr" : " USD/yr"}`}</small></summary>
        {direct && <p className="mortgage-input-help">Use your actual PMI quote for an existing loan. Automatic estimates need the original home value and illustrate a new purchase.</p>}
        {group(pmi)}
      </details>
    </>}
    <details className="advanced mortgage-options" data-mortgage-group="extras">
      <summary><span>Extra payments & dates</span><small>{extras ? "Additional principal entered" : "No extra payments"}{Number(values.months) > 0 ? ` · ${values.months} additional months` : ""}</small></summary>
      {group(timing)}
    </details>
  </div>;
}
