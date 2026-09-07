import {
  Building2,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export default function Sidebar({
  mobileOpen,
  onMobileClose,
  collapsed,
  onToggle,
}) {
  const { user, logout } = useAuth();

  const isAdmin = user?.role === "ADMIN";

  const navigation = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: Home,
    },
    {
      label: "Leads",
      path: "/leads",
      icon: Users,
    },
    {
      label: "Properties",
      path: "/properties",
      icon: Building2,
    },
    {
      label: "Bookings",
      path: "/bookings",
      icon: CalendarCheck,
    },
    ...(isAdmin
      ? [
          {
            label: "Employees",
            path: "/employees",
            icon: Users,
          },
        ]
      : []),
  ];

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

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[1px] lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          border-r border-slate-200/80 bg-white
          shadow-[4px_0_24px_rgba(15,23,42,0.04)]
          transition-all duration-300 ease-in-out
          lg:static lg:z-auto lg:shadow-none
          ${collapsed ? "lg:w-20" : "lg:w-64"}
          ${mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"}
          w-72
        `}
      >
        {/* Brand */}
        <div
          className={`
            flex h-16 shrink-0 items-center border-b border-slate-100
            px-4
            ${collapsed ? "lg:justify-center" : "justify-between"}
          `}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-600 shadow-sm shadow-primary-600/20">
              <Building2 className="h-5 w-5 text-white" />

              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>

            {!collapsed && (
              <div className="hidden min-w-0 lg:block">
                <p className="truncate text-sm font-bold tracking-tight text-slate-900">
                  EstateFlow
                </p>

                <p className="truncate text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  Real Estate CRM
                </p>
              </div>
            )}

            {/* Mobile brand */}
            <div className="min-w-0 lg:hidden">
              <p className="truncate text-sm font-bold tracking-tight text-slate-900">
                EstateFlow
              </p>

              <p className="truncate text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Real Estate CRM
              </p>
            </div>
          </div>

          {/* Mobile close */}
          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p
            className={`
              mb-3 px-3 text-[10px] font-bold uppercase
              tracking-[0.14em] text-slate-400
              ${collapsed ? "lg:hidden" : ""}
            `}
          >
            Workspace
          </p>

          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onMobileClose}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `
                    group relative flex items-center gap-3
                    rounded-xl px-3 py-2.5
                    text-sm font-medium
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-primary-50 text-primary-700 shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }
                    ${collapsed ? "lg:justify-center" : ""}
                    `
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active indicator */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r-full bg-primary-600" />
                      )}

                      <div
                        className={`
                          flex h-8 w-8 shrink-0 items-center justify-center
                          rounded-lg transition
                          ${
                            isActive
                              ? "bg-white text-primary-600 shadow-sm"
                              : "bg-transparent text-slate-400 group-hover:text-slate-600"
                          }
                        `}
                      >
                        <Icon className="h-[18px] w-[18px]" />
                      </div>

                      <span
                        className={`
                          whitespace-nowrap
                          ${collapsed ? "lg:hidden" : ""}
                        `}
                      >
                        {item.label}
                      </span>

                      {isActive && !collapsed && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-500" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User area */}
        <div className="border-t border-slate-100 p-3">
          <div
            className={`
              mb-2 rounded-xl bg-slate-50 p-3
              ${collapsed ? "lg:flex lg:justify-center" : ""}
            `}
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div
                className="
                  flex h-9 w-9 shrink-0 items-center justify-center
                  rounded-xl bg-primary-100 text-xs font-bold
                  text-primary-700 ring-4 ring-white
                "
              >
                {getInitials(user?.name)}
              </div>

              {!collapsed && (
                <div className="min-w-0 lg:block">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {user?.name || "User"}
                  </p>

                  <div className="mt-0.5 flex items-center gap-1.5">
                    {isAdmin ? (
                      <>
                        <ShieldCheck className="h-3 w-3 text-violet-500" />
                        <p className="truncate text-[11px] font-medium text-violet-600">
                          Administrator
                        </p>
                      </>
                    ) : (
                      <>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <p className="truncate text-[11px] font-medium text-slate-500">
                          Sales Employee
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? "Logout" : undefined}
            className={`
              group flex w-full items-center gap-3
              rounded-xl px-3 py-2.5
              text-sm font-medium text-slate-500
              transition
              hover:bg-red-50 hover:text-red-600
              ${collapsed ? "lg:justify-center" : ""}
            `}
          >
            <LogOut className="h-[18px] w-[18px] transition group-hover:translate-x-0.5" />

            <span className={collapsed ? "lg:hidden" : ""}>
              Logout
            </span>
          </button>
        </div>

        {/* Collapse button */}
        <button
          type="button"
          onClick={onToggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="
            absolute -right-3 top-[4.75rem]
            hidden h-7 w-7 items-center justify-center
            rounded-full border border-slate-200
            bg-white text-slate-500
            shadow-sm transition
            hover:border-slate-300 hover:text-slate-900
            lg:flex
          "
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </aside>
    </>
  );
}