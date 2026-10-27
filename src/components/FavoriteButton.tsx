"use client";
import {useEffect,useState} from 'react';
import {readFavorites,toggleFavorite,favoriteError,FAVORITES_KEY,FAVORITES_EVENT} from '@/lib/favorites';
export default function FavoriteButton({id}:{id:string}){
 const [favorite,setFavorite]=useState(false),[status,setStatus]=useState(''),[error,setError]=useState('');
 useEffect(()=>{
  const refresh=()=>{try{setFavorite(readFavorites(localStorage).includes(id));}catch{/* Surface storage errors when the user takes an action. */}};
  const storage=(e:StorageEvent)=>{if(e.key===FAVORITES_KEY||e.key===null)refresh();};refresh();window.addEventListener('storage',storage);window.addEventListener(FAVORITES_EVENT,refresh);
  return()=>{window.removeEventListener('storage',storage);window.removeEventListener(FAVORITES_EVENT,refresh);};
 },[id]);
 function toggle(){try{const next=toggleFavorite(localStorage,id);setFavorite(next);setError('');setStatus(next?'Added to Favorites.':'Removed from Favorites.');window.dispatchEvent(new Event(FAVORITES_EVENT));}catch(error){setError(favoriteError(error));}}
 return <div className="favorite-tools"><button type="button" className="favorite-button" aria-pressed={favorite} aria-label={favorite?'Remove calculator from favorites':'Add calculator to favorites'} title={favorite?'Remove from favorites':'Add to favorites'} onClick={toggle}><svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.3.9-4.6 4.4 1.1 6.3L12 17.4l-5.6 2.9 1.1-6.3-4.6-4.4 6.3-.9Z" fill={favorite?'currentColor':'none'} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg></button><span className="sr-only" role="status">{status}</span>{error&&<p className="favorite-error" role="alert">{error}</p>}</div>;
}
