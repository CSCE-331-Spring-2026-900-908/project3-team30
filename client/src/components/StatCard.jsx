export default function StatCard({ label, value }) {
  return (
    <div className="stat-card card">
      <p className="stat-label">{label}</p>
      <h3>{value}</h3>
    </div>
  );
}
