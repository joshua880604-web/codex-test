"use client";
import {searchTasks} from "@/lib/keyword-targets";
import { useState } from "react";
import { calculators, categories, routeFor } from "@/lib/catalog";
export default function Directory({
  propertyOnly = false,
}: {
  propertyOnly?: boolean;
}) {
  const [query, setQuery] = useState("");
  const filtered = calculators.filter(
    (c) =>
      (!propertyOnly || c.category === "Mortgage and Real Estate") &&
      (c.title + " " + (searchTasks[c.id] ?? []).map(t=>t.keyword + " " + t.description).join(" ")).toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <>
      <p>
        {propertyOnly
          ? "Calculators for mortgages, property investment, and home ownership."
          : "The following is a complete list of our financial calculators."}
      </p>
      <div className="directory-search">
        <label htmlFor="directory-search">Find a calculator</label>
        <input
          id="directory-search"
          type="search"
          placeholder="Search financial calculators"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span role="status">{filtered.length} tools</span>
        {query && <button type="button" className="clear" onClick={() => setQuery("")}>Clear search</button>}
      </div>
      <div className="directory-grid">
        {categories.map((category) => {
          const tools = filtered.filter((c) => c.category === category);
          return tools.length > 0 ? (
            <section
              key={category}
              id={category.toLowerCase().replaceAll(" ", "-")}
            >
              <h2>{category}</h2>
              <ul>
                {tools.map((c) => (
                  <li key={c.id}>
                    <a href={routeFor(c.id)}>{c.title}</a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null;
        })}
      </div>
      {!filtered.length && (
        <p>No calculators match your search.</p>
      )}
    </>
  );
}
