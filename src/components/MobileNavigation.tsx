"use client";
import {useEffect,useRef} from 'react';
const links=[['All calculators','/financial-calculator.html'],['Find a calculator','/financial-calculator.html#directory-search'],['Mortgage & Housing','/financial-calculator.html#mortgage-housing'],['Loans & Debt','/financial-calculator.html#loans-debt'],['Saving & Investing','/financial-calculator.html#saving-investing'],['Retirement','/financial-calculator.html#retirement'],['Tax & Salary','/financial-calculator.html#tax-salary'],['Everyday tools','/financial-calculator.html#everyday'],['Financial glossary','/glossary/']];
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
  <summary ref={trigger} aria-controls="mobile-navigation">Menu <span aria-hidden="true">☰</span></summary>
  <nav id="mobile-navigation" aria-label="Mobile navigation">{links.map(([label,href])=><a key={href} href={href} onClick={()=>{if(menu.current)menu.current.open=false;}}>{label}</a>)}</nav>
 </details>;
}
