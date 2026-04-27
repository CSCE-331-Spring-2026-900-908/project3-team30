import { currency } from '../utils/format';

export default function DashboardChartCard({ title, data, valueKey, labelFormatter = (label) => label }) {
  const max = Math.max(...data.map((row) => Number(row[valueKey] || 0)), 1);

  return (
    <article className="card dashboard-chart-card">
      <div className="dashboard-card-heading">
        <h2>{title}</h2>
      </div>

      {data.length === 0 ? (
        <p className="subtle">No data available yet.</p>
      ) : (
        <div className="mini-chart" aria-label={title}>
          {data.map((row) => {
            const value = Number(row[valueKey] || 0);
            return (
              <div className="mini-chart-row" key={`${row.label}-${valueKey}`}>
                <span className="mini-chart-label">{labelFormatter(row.label)}</span>
                <div className="mini-chart-track">
                  <div className="mini-chart-bar" style={{ width: `${Math.max((value / max) * 100, 4)}%` }} />
                </div>
                <strong className="mini-chart-value">
                  {valueKey.toLowerCase().includes('revenue') ? currency(value) : value}
                </strong>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}
