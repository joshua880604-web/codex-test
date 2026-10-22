import { savingsChoices, taskModeGroups } from "@/lib/mode-navigation";

export default function TaskModePicker({ id, modeId, onChange }: { id: string; modeId: string; onChange: (mode: string) => void }) {
  if (id === "savings") return <fieldset className="savings-mode-picker">
    <legend>Calculate</legend>
    <div className="savings-mode-options">
      {savingsChoices.map(choice => <button key={choice.id} type="button" data-mode-id={choice.id}
        aria-pressed={choice.id === modeId} aria-controls="calculator-panel"
        aria-label={({ accumulation: "Savings balance", "goal-contribution": "Required monthly deposit", "goal-time": "Time to savings goal" } as Record<string, string>)[choice.id]}
        onClick={() => onChange(choice.id)}>{choice.label}</button>)}
    </div>
  </fieldset>;
  const groups = taskModeGroups[id];
  const group = groups.find(g => g.choices.some(choice => choice.id === modeId))!;
  const secondary = <>
    <label className="mobile-mode-label" htmlFor="task-mode">{group.detailLabel}</label>
    <select id="task-mode" value={modeId} onChange={e => {
      if (id === "commission" && e.target.value === "any-two") e.currentTarget.closest("details")?.querySelector("summary")?.focus();
      onChange(e.target.value);
    }}>
      {group.choices.map(choice => <option key={choice.id} value={choice.id}>{choice.label}</option>)}
    </select>
  </>;
  return <div className="task-mode-navigation">
    {id === "commission" ? <fieldset className="task-type-options">
      <legend>Commission type</legend>
      <div className="payoff-basis-options">
        {groups.map(g => <label key={g.id}>
          <input type="radio" name="task-group" value={g.id} data-mode-ids={g.choices.map(c => c.id).join(",")}
            checked={group.id === g.id} onChange={() => onChange(g.choices[0].id)} />
          <span>{g.label}</span>
        </label>)}
      </div>
    </fieldset> : <>
      <label className="mobile-mode-label" htmlFor="task-group">{id === "student-loan" ? "Loan task" : "Calculation type"}</label>
      <select id="task-group" value={group.id} onChange={e => onChange(groups.find(g => g.id === e.target.value)!.choices[0].id)}>
        {groups.map(g => <option key={g.id} value={g.id} data-mode-ids={g.choices.map(c => c.id).join(",")}>{g.label}</option>)}
      </select>
    </>}
    {group.choices.length > 1 && (id === "commission" ? <details className="specific-mode" open={modeId !== "any-two"}>
      <summary>Choose a specific unknown</summary>
      {secondary}
    </details> : <div className="task-mode-secondary">{secondary}</div>)}
  </div>;
}
