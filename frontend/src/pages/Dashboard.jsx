import { useEffect, useMemo, useState } from "react";
import {
Activity,
ArrowUpRight,
BarChart3,
Building2,
CalendarClock,
CheckCircle2,
Clock3,
LayoutDashboard,
RefreshCw,
Target,
TrendingUp,
Users,
} from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";
import dashboardService from "../services/dashboardService";

import StatCard from "../components/dashboard/StatCard";
import LeadPipeline from "../components/dashboard/LeadPipeline";
import PropertyAvailability from "../components/dashboard/PropertyAvailability";
import FollowUpSummary from "../components/dashboard/FollowUpSummary";

export default function Dashboard() {
const { user } = useAuth();

const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);

/* ========================================================= */
/* TIME-BASED GREETING */
/* ========================================================= */

const getGreeting = () => {
const hour = new Date().getHours();


if (hour >= 5 && hour < 12) {
  return "Good morning";
}

if (hour >= 12 && hour < 17) {
  return "Good afternoon";
}

if (hour >= 17 && hour < 21) {
  return "Good evening";
}

return "Good night";


};

const loadDashboard = async (showRefresh = false) => {
try {
if (showRefresh) {
setRefreshing(true);
} else {
setLoading(true);
}


  const result = await dashboardService.getDashboard();
  setData(result);
} catch (error) {
  toast.error(
    error.response?.data?.detail ||
      "Unable to load dashboard data."
  );
} finally {
  setLoading(false);
  setRefreshing(false);
}


};

useEffect(() => {
loadDashboard();
}, []);

const conversionRate = useMemo(() => {
if (!data?.total_leads) return 0;


return Math.round(
  ((data.booked_leads || 0) / data.total_leads) * 100
);


}, [data]);

const availabilityRate = useMemo(() => {
const totalUnits =
(data?.available_units || 0) +
(data?.booked_units || 0);


if (!totalUnits) return 0;

return Math.round(
  ((data?.available_units || 0) / totalUnits) * 100
);


}, [data]);

if (loading) {
return <DashboardSkeleton />;
}

if (!data) {
return ( <div className="page-container"> <div className="card flex min-h-[420px] items-center justify-center"> <div className="max-w-sm px-6 text-center"> <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50"> <Activity className="h-7 w-7 text-red-500" /> </div>


        <h2 className="mt-5 text-lg font-bold text-slate-900">
          Dashboard unavailable
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          We couldn't retrieve your CRM overview. Please try
          again.
        </p>

        <button
          type="button"
          onClick={() => loadDashboard()}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    </div>
  </div>
);


}

return ( <div className="page-container">
{/* -------------------------------------------------- */}
{/* HEADER */}
{/* -------------------------------------------------- */}


  <section className="mb-7">
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700">
          <LayoutDashboard className="h-3.5 w-3.5" />
          CRM Overview
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          {getGreeting()},{" "}
          {user?.name?.split(" ")[0] || "there"}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Monitor your sales pipeline, follow-ups, bookings,
          and property inventory from one place.
        </p>
      </div>

      <button
        type="button"
        onClick={() => loadDashboard(true)}
        disabled={refreshing}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCw
          className={`h-4 w-4 ${
            refreshing ? "animate-spin" : ""
          }`}
        />
        {refreshing ? "Refreshing..." : "Refresh"}
      </button>
    </div>
  </section>

  {/* -------------------------------------------------- */}
  {/* KPI CARDS */}
  {/* -------------------------------------------------- */}

  <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <StatCard
      title="Total Leads"
      value={data.total_leads}
      icon="users"
      description="Active sales pipeline"
    />

    <StatCard
      title="Today's Follow-ups"
      value={data.today_followups}
      icon="followups"
      description={
        data.upcoming_followups > 0
          ? `${data.upcoming_followups} upcoming`
          : "No upcoming follow-ups"
      }
    />

    <StatCard
      title="Total Bookings"
      value={data.total_bookings}
      icon="bookings"
      description={`${data.booked_leads || 0} leads converted`}
    />

    <StatCard
      title="Available Units"
      value={data.available_units}
      icon="properties"
      description={`${data.booked_units} units currently booked`}
    />
  </section>

  {/* -------------------------------------------------- */}
  {/* BUSINESS INSIGHTS */}
  {/* -------------------------------------------------- */}

  <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <InsightCard
      icon={Target}
      label="Lead Conversion"
      value={`${conversionRate}%`}
      description="Leads converted to bookings"
    />

    <InsightCard
      icon={Building2}
      label="Unit Availability"
      value={`${availabilityRate}%`}
      description="Current inventory available"
    />

    <InsightCard
      icon={CalendarClock}
      label="Upcoming Follow-ups"
      value={data.upcoming_followups}
      description="Follow-ups scheduled ahead"
    />

    <InsightCard
      icon={TrendingUp}
      label="Negotiations"
      value={data.negotiation_leads}
      description="Active opportunities"
    />
  </section>

  {/* -------------------------------------------------- */}
  {/* MAIN ANALYTICS */}
  {/* -------------------------------------------------- */}

  <section className="mt-6 grid gap-6 xl:grid-cols-3">
    <div className="min-w-0 xl:col-span-2">
      <LeadPipeline data={data} />
    </div>

    <div className="min-w-0">
      <PropertyAvailability data={data} />
    </div>
  </section>

  {/* -------------------------------------------------- */}
  {/* FOLLOW UPS + SALES SNAPSHOT */}
  {/* -------------------------------------------------- */}

  <section className="mt-6 grid gap-6 lg:grid-cols-2">
    <FollowUpSummary data={data} />

    <div className="card overflow-hidden">
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50">
                <BarChart3 className="h-4.5 w-4.5 text-primary-600" />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Sales Snapshot
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Current CRM activity
                </p>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 sm:flex">
            <ArrowUpRight className="h-3.5 w-3.5" />
            Live
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-slate-100 sm:grid-cols-3">
        <SnapshotItem
          label="Projects"
          value={data.total_projects}
          icon={Building2}
        />

        <SnapshotItem
          label="New Leads"
          value={data.new_leads}
          icon={Users}
        />

        <SnapshotItem
          label="Site Visits"
          value={data.site_visits}
          icon={CalendarClock}
        />

        <SnapshotItem
          label="Interested"
          value={data.interested_leads}
          icon={Target}
        />

        <SnapshotItem
          label="Negotiations"
          value={data.negotiation_leads}
          icon={Clock3}
        />

        <SnapshotItem
          label="Lost"
          value={data.lost_leads}
          icon={Activity}
        />
      </div>

      <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500">
              Booked leads
            </p>

            <p className="mt-1 text-lg font-bold text-slate-900">
              {data.booked_leads}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Conversion {conversionRate}%
          </div>
        </div>
      </div>
    </div>
  </section>
</div>


);
}

/* ========================================================= */
/* INSIGHT CARD */
/* ========================================================= */

function InsightCard({
icon: Icon,
label,
value,
description,
}) {
return ( <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"> <div className="flex items-start justify-between gap-4"> <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 transition group-hover:bg-primary-50"> <Icon className="h-5 w-5 text-slate-500 transition group-hover:text-primary-600" /> </div>


    <Activity className="h-4 w-4 text-slate-300" />
  </div>

  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
    {label}
  </p>

  <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
    {value}
  </p>

  <p className="mt-1 text-xs text-slate-500">
    {description}
  </p>
</div>

);
}

/* ========================================================= */
/* SNAPSHOT ITEM */
/* ========================================================= */

function SnapshotItem({
label,
value,
icon: Icon,
}) {
return ( <div className="group bg-white p-4 transition hover:bg-slate-50 sm:p-5"> <div className="flex items-center justify-between gap-3"> <p className="text-xs font-semibold text-slate-400">
{label} </p>


    <Icon className="h-4 w-4 text-slate-300 transition group-hover:text-primary-500" />
  </div>

  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
    {value}
  </p>
</div>


);
}

/* ========================================================= */
/* LOADING SKELETON */
/* ========================================================= */

function DashboardSkeleton() {
return ( <div className="page-container"> <div className="animate-pulse space-y-6">
{/* Header */} <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"> <div> <div className="h-7 w-28 rounded-full bg-slate-200" /> <div className="mt-4 h-9 w-72 rounded-lg bg-slate-200" /> <div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-200" /> </div>

      <div className="h-11 w-28 rounded-xl bg-slate-200" />
    </div>

    {/* KPI */}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-36 rounded-2xl bg-white shadow-sm"
        />
      ))}
    </div>

    {/* Insights */}
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-32 rounded-2xl bg-white shadow-sm"
        />
      ))}
    </div>

    {/* Charts */}
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="h-[420px] rounded-2xl bg-white shadow-sm xl:col-span-2" />
      <div className="h-[420px] rounded-2xl bg-white shadow-sm" />
    </div>

    {/* Bottom */}
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="h-80 rounded-2xl bg-white shadow-sm" />
      <div className="h-80 rounded-2xl bg-white shadow-sm" />
    </div>
  </div>
</div>


);
}
