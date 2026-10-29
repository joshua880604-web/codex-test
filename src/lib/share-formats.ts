import {navigationHref} from './navigation';
import type {Result} from './types';
export type CitationFormat='plain'|'html'|'bibtex';
export function canonicalCitationURL(path:string){const url=new URL(navigationHref(path).split(/[?#]/)[0],'https://www.calculatorfree.io');if(url.origin!=='https://www.calculatorfree.io'||url.username||url.password)throw new Error('Citations must use this site’s canonical calculator address.');return url.href;}
const html=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const bib=(s:string)=>s.replace(/[\\{}%&#_$~^]/g,c=>({ '\\':'\\textbackslash{}','~':'\\textasciitilde{}','^':'\\textasciicircum{}'}[c]??'\\'+c));
export function citationText(id:string,title:string,path:string,accessed:string,format:CitationFormat){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(accessed)||!Number.isFinite(Date.parse(accessed))||new Date(accessed+'T00:00:00Z').toISOString().slice(0,10)!==accessed)throw new Error('Use a valid citation access date.');
 const url=canonicalCitationURL(path);
 if(format==='plain')return `${title}. CalculatorFree.io. ${url}. Accessed ${accessed}.`;
 if(format==='html')return `<a href="${html(url)}">${html(title)} by CalculatorFree.io</a> (accessed ${accessed}).`;
 return `@online{calculatorfree_${id.replace(/[^a-z0-9]/gi,'_')},\n  author = {{CalculatorFree.io}},\n  title = {${bib(title)}},\n  url = {${url}},\n  urldate = {${accessed}}\n}`;
}
export function socialShareURL(site:'facebook'|'x'|'linkedin',url:string,title:string){
 if(site==='facebook')return 'https://www.facebook.com/sharer/sharer.php?'+new URLSearchParams({u:url});
 if(site==='x')return 'https://twitter.com/intent/tweet?'+new URLSearchParams({text:title,url});
 return 'https://www.linkedin.com/sharing/share-offsite/?'+new URLSearchParams({url});
}
export type ExportTable={key:string;title:string;columns:string[];rows:(string|number)[][];note?:string};
export function resultTables(result:Result):ExportTable[]{
 const tables:ExportTable[]=[];
 if(result.columns&&result.rows)tables.push({key:'main',title:'Calculation details',columns:result.columns,rows:result.rows});
 if(result.annualColumns&&result.annualRows)tables.push({key:'annual',title:'Annual calculation details',columns:result.annualColumns,rows:result.annualRows});
 result.additionalTables?.forEach((t,i)=>tables.push({...t,key:'extra-'+i}));
 return tables;
}
// Numeric negative results remain numbers; text that can be evaluated as a spreadsheet formula is escaped.
export function spreadsheetCell(value:string|number){return typeof value==='number'?String(value):(/^[\s\u0000-\u001f]*[=+@-]/.test(value)?"'"+value:value);}
export function tableText(table:ExportTable,kind:'csv'|'tsv'){
 return [table.columns,...table.rows].map(row=>row.map(value=>{const s=spreadsheetCell(value);return kind==='csv'||/[\t\r\n"]/.test(s)?'"'+s.replaceAll('"','""')+'"':s;}).join(kind==='csv'?',':'\t')).join('\r\n');
}
