import './decision-guide.css';
import cases from '@/lib/decision-guide-cases.json';
import {calculatorPresetHref} from '@/lib/preset-links';
import SiteLink from './SiteLink';
export type CaseTopic='mortgage'|'drip'|'roth'|'cap';
const targets={mortgage:['/pay-off-mortgage-vs-invest-calculator','compare'],drip:['/drip-calculator','projection'],roth:['/roth-conversion-ladder-calculator','bridge'],cap:['/cash-on-cash-return-calculator','property']} as const;
const columns:Record<CaseTopic,[string,string][]>= {
 mortgage:[['Paydown-first investments minus mortgage','Paydown-first position'],['Invest-first investments minus mortgage','Invest-first position'],['Invest-first advantage at horizon','Invest-first advantage']],
 drip:[['Ending portfolio with DRIP','DRIP wealth'],['Ending wealth without reinvestment (shares + cash)','Shares + retained cash'],['DRIP minus cash-dividend wealth','DRIP difference']],
 roth:[['Bridge cash required for this modeled path','Outside cash required'],['Additional bridge cash needed','Additional cash needed'],['Ending bridge cash','Ending outside cash']],
 cap:[['Cash invested','Initial cash'],['First-year principal and interest paid','Year-one P&I'],['Annual cash flow used','Annual cash flow'],['Cash-on-cash return','Cash-on-cash'],['Cap rate at purchase price','Cap rate']],
};
export default function DecisionCaseTable({topic}:{topic:CaseTopic}){
 const [path,mode]=targets[topic];return <div className="guide-table decision-case-table" role="region" aria-label="Reproducible scenario results" tabIndex={0}><table><caption>Hypothetical model scenarios · amounts in USD, before any unmodeled taxes. Scroll horizontally on smaller screens.</caption><thead><tr><th scope="col">Scenario</th>{columns[topic].map(([key,label])=><th scope="col" key={key}>{label}</th>)}<th scope="col">Inputs</th></tr></thead><tbody>{cases[topic].map(row=><tr key={row.label}><th scope="row">{row.label}</th>{columns[topic].map(([key])=>{const value=(row.metrics as Record<string,number>)[key];return <td key={key}>{key.includes('return')||key==='Cap rate at purchase price'?value.toFixed(2)+'%':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Math.abs(value)<.005?0:value)}</td>;})}<td><SiteLink href={calculatorPresetHref(path,mode,row.values)}>Open this case →</SiteLink></td></tr>)}</tbody></table></div>;
}
