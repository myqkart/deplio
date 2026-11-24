type StatsRowProps = {
  applications: number;
  branches: number;
  triggers24h: number;
  failed24h: number;
};

export function StatsRow({
  applications,
  branches,
  triggers24h,
  failed24h,
}: StatsRowProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard label="Applications" value={applications} />
      <StatCard label="Branches" value={branches} />
      <StatCard label="Triggers (24h)" value={triggers24h} />
      <StatCard
        label="Failed (24h)"
        value={failed24h}
        danger={failed24h > 0}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  danger,
}: {
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div className="rounded-[6px] border border-border bg-canvas-subtle p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`mt-1 text-2xl leading-[30px] font-semibold tabular-nums ${
          danger ? "text-danger-foreground" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
