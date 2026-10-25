"use client";
import {directoryGroups,directoryGroup,directorySearch,directorySort,directoryDescriptions,directoryTarget} from "@/lib/directory";
import QuickCalculator from "./QuickCalculator";
import { useState,useRef,useEffect,type FormEvent,type KeyboardEvent } from "react";
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
  const [query,setQuery]=useState("");
  const [open,setOpen]=useState(false),[active,setActive]=useState(-1),[expanded,setExpanded]=useState(false);
  const form=useRef<HTMLFormElement>(null),input=useRef<HTMLInputElement>(null);
  const tools=calculators.filter(c=>!propertyOnly||c.category==="Mortgage and Real Estate");
  const search=query.trim();
  const results=directorySearch(tools,search),visible=expanded?results:results.slice(0,8);
  const showing=open&&!!search;
  const groups=directoryGroups.map(g=>({...g,tools:directorySort(tools.filter(c=>directoryGroup(c.id,c.category)===g.id),g.popular)})).filter(g=>g.tools.length);
  useEffect(()=>{
    function outside(e:PointerEvent){if(!form.current?.contains(e.target as Node))setOpen(false);}
    document.addEventListener('pointerdown',outside);
    return ()=>document.removeEventListener('pointerdown',outside);
  },[]);
  useEffect(()=>{
    if(showing&&active>=0)document.getElementById('calculator-option-'+active)?.scrollIntoView({block:'nearest'});
  },[active,showing]);
  function submit(e:FormEvent){
    e.preventDefault();
    if(!search){input.current?.focus();return;}
    const selected=showing&&active>=0?visible[active]:undefined;
    const targetId=directoryTarget(tools,search)?.id;
    const target=selected??results.find(r=>r.tool.id===targetId);
    if(target){window.location.assign(target.href);return;}
    setOpen(true);setExpanded(true);input.current?.focus();
  }
  function keys(e:KeyboardEvent<HTMLInputElement>){
    if(e.key==='Escape'){e.preventDefault();setOpen(false);setActive(-1);return;}
    if(e.key==='Tab'){setOpen(false);setActive(-1);return;}
    if((e.key==='ArrowDown'||e.key==='ArrowUp')&&search&&visible.length){
      e.preventDefault();setOpen(true);
      setActive(i=>e.key==='ArrowDown'?(i+1)%visible.length:(i<0?visible.length-1:(i-1+visible.length)%visible.length));
    }
  }
  return (
    <div className="calculator-directory">
      <p className="directory-intro">{propertyOnly
        ? "Calculators for mortgages, property investment, and home ownership."
        : "Find the right tool for your loans, savings, retirement, taxes, and everyday calculations."}</p>
      <div className={propertyOnly ? undefined : "directory-tools"}>
      <form ref={form} className="directory-search" role="search" aria-label="Calculator search" onSubmit={submit} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setOpen(false);}}>
        <label htmlFor="directory-search">Find a calculator</label>
        <div className="directory-search-control">
          <div className="directory-search-field">
            <input ref={input} id="directory-search" type="search" autoComplete="off" maxLength={160} placeholder="Try car payment, mortgage, or retirement" value={query} onChange={e=>{setQuery(e.target.value);setOpen(true);setActive(-1);setExpanded(false);}} onFocus={()=>setOpen(true)} onKeyDown={keys} role="combobox" aria-autocomplete="list" aria-expanded={showing} aria-controls="calculator-suggestions" aria-activedescendant={showing&&active>=0?'calculator-option-'+active:undefined}/>
            {query&&<button type="button" className="directory-search-clear" aria-label="Clear search" onClick={()=>{setQuery("");setActive(-1);setExpanded(false);input.current?.focus();}}>×</button>}
          </div>
          <button type="submit" className="directory-search-submit">Search</button>
          {showing&&<div className="directory-suggestions">
            <ul id="calculator-suggestions" role="listbox" aria-label="Matching calculators">
              {visible.map(({tool,href},i)=><li key={tool.id} role="presentation"><a id={'calculator-option-'+i} href={href} role="option" aria-selected={i===active} tabIndex={-1} onMouseDown={e=>e.preventDefault()}>{tool.title}</a></li>)}
            </ul>
            {!results.length&&<p>No calculators found. Try “loan”, “tax”, or “interest”.</p>}
            {!expanded&&results.length>visible.length&&<button type="button" className="directory-search-more" onClick={()=>{setExpanded(true);input.current?.focus();}}>Show all {results.length} matching calculators</button>}
          </div>}
        </div>
        <span role="status" aria-live="polite">{search?`${results.length} ${results.length===1?'calculator':'calculators'} found`:`${tools.length} tools available`}</span>
      </form>
      {!propertyOnly&&<div className="directory-quick"><QuickCalculator/></div>}
      {!propertyOnly && <section className="featured-tools" aria-labelledby="featured-heading">
        <h2 id="featured-heading">Quick access</h2>
        <div className="featured-grid">{featured.map(([id, description]) => {
          const calculator = calculators.find(c => c.id === id)!;
          return <a key={id} href={routeFor(id)}><strong>{calculator.title}</strong><span>{description}</span></a>;
        })}</div>
      </section>}
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
