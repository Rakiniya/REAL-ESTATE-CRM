const stages = [
  {
    key: "new_leads",
    label: "New",
    color: "bg-blue-500",
  },
  {
    key: "contacted_leads",
    label: "Contacted",
    color: "bg-cyan-500",
  },
  {
    key: "site_visits",
    label: "Site Visit",
    color: "bg-violet-500",
  },
  {
    key: "interested_leads",
    label: "Interested",
    color: "bg-amber-500",
  },
  {
    key: "negotiation_leads",
    label: "Negotiation",
    color: "bg-orange-500",
  },
  {
    key: "booked_leads",
    label: "Booked",
    color: "bg-emerald-500",
  },
  {
    key: "lost_leads",
    label: "Lost",
    color: "bg-red-500",
  },
];

export default function LeadPipeline({ data }) {
  const total = data.total_leads || 0;

  return (
    <div className="card p-6">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-slate-900">
          Lead Pipeline
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Current distribution of leads across sales stages.
        </p>
      </div>

      {total === 0 ? (
        <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
          <div className="text-center">
            <p className="font-medium text-slate-700">No leads yet</p>
            <p className="mt-1 text-sm text-slate-400">
              Create your first lead to populate the pipeline.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {stages.map((stage) => {
            const count = data[stage.key] || 0;
            const percentage = total
              ? Math.round((count / total) * 100)
              : 0;

            return (
              <div key={stage.key}>
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${stage.color}`}
                    />

                    <span className="text-sm font-medium text-slate-700">
                      {stage.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {count}
                    </span>

                    <span className="text-xs text-slate-400">
                      {percentage}%
                    </span>
                  </div>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${stage.color}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}