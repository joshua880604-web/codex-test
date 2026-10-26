import type { Result } from '@/lib/types';
type Table = NonNullable<Result['additionalTables']>[number];

export default function RecastComparison({ table, onDownload }: { table: Table; onDownload: () => void }) {
  return <section className="workspace-report recast-comparison" aria-label="Three repayment choices">
    <h2>{table.title}</h2>
    <p>{table.note}</p>
    <div className="result-actions"><button type="button" onClick={onDownload}>Download comparison CSV</button></div>
    <p className="result-note">Scroll the table horizontally to see fees and total future cash. All amounts are in USD.</p>
    <div className="table-scroll" role="region" aria-label="Three repayment choices table" tabIndex={0}>
      <table>
        <thead><tr>{table.columns.map(column => <th scope="col" key={column}>{column}</th>)}</tr></thead>
        <tbody>{table.rows.map((row, index) => <tr key={index}>
          <th scope="row">{row[0]}</th>
          {row.slice(1).map((value, i) => <td key={i}>{typeof value === 'number' ? value.toLocaleString('en-US', {minimumFractionDigits:i===1?0:2, maximumFractionDigits:i===1?0:2}) : value}</td>)}
        </tr>)}</tbody>
      </table>
    </div>
  </section>;
}
