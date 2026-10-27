// Only calculator identifiers are stored. No input values or results.
export const FAVORITES_KEY='calculatorfree.favorites.v1';
export const FAVORITES_EVENT='calculatorfree:favorites-change';
type Store=Pick<Storage,'getItem'|'setItem'>;
const validId=(id:unknown):id is string=>typeof id==='string'&&/^[a-z0-9][a-z0-9-]{0,79}$/.test(id);
export function readFavorites(store:Store):string[]{
 const raw=store.getItem(FAVORITES_KEY);if(raw===null)return [];
 if(raw.length>10000)throw Error('Favorites could not be read. They have not been overwritten.');
 let data:unknown;try{data=JSON.parse(raw);}catch{throw Error('Favorites could not be read. They have not been overwritten.');}
 if(!Array.isArray(data)||data.length>100||!data.every(validId))throw Error('Favorites could not be read. They have not been overwritten.');
 return [...new Set(data)];
}
export function toggleFavorite(store:Store,id:string){
 if(!validId(id))throw Error('This calculator cannot be added to favorites.');
 const ids=readFavorites(store),has=ids.includes(id),next=has?ids.filter(x=>x!==id):[...ids,id];
 if(next.length>100)throw Error('Your favorites list is full. Remove an item first.');
 store.setItem(FAVORITES_KEY,JSON.stringify(next));return !has;
}
export function favoriteError(error:unknown){
 return error instanceof Error&&!['SecurityError','QuotaExceededError'].includes(error.name)?error.message:'Favorites are unavailable. Browser storage may be blocked or full.';
}
