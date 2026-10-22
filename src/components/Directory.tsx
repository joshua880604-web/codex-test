"use client";
import {directoryGroups,directoryGroup,directoryMatch,directorySort,directoryDescriptions,directoryTarget,directoryScore} from "@/lib/directory";
import QuickCalculator from "./QuickCalculator";
import { useState,useRef,type FormEvent } from "react";
import { calculators, routeFor } from "@/lib/catalog";

const featured = [
  ["mortgage", "Estimate your monthly payment"],
  ["loan", "Compare payments and interest"],
  ["compound-interest", "See how your savings can grow"],
  ["retirement", "Plan your retirement savings"],
  ["401k", "Project contributions and growth"],
  ["savings", "Work toward a savings goal"],
  ["percentage", "Find percentages and changes"],
  ["scientific", "Calculate with scientific functions"],
];
export default function Directory({ propertyOnly = false }: { propertyOnly?: boolean }) {
  const [query, setQuery] = useState(""),[message,setMessage]=useState("");
  const resultHeading=useRef<HTMLHeadingElement>(null);
  const search = query.trim().toLowerCase();
  const filtered = calculators.filter(c =>
    (!propertyOnly || c.category === "Mortgage and Real Estate") &&
    directoryMatch(c,search),
  );
  const groups = directoryGroups.map(g => ({...g,tools:directorySort(filtered.filter(c => directoryGroup(c.id,c.category)===g.id),g.popular).sort((a,b)=>search?directoryScore(a,search)-directoryScore(b,search):0)})).filter(g=>g.tools.length).sort((a,b)=>search?directoryScore(a.tools[0],search)-directoryScore(b.tools[0],search):0);
  function submit(e:FormEvent){
    e.preventDefault();if(!search){document.getElementById('directory-search')?.focus();return;}
    const target=directoryTarget(filtered,search);if(target){window.location.assign(routeFor(target.id));return;}
    setMessage(filtered.length?'Choose a matching calculator below.':'Try a shorter or different search.');
    resultHeading.current?.focus({preventScroll:true});resultHeading.current?.scrollIntoView({block:'nearest'});
  }
  return (
    <div className="calculator-directory">
      <p className="directory-intro">{propertyOnly
        ? "Calculators for mortgages, property investment, and home ownership."
        : "Find the right tool for your loans, savings, retirement, taxes, and everyday calculations."}</p>
      <div className={propertyOnly ? undefined : "directory-tools"+(search?" is-searching":"")}>
      <form className="directory-search" role="search" aria-label="Calculator search" onSubmit={submit}>
        <label htmlFor="directory-search">Find a calculator</label>
        <div className="directory-search-control">
          <input id="directory-search" type="search" placeholder="Try car payment, mortgage, or retirement" value={query} onChange={e => {setQuery(e.target.value);setMessage("");}} aria-controls="calculator-list" />
          <button type="submit" className="directory-search-submit">Search</button>
          {query && <button type="button" className="clear" onClick={() => { setQuery(""); setMessage(""); document.getElementById("directory-search")?.focus(); }}>Clear search</button>}
        </div>
        <span role="status" aria-live="polite">{filtered.length} {filtered.length === 1 ? "tool" : "tools"}{search ? " found" : " available"}{message&&". "+message}</span>
      </form>
      {!propertyOnly && <div className="directory-quick" hidden={!!search}><QuickCalculator/></div>}
      {!search && !propertyOnly && <section className="featured-tools" aria-labelledby="featured-heading">
        <h2 id="featured-heading">Quick access</h2>
        <div className="featured-grid">{featured.map(([id, description]) => {
          const calculator = calculators.find(c => c.id === id)!;
          return <a key={id} href={routeFor(id)}><strong>{calculator.title}</strong><span>{description}</span></a>;
        })}</div>
      </section>}
      </div>
      {!search && groups.length > 1 && <nav className="directory-categories" aria-label="Calculator categories">
        <span>Browse by category</span>
        <div>{groups.map(({ id, title, tools }) => <a href={"#" + id} key={id}>{title}<span>{tools.length}</span></a>)}</div>
      </nav>}
      <div className="directory-list-heading"><h2 ref={resultHeading} tabIndex={-1}>{search ? "Search results" : "All calculators"}</h2>{search && <p>Matching “{query.trim()}”</p>}</div>
      <div className="directory-grid" id="calculator-list">
        {groups.map(({ id, title, tools }) => <section key={id} id={id} aria-labelledby={id + "-heading"} tabIndex={-1}>
          {({"mortgage-housing":["mortgage-and-real-estate"],"loans-debt":["auto","other"],"saving-investing":["investment"],"tax-salary":["tax-and-salary"],"everyday":["everyday-tools"]} as Record<string,string[]>)[id]?.map(anchor=><span key={anchor} id={anchor} aria-hidden="true"/>)}
          <h3 id={id + "-heading"}>{title}<span>{tools.length}</span></h3>
          <ul>{tools.map(c => <li key={c.id}><a href={routeFor(c.id)}>{c.title}{directoryDescriptions[c.id]&&<small>{directoryDescriptions[c.id]}</small>}</a></li>)}</ul>
        </section>)}
      </div>
      {!filtered.length && <div className="directory-empty"><h3>No calculators found</h3><p>Try a shorter term, such as “loan”, “tax”, or “interest”.</p><button className="clear" type="button" onClick={() => { setQuery(""); setMessage(""); document.getElementById("directory-search")?.focus(); }}>Show all calculators</button></div>}
    </div>
  );
}
