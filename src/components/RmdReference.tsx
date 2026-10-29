import rules from '@/lib/official-rules.json';
import SiteLink from './SiteLink';
export default function RmdReference(){
 const factors:Record<string,number>=rules.rmd_uniform_lifetime.divisors;
 return <section aria-labelledby="rmd-table-heading">
  <h2 id="rmd-table-heading">RMD table: IRS Uniform Lifetime factors and percentages</h2>
  <p>For a supported owner account, divide the previous December 31 balance by the factor for your age at year-end. These Table III factors took effect in 2022; they are not a new table issued for each calendar year. Use Table II instead when a sole-beneficiary spouse is more than 10 years younger.</p>
  <div className="table-scroll" role="region" tabIndex={0} aria-label="IRS Uniform Lifetime RMD factor reference">
   <table><thead><tr><th scope="col">Age at year-end</th><th scope="col">Table III factor</th><th scope="col">Balance percentage (100 ÷ factor)</th></tr></thead>
    <tbody>{Array.from({length:24},(_,i)=>i+72).map(age=><tr key={age}><th scope="row">{age}</th><td>{factors[String(age)].toFixed(1)}</td><td>{(100/factors[String(age)]).toFixed(4)}%</td></tr>)}</tbody>
   </table>
  </div>
  <p>For example, an owner who turns 73 in 2026 uses the eligible December 31, 2025 balance. With $265,000 and factor 26.5, the gross RMD is $10,000, or about 3.7736% of that balance. A table row does not establish eligibility or a withdrawal deadline.</p>
  <p>Under current owner age rules, people born in 1951–1958 generally start at 73, while those born in 1960 or later start at 75. For 1959 births, this tool uses age 73 as a planning assumption; confirm the applicable IRS guidance before relying on that start age. Account-specific exceptions and historical starting rules need separate review.</p>
  <p><SiteLink href="https://www.irs.gov/publications/p590b">IRS Publication 590-B, Appendix B, Table III</SiteLink></p>
 </section>;
}
