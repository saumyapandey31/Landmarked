export default function TravelStatisticsCard({ stats = [] }) {
  return (
    <div className="bg-card border border-line rounded-xl2 p-5 shadow-card h-full">
      <h3 className="font-display text-lg mb-4">Travel Statistics</h3>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-xl font-display text-accent-primary">{s.value}</p>
            <p className="text-[11px] text-muted mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
