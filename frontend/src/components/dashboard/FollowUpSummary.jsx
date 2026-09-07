import { CalendarCheck, CalendarDays } from "lucide-react";

export default function FollowUpSummary({ data }) {
  return (
    <div className="card p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-900">
          Follow-ups
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Stay on top of your sales activities.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
              <CalendarCheck className="h-5 w-5 text-primary-600" />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">
                Today
              </p>

              <p className="text-xs text-slate-400">
                Follow-ups scheduled
              </p>
            </div>
          </div>

          <span className="text-2xl font-bold text-slate-900">
            {data.today_followups || 0}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
              <CalendarDays className="h-5 w-5 text-violet-600" />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">
                Next 7 days
              </p>

              <p className="text-xs text-slate-400">
                Upcoming follow-ups
              </p>
            </div>
          </div>

          <span className="text-2xl font-bold text-slate-900">
            {data.upcoming_followups || 0}
          </span>
        </div>
      </div>
    </div>
  );
}