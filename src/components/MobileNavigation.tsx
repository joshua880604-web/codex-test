"use client";
import {usePathname} from "next/navigation";
import {shareToolPaths,shareOpenEvent,hasEmbed} from "@/lib/share-tools";
import ThemeChoices from "./ThemeChoices";
import FavoritesMenu from "./FavoritesMenu";
import SiteLink from "@/components/SiteLink";

import {useEffect,useRef,useState} from 'react';
import {categoryNavigation} from '@/lib/calculator-categories';
const links=[['All calculators','/financial-calculator.html'],['Find a calculator','/financial-calculator.html#directory-search'],...categoryNavigation.map(link=>[link.title,link.href]),['Financial glossary','/glossary/'],['Financial guides','/guides/'],['Methodology & sources','/methodology.html']];
export default function MobileNavigation(){
 const pathname=usePathname();
 const [shareId,setShareId]=useState<string>();
 useEffect(()=>{setShareId(shareToolPaths[window.location.pathname.replace(/\/$/, "").replace(/\.html$/, "")]);},[pathname]);
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
  <nav id="mobile-navigation" aria-label="Mobile navigation"><FavoritesMenu/>{shareId&&<button type="button" className="mobile-share-entry" aria-haspopup="dialog" onClick={()=>{if(menu.current)menu.current.open=false;trigger.current?.focus();window.dispatchEvent(new CustomEvent(shareOpenEvent,{detail:{id:shareId}}));}}>{hasEmbed(shareId)?"Share / Embed / Cite":"Share / Cite / Export"}</button>}{links.map(([label,href])=><SiteLink key={href} href={href} onClick={()=>{if(menu.current)menu.current.open=false;}}>{label}</SiteLink>)}<section className="mobile-theme theme-tools" aria-label="Appearance"><strong>Appearance</strong><ThemeChoices/><small>Saved in this browser.</small></section></nav>
 </details>;
}
