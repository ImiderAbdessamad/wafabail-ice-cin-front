import type { SummaryRow } from '../../data/confirmation'

interface Props {
  title: string
  rows: SummaryRow[]
}

export function SummaryColumn({ title, rows }: Props) {
  return (
    <div className="recap__col">
      <h3 className="recap__col-title">{title}</h3>
      <dl className="recap__list">
        {rows.map((row) => (
          <div key={row.label} className="recap__row">
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
