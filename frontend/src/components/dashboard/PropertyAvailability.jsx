import { Home, Layers3 } from "lucide-react";

export default function PropertyAvailability({ data }) {
  const available = data.available_units || 0;
  const booked = data.booked_units || 0;
  const total = available + booked;

  const availablePercentage = total
    ? Math.round((available / total) * 100)
    : 0;

  return (
    <div className="card p-6">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-slate-900">
          Property Availability
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Current unit inventory overview.
        </p>
      </div>

      <div className="flex items-center justify-center">
        <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-[14px] border-slate-100">
          <div
            className="absolute inset-[-14px] rounded-full border-[14px] border-transparent border-t-emerald-500 border-r-emerald-500"
            style={{
              transform: `rotate(${availablePercentage * 1.8 - 45}deg)`,
            }}
          />

          <div className="text-center">
            <p className="text-3xl font-bold text-slate-900">
              {available}
            </p>

            <p className="text-xs text-slate-400">
              Available
            </p>
          </div>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-emerald-50 p-4">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700">
              Available
            </span>
          </div>

          <p className="mt-2 text-xl font-bold text-emerald-800">
            {available}
          </p>
        </div>

        <div className="rounded-xl bg-slate-100 p-4">
          <div className="flex items-center gap-2">
            <Layers3 className="h-4 w-4 text-slate-600" />
            <span className="text-xs font-medium text-slate-600">
              Booked
            </span>
          </div>

          <p className="mt-2 text-xl font-bold text-slate-800">
            {booked}
          </p>
        </div>
      </div>
    </div>
  );
}