import {
  Bell,
  ChevronDown,
  Menu,
  Search,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

export default function Header({ onMenuClick }) {
  const { user } = useAuth();

  const getInitials = (name) => {
    if (!name) return "U";

    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <header
      className="
        sticky top-0 z-30 flex h-16 shrink-0
        items-center justify-between
        border-b border-slate-200/80
        bg-white/90 px-4
        backdrop-blur-xl
        sm:px-6
      "
    >
      {/* Left */}
      <div className="flex min-w-0 items-center gap-3">
        {/* Mobile menu */}
        <button
          type="button"
          onClick={onMenuClick}
          className="
            rounded-xl p-2 text-slate-500
            transition hover:bg-slate-100
            hover:text-slate-900 lg:hidden
          "
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search */}
        <div className="relative hidden sm:block">
          <Search
            className="
              pointer-events-none absolute left-3
              top-1/2 h-4 w-4
              -translate-y-1/2 text-slate-400
            "
          />

          <input
            placeholder="Search CRM..."
            className="
              h-10 w-64 rounded-xl
              border border-slate-200
              bg-slate-50
              pl-9 pr-12
              text-sm text-slate-700
              outline-none
              transition-all
              placeholder:text-slate-400
              hover:border-slate-300
              focus:border-primary-400
              focus:bg-white
              focus:ring-4
              focus:ring-primary-50
              lg:w-80
            "
          />

          <div
            className="
              pointer-events-none absolute right-2
              top-1/2 hidden -translate-y-1/2
              items-center rounded-md
              border border-slate-200
              bg-white px-1.5 py-0.5
              text-[10px] font-medium text-slate-400
              lg:flex
            "
          >
            /
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications */}
        <button
          type="button"
          className="
            relative rounded-xl p-2.5
            text-slate-500
            transition
            hover:bg-slate-100
            hover:text-slate-800
          "
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />

          <span
            className="
              absolute right-2 top-2
              h-2 w-2 rounded-full
              bg-red-500
              ring-2 ring-white
            "
          />
        </button>

        <div className="hidden h-7 w-px bg-slate-200 sm:block" />

        {/* User */}
        <button
          type="button"
          className="
            flex items-center gap-2
            rounded-xl p-1.5 pr-2
            transition
            hover:bg-slate-50
          "
        >
          <div
            className="
              flex h-8 w-8 items-center justify-center
              rounded-xl bg-primary-100
              text-xs font-bold text-primary-700
              ring-2 ring-white
            "
          >
            {getInitials(user?.name)}
          </div>

          <div className="hidden text-left sm:block">
            <p className="max-w-[140px] truncate text-sm font-semibold text-slate-800">
              {user?.name || "User"}
            </p>

            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              {user?.role === "ADMIN"
                ? "Administrator"
                : "Sales"}
            </p>
          </div>

          <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
        </button>
      </div>
    </header>
  );
}
