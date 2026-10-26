"use client";
import SiteLink from "@/components/SiteLink";

import { useState } from 'react';
type Term={slug:string;name:string;definition:string;category:string;aliases:string[]};
const topicId=(category:string)=>'topic-'+category.toLowerCase().replace(/[^a-z]+/g,'-');
const normalize=(text:string)=>text.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
export default function GlossaryDirectory({terms,categories}:{terms:Term[];categories:string[]}){
 const [query,setQuery]=useState('');
 const words=normalize(query).split(' ').filter(Boolean);
 const filtered=terms.filter(term=>{const text=normalize([term.name,...term.aliases,term.definition].join(' '));return words.every(word=>text.includes(word));});
 const groups=categories.map(category=>({category,terms:filtered.filter(term=>term.category===category)})).filter(group=>group.terms.length);
 return <>
  <form className="glossary-search" role="search" onSubmit={event=>event.preventDefault()}>
   <label htmlFor="glossary-search">Find a finance term</label>
   <div><input id="glossary-search" type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search APR, 401(k), inflation…" aria-describedby="glossary-search-status"/>
    {query&&<button type="button" onClick={()=>{setQuery('');document.getElementById('glossary-search')?.focus();}}>Clear search</button>}</div>
   <p id="glossary-search-status" role="status">{query?`${filtered.length} of ${terms.length} terms match your search.`:`${terms.length} terms, grouped by topic and sorted alphabetically.`}</p>
  </form>
  {groups.length>0?<>
   <nav className="glossary-topics" aria-label="Glossary topics">{groups.map(group=><SiteLink key={group.category} href={'#'+topicId(group.category)}>{group.category} <span>({group.terms.length})</span></SiteLink>)}</nav>
   {groups.map(group=><section className="glossary-group" key={group.category} aria-labelledby={topicId(group.category)}>
    <h2 id={topicId(group.category)}>{group.category}</h2><div className="glossary-grid">{group.terms.map(term=><article key={term.slug}>
     <h3><SiteLink href={'/glossary/'+term.slug+'/'}>{term.name}</SiteLink></h3><p>{term.definition}</p>
     <SiteLink className="glossary-read" href={'/glossary/'+term.slug+'/'}>Read {term.name} definition <span aria-hidden="true">→</span></SiteLink>
    </article>)}</div>
   </section>)}
  </>:<p className="glossary-no-results">No matching term. Try an abbreviation, a full name or a shorter search.</p>}
 </>;
}
