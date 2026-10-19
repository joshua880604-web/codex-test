"use client";
import { useState } from "react";
import { calculators, categories, routeFor } from "@/lib/calculators";
export default function Directory({
  propertyOnly = false,
}: {
  propertyOnly?: boolean;
}) {
  const [query, setQuery] = useState("");
  const filtered = calculators.filter(
    (c) =>
      (!propertyOnly || c.category === "Mortgage and Real Estate") &&
      c.title.toLowerCase().includes(query.toLowerCase()),
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
        <span>{filtered.length} tools</span>
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
        <p role="status">No calculators match your search.</p>
      )}
    </>
  );
}
