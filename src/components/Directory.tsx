"use client";
import { searchTasks } from "@/lib/keyword-targets";
import { useState } from "react";
import { calculators, categories, routeFor } from "@/lib/catalog";

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
const categoryId = (category: string) => category.toLowerCase().replaceAll(" ", "-");
export default function Directory({ propertyOnly = false }: { propertyOnly?: boolean }) {
  const [query, setQuery] = useState("");
  const search = query.trim().toLowerCase();
  const filtered = calculators.filter(c =>
    (!propertyOnly || c.category === "Mortgage and Real Estate") &&
    (c.title + " " + (searchTasks[c.id] ?? []).map(t => t.keyword + " " + t.description).join(" ")).toLowerCase().includes(search),
  );
  const groups = categories.map(category => ({ category, tools: filtered.filter(c => c.category === category) })).filter(g => g.tools.length);
  return (
    <div className="calculator-directory">
      <p className="directory-intro">{propertyOnly
        ? "Calculators for mortgages, property investment, and home ownership."
        : "Find the right tool for your loans, savings, retirement, taxes, and everyday calculations."}</p>
      <div className="directory-search" role="search" aria-label="Calculator search">
        <label htmlFor="directory-search">Find a calculator</label>
        <div className="directory-search-control">
          <input id="directory-search" type="search" placeholder="Try mortgage, retirement, or percentage" value={query} onChange={e => setQuery(e.target.value)} aria-controls="calculator-list" />
          {query && <button type="button" className="clear" onClick={() => { setQuery(""); document.getElementById("directory-search")?.focus(); }}>Clear search</button>}
        </div>
        <span role="status" aria-live="polite">{filtered.length} {filtered.length === 1 ? "tool" : "tools"}{search ? " found" : " available"}</span>
      </div>
      {!search && !propertyOnly && <section className="featured-tools" aria-labelledby="featured-heading">
        <h2 id="featured-heading">Quick access</h2>
        <div className="featured-grid">{featured.map(([id, description]) => {
          const calculator = calculators.find(c => c.id === id)!;
          return <a key={id} href={routeFor(id)}><strong>{calculator.title}</strong><span>{description}</span></a>;
        })}</div>
      </section>}
      {groups.length > 1 && <nav className="directory-categories" aria-label="Calculator categories">
        <span>Browse by category</span>
        <div>{groups.map(({ category, tools }) => <a href={"#" + categoryId(category)} key={category}>{category}<span>{tools.length}</span></a>)}</div>
      </nav>}
      <div className="directory-list-heading"><h2>{search ? "Search results" : "All calculators"}</h2>{search && <p>Matching “{query.trim()}”</p>}</div>
      <div className="directory-grid" id="calculator-list">
        {groups.map(({ category, tools }) => <section key={category} id={categoryId(category)} aria-labelledby={categoryId(category) + "-heading"}>
          <h3 id={categoryId(category) + "-heading"}>{category}<span>{tools.length}</span></h3>
          <ul>{tools.map(c => <li key={c.id}><a href={routeFor(c.id)}>{c.title}</a></li>)}</ul>
        </section>)}
      </div>
      {!filtered.length && <div className="directory-empty"><h3>No calculators found</h3><p>Try a shorter term, such as “loan”, “tax”, or “interest”.</p><button className="clear" type="button" onClick={() => { setQuery(""); document.getElementById("directory-search")?.focus(); }}>Show all calculators</button></div>}
    </div>
  );
}
