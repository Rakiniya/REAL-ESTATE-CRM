import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  CalendarClock,
  ClipboardList,
  Home,
  Users,
} from "lucide-react";

const iconMap = {
  users: Users,
  followups: CalendarClock,
  bookings: ClipboardList,
  properties: Home,
  projects: Building2,
};

export default function StatCard({
  title,
  value,
  description,
  icon = "users",
  trend,
  trendLabel,
}) {
  const Icon = iconMap[icon] || Users;
  const isPositive = trend >= 0;

  return (
    <div className="card group p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs">
        {trend !== undefined && (
          <span
            className={`inline-flex items-center gap-1 font-semibold ${
              isPositive ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}

            {Math.abs(trend)}%
          </span>
        )}

        <span className="text-slate-400">
          {trendLabel || description}
        </span>
      </div>
    </div>
  );
}