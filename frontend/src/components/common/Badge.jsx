const stageStyles = {
  NEW: "bg-blue-50 text-blue-700 ring-blue-600/10",
  CONTACTED: "bg-cyan-50 text-cyan-700 ring-cyan-600/10",
  SITE_VISIT: "bg-violet-50 text-violet-700 ring-violet-600/10",
  INTERESTED: "bg-amber-50 text-amber-700 ring-amber-600/10",
  NEGOTIATION: "bg-orange-50 text-orange-700 ring-orange-600/10",
  BOOKED: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  LOST: "bg-red-50 text-red-700 ring-red-600/10",
};

const statusStyles = {
  AVAILABLE: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  BOOKED: "bg-blue-50 text-blue-700 ring-blue-600/10",
  CONFIRMED: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  CANCELLED: "bg-red-50 text-red-700 ring-red-600/10",
};

const labels = {
  NEW: "New",
  CONTACTED: "Contacted",
  SITE_VISIT: "Site Visit",
  INTERESTED: "Interested",
  NEGOTIATION: "Negotiation",
  BOOKED: "Booked",
  LOST: "Lost",
  AVAILABLE: "Available",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
};

export default function Badge({ value, type = "stage" }) {
  const styles =
    type === "status"
      ? statusStyles[value]
      : stageStyles[value];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        styles || "bg-slate-50 text-slate-600 ring-slate-600/10"
      }`}
    >
      {labels[value] || value}
    </span>
  );
}