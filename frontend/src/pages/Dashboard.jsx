import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
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

  if (loading) {
    return (
      <div className="page-container">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-64 rounded-lg bg-slate-200" />

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-36 rounded-xl bg-white shadow-card"
              />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="h-96 rounded-xl bg-white shadow-card xl:col-span-2" />
            <div className="h-96 rounded-xl bg-white shadow-card" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page-container">
        <div className="card flex min-h-72 items-center justify-center">
          <div className="text-center">
            <h2 className="font-semibold text-slate-800">
              Dashboard unavailable
            </h2>

            <button
              onClick={() => loadDashboard()}
              className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Page header */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-primary-600">
            Overview
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Good morning, {user?.name?.split(" ")[0] || "there"}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Here's what's happening with your sales pipeline today.
          </p>
        </div>

        <button
          onClick={() => loadDashboard(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              refreshing ? "animate-spin" : ""
            }`}
          />

          Refresh
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
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
          description="Scheduled for today"
        />

        <StatCard
          title="Total Bookings"
          value={data.total_bookings}
          icon="bookings"
          description="Confirmed bookings"
        />

        <StatCard
          title="Available Units"
          value={data.available_units}
          icon="properties"
          description={`${data.booked_units} units currently booked`}
        />
      </div>

      {/* Pipeline + availability */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <LeadPipeline data={data} />
        </div>

        <PropertyAvailability data={data} />
      </div>

      {/* Follow-ups + sales snapshot */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <FollowUpSummary data={data} />

        <div className="card p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-slate-900">
              Sales Snapshot
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Quick view of your current CRM activity.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <SnapshotItem
              label="Projects"
              value={data.total_projects}
            />

            <SnapshotItem
              label="New Leads"
              value={data.new_leads}
            />

            <SnapshotItem
              label="Site Visits"
              value={data.site_visits}
            />

            <SnapshotItem
              label="Interested"
              value={data.interested_leads}
            />

            <SnapshotItem
              label="Negotiations"
              value={data.negotiation_leads}
            />

            <SnapshotItem
              label="Lost"
              value={data.lost_leads}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SnapshotItem({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}