"use client";
import {useRef,useState,type ComponentType} from 'react';
export default function FavoritesMenu(){
 const menu=useRef<HTMLDetailsElement>(null);
 const [open,setOpen]=useState(false),[List,setList]=useState<ComponentType|null>(null),[error,setError]=useState('');
 async function toggle(){
  const next=Boolean(menu.current?.open);setOpen(next);
  if(next&&!List){setError('');try{const module=await import('./FavoritesList');setList(()=>module.default);}catch{setError('Favorites could not load. Close and reopen to try again.');}}
 }
 return <details className="favorites-menu theme-tools" ref={menu} onToggle={toggle} onClick={event=>{
  if(event.target instanceof Element&&event.target.closest('a[href]')){if(menu.current)menu.current.open=false;const mobile=menu.current?.closest<HTMLDetailsElement>('.mobile-menu');if(mobile)mobile.open=false;}
 }}><summary>Favorites</summary><div className="favorites-panel">{open&&(List?<List/>:<p role="status">{error||'Loading favorites…'}</p>)}</div></details>;
}
