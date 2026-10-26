"use client";
import {useEffect,useRef} from 'react';
import {categoryNavigation} from '@/lib/calculator-categories';
const links=[['All calculators','/financial-calculator.html'],['Find a calculator','/financial-calculator.html#directory-search'],...categoryNavigation.map(link=>[link.title,link.href]),['Financial glossary','/glossary/'],['Methodology & sources','/methodology.html']];
export default function MobileNavigation(){
 const menu=useRef<HTMLDetailsElement>(null),trigger=useRef<HTMLElement>(null);
 useEffect(()=>{
  const close=(e:PointerEvent)=>{if(menu.current?.open&&e.target instanceof Node&&!menu.current.contains(e.target))menu.current.open=false;};
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'&&menu.current?.open){menu.current.open=false;trigger.current?.focus();}};
  const media=matchMedia('(min-width:701px)'),resize=()=>{if(media.matches&&menu.current)menu.current.open=false;};
  document.addEventListener('pointerdown',close);document.addEventListener('keydown',escape);media.addEventListener('change',resize);
  return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',escape);media.removeEventListener('change',resize);};
 },[]);
 return <details className="mobile-menu" ref={menu}>
  <summary ref={trigger} aria-controls="mobile-navigation">Menu <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M2 4h12M2 8h12M2 12h12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></summary>
  <nav id="mobile-navigation" aria-label="Mobile navigation">{links.map(([label,href])=><a key={href} href={href} onClick={()=>{if(menu.current)menu.current.open=false;}}>{label}</a>)}</nav>
 </details>;
}
