import type {Field,Values} from './types';
const keys=['return','inflation','withdrawal'];
function sameRates(a:Values,b:Values){return keys.every(key=>String(a[key]??'').trim()!==''&&String(b[key]??'').trim()!==''&&Number.isFinite(Number(a[key]))&&Number(a[key])===Number(b[key]));}
export function coastAssumptionLabel(fields:Field[],values:Values,shared:Values|null=null){
 if(shared&&sameRates(values,shared))return 'Shared assumptions';
 const base=Object.fromEntries(fields.map(f=>[f.key,String(f.value)]));
 return sameRates(values,base)?'Using default assumptions':'Custom assumptions';
}
