"use client";
import {useEffect,useState} from 'react';
import SiteLink from './SiteLink';
import {calculators,routeFor} from '@/lib/catalog';
import {readFavorites,toggleFavorite,favoriteError,FAVORITES_KEY,FAVORITES_EVENT} from '@/lib/favorites';
const tool=(id:string)=>calculators.find(c=>c.id===id&&c.id!=='real-estate');
export default function FavoritesList(){
 const [favorites,setFavorites]=useState<string[]>([]),[status,setStatus]=useState('');
 function refresh(){try{setFavorites(readFavorites(localStorage));}catch(error){setStatus(favoriteError(error));}}
 useEffect(()=>{const storage=(e:StorageEvent)=>{if(e.key===null||e.key===FAVORITES_KEY)refresh();};refresh();window.addEventListener(FAVORITES_EVENT,refresh);window.addEventListener('storage',storage);return()=>{window.removeEventListener(FAVORITES_EVENT,refresh);window.removeEventListener('storage',storage);};},[]);
 function remove(id:string){try{toggleFavorite(localStorage,id);window.dispatchEvent(new Event(FAVORITES_EVENT));setStatus('Removed from favorites.');requestAnimationFrame(()=>document.getElementById('favorites-heading')?.focus());}catch(error){setStatus(favoriteError(error));}}
 return <section className="favorites-list" aria-label="Favorite calculators"><h3 id="favorites-heading" tabIndex={-1}>Your favorites</h3><p>Saved in this browser. Clearing site data removes this list.</p>
 {favorites.some(id=>tool(id))?<ul>{favorites.map(id=>{const c=tool(id);return c?<li key={id}><SiteLink href={routeFor(id)}>{c.title}</SiteLink><button type="button" aria-label={'Remove '+c.title+' from favorites'} onClick={()=>remove(id)}>Remove</button></li>:null;})}</ul>:<p>No favorites yet. Use the star beside a calculator’s introduction.</p>}
 {status&&<p role="status">{status}</p>}</section>;
}
