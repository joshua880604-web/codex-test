export type StockLotDraft={shares:string;price:string;fee:string};
export const stockLotsDefault=JSON.stringify([{shares:'100',price:'50',fee:'5'},{shares:'50',price:'40',fee:'5'}]);
// Draft parsing preserves empty controls; numeric validation happens only on Calculate.
export function stockLotDrafts(raw:string):StockLotDraft[]{
 if(typeof raw!=='string'||raw.length>20000)throw Error('Enter up to 30 stock purchases.');
 let rows:unknown;try{rows=JSON.parse(raw);}catch{throw Error('The saved stock purchases could not be read.');}
 if(!Array.isArray(rows)||rows.length<1||rows.length>30)throw Error('Enter between 1 and 30 purchases.');
 return rows.map((row:unknown)=>{
  if(!row||typeof row!=='object'||Array.isArray(row))throw Error('Each purchase needs shares, price and a fee.');
  const r=row as Record<string,unknown>,draft={} as StockLotDraft;
  for(const key of ['shares','price','fee'] as const){if(typeof r[key]!=='string'&&typeof r[key]!=='number')throw Error('Each purchase needs shares, price and a fee.');draft[key]=String(r[key]);}
  return draft;
 });
}
