"use client";
import {directoryGroups,directoryGroup,directorySort,directoryDescriptions} from "@/lib/directory";
import QuickCalculator from "./QuickCalculator";
import CalculatorSearch from "./CalculatorSearch";
import { calculators, routeFor } from "@/lib/catalog";

const featured = [
  ["mortgage", "Estimate your monthly payment"],
  ["loan", "Compare payments and interest"],
  ["compound-interest", "See how your savings can grow"],
  ["retirement", "Plan your retirement savings"],
  ["401k", "Project contributions and growth"],
  ["savings", "Work toward a savings goal"],
];
export default function Directory({ propertyOnly = false }: { propertyOnly?: boolean }) {
  const tools=calculators.filter(c=>!propertyOnly||c.category==="Mortgage and Real Estate");
  const groups=directoryGroups.map(g=>({...g,tools:directorySort(tools.filter(c=>directoryGroup(c.id,c.category)===g.id),g.popular)})).filter(g=>g.tools.length);
  return (
    <div className="calculator-directory">
      <p className="directory-intro">{propertyOnly
        ? "Calculators for mortgages, property investment, and home ownership."
        : "Find the right tool for your loans, savings, retirement, taxes, and everyday calculations."}</p>
      <div className={propertyOnly ? undefined : "directory-tools"}>
      <CalculatorSearch id="directory-search" tools={tools}/>
      {!propertyOnly && <section className="featured-tools" aria-labelledby="featured-heading">
        <h2 id="featured-heading">Popular financial calculators</h2>
        <div className="featured-grid">{featured.map(([id, description]) => {
          const calculator = calculators.find(c => c.id === id)!;
          return <a key={id} href={routeFor(id)}><strong>{calculator.title}</strong><span>{description}</span></a>;
        })}</div>
      </section>}
      {!propertyOnly&&<div className="directory-quick"><QuickCalculator/></div>}
      </div>
      {groups.length > 1 && <nav className="directory-categories" aria-label="Calculator categories">
        <span>Browse by category</span>
        <div>{groups.map(({ id, title, tools }) => <a href={"#" + id} key={id}>{title}<span>{tools.length}</span></a>)}</div>
      </nav>}
      <div className="directory-list-heading"><h2>All calculators</h2></div>
      <div className="directory-grid" id="calculator-list">
        {groups.map(({ id, title, tools }) => <section key={id} id={id} aria-labelledby={id + "-heading"} tabIndex={-1}>
          {({"mortgage-housing":["mortgage-and-real-estate"],"loans-debt":["auto","other"],"saving-investing":["investment"],"tax-salary":["tax-and-salary"],"everyday":["everyday-tools"]} as Record<string,string[]>)[id]?.map(anchor=><span key={anchor} id={anchor} aria-hidden="true"/>)}
          <h3 id={id + "-heading"}>{title}<span>{tools.length}</span></h3>
          <ul>{tools.map(c => <li key={c.id}><a href={routeFor(c.id)}>{c.title}{directoryDescriptions[c.id]&&<small>{directoryDescriptions[c.id]}</small>}</a></li>)}</ul>
        </section>)}
      </div>

    </div>
  );
}
