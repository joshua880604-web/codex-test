import { useEffect, useRef } from "react";
import { retirementScenarios, retirementStory, type RetirementPlan, type RetirementScenario } from "@/lib/retirement-story";
import type { Result, Values } from "@/lib/types";
const money = (n: number) => new Intl.NumberFormat("en-US", {style: "currency", currency: "USD"}).format(n);
const change = (n: number) => (n >= -0.005 ? "+" : "−") + money(Math.abs(n) < 0.005 ? 0 : Math.abs(n));

export default function RetirementStory({ values, result, baseline, active, onScenario, onRestore }: {
  values: Values; result: Result; baseline: RetirementPlan | null; active: RetirementScenario | null;
  onScenario: (scenario: RetirementScenario) => void; onRestore: () => void;
}) {
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!active) return;
    section.current?.querySelector<HTMLButtonElement>(`[data-scenario="${active.id}"]`)?.focus({preventScroll:true});
    section.current?.querySelector(".story-comparison")?.scrollIntoView({block:"nearest",behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});
  }, [active]);
  const story = retirementStory(values, result);
  if (!story) return null;
  const original = baseline ? retirementStory(baseline.values, baseline.result) : null;
  const scenarios = retirementScenarios(baseline ?? {values, result});
  const positive = story.parts.every(p => p.value >= 0) && story.balance > 0;
  return <section ref={section} className="retirement-story" aria-label="Your retirement result explained">
    <h3>Where your projected balance comes from</h3>
    {positive && <div className="story-composition" aria-hidden="true">{story.parts.map(p => <span key={p.id} className={"story-part-" + p.id} style={{width: (p.value / story.balance * 100) + "%"}} />)}</div>}
    <dl className="story-parts">{story.parts.map(p => <div key={p.id} data-part={p.id}>
      <dt><span className={"story-swatch story-part-" + p.id} aria-hidden="true" />{p.label}</dt>
      <dd className={p.value < 0 ? "story-negative" : ""}>{money(p.value)}</dd>
    </div>)}</dl>
    <p className="story-detail">Existing savings may already include past contributions, matching and returns. The other amounts cover this projection only. Figures are rounded.</p>
    <div className="story-meaning">
      <h3>What this could mean</h3>
      <p>{story.interpretation}</p>
      <p className="story-detail">Before tax, with constant returns, full vesting and no fees. Actual outcomes can differ.</p>
    </div>
    <details className="story-four-percent"><summary>Compare a 4% starting withdrawal</summary>
      <p>Taking 4% of the projected balance in the first retirement year equals about <strong>{money(story.fourPercentMonthly)} per month</strong>, or {money(story.fourPercentToday)} in today’s dollars.</p>
      <p className="story-detail">Balance × 4% ÷ 12. This illustration is separate from the lifespan-based model above and does not guarantee that savings will last.</p>
    </details>
    <section className="story-scenarios" aria-label="Try a retirement scenario">
      <h3>Try a small change</h3>
      <p className="story-detail">Each option changes one assumption from your original plan. Inputs above update to match.</p>
      <div className="story-scenario-buttons">{scenarios.map(s => <div key={s.id}>
        <button type="button" data-scenario={s.id} aria-pressed={active?.id === s.id} disabled={!!s.disabledReason}
          aria-describedby={s.disabledReason ? "scenario-" + s.id + "-reason" : undefined} onClick={() => onScenario(s)}>{s.label}</button>
        {s.disabledReason && <small id={"scenario-" + s.id + "-reason"}>{s.disabledReason}</small>}
      </div>)}</div>
      {active && original && <div className="story-comparison">
        <h4>{active.label} vs. original plan</h4>
        <p>{active.detail}</p>
        <dl>
          <div><dt>Projected balance change</dt><dd data-delta="balance">{change(story.balance - original.balance)}</dd>
            <small>Original: {money(original.balance)} at age {original.retire}. Scenario: {money(story.balance)} at age {story.retire}.</small></div>
          <div><dt>Initial monthly withdrawal change, today’s dollars</dt><dd data-delta="monthly-today">{change(story.todayMonthly - original.todayMonthly)}</dd>
            <small>Original: {money(original.todayMonthly)}. Scenario: {money(story.todayMonthly)}.</small></div>
        </dl>
        {story.retire !== original.retire && <p className="story-detail">Future balances occur at different retirement ages. Today’s-dollar withdrawals compare purchasing power; the later plan also has a shorter withdrawal period.</p>}
        <button type="button" className="story-restore" onClick={onRestore}>Restore original plan</button>
      </div>}
    </section>
  </section>;
}
