import {
  Building2,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
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

    // Employees is visible ONLY to Admin
    ...(user?.role === "ADMIN"
      ? [
          {
            label: "Employees",
            path: "/employees",
            icon: Users,
          },
        ]
      : []),
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200
          bg-white transition-all duration-300
          lg:static lg:z-auto
          ${collapsed ? "lg:w-20" : "lg:w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          w-64
        `}
      >
        {/* =========================================================
            LOGO
        ========================================================== */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Logo icon */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600">
              <Building2 className="h-5 w-5 text-white" />
            </div>

            {/* Desktop logo */}
            {!collapsed && (
              <div className="hidden lg:block">
                <p className="whitespace-nowrap text-sm font-bold text-slate-900">
                  EstateFlow
                </p>

                <p className="text-[10px] text-slate-400">
                  Real Estate CRM
                </p>
              </div>
            )}

            {/* Mobile logo */}
            <div className="lg:hidden">
              <p className="text-sm font-bold text-slate-900">
                EstateFlow
              </p>

              <p className="text-[10px] text-slate-400">
                Real Estate CRM
              </p>
            </div>
          </div>

          {/* Mobile close */}
          <button
            onClick={onMobileClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* =========================================================
            NAVIGATION
        ========================================================== */}
        <nav className="flex-1 space-y-1 p-3">
          {/* Workspace title */}
          <p
            className={`mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 ${
              collapsed ? "lg:hidden" : ""
            }`}
          >
            Workspace
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  `
                  group flex items-center gap-3 rounded-lg px-3 py-2.5
                  text-sm font-medium transition
                  ${
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }
                  `
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Icon */}
                    <Icon
                      className={`h-5 w-5 shrink-0 ${
                        isActive
                          ? "text-primary-600"
                          : "text-slate-400"
                      }`}
                    />

                    {/* Label */}
                    <span
                      className={`whitespace-nowrap ${
                        collapsed ? "lg:hidden" : ""
                      }`}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* =========================================================
            USER PROFILE
        ========================================================== */}
        <div className="border-t border-slate-100 p-3">
          <div
            className={`mb-2 flex items-center gap-3 rounded-lg bg-slate-50 p-3 ${
              collapsed ? "lg:justify-center" : ""
            }`}
          >
            {/* Avatar */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
              {user?.name
                ?.split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            {/* User information */}
            <div
              className={`min-w-0 ${
                collapsed ? "lg:hidden" : ""
              }`}
            >
              <p className="truncate text-sm font-semibold text-slate-800">
                {user?.name}
              </p>

              <p className="truncate text-xs text-slate-400">
                {user?.role === "ADMIN"
                  ? "Administrator"
                  : "Sales Employee"}
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 ${
              collapsed ? "lg:justify-center" : ""
            }`}
          >
            <LogOut className="h-4 w-4" />

            <span className={collapsed ? "lg:hidden" : ""}>
              Logout
            </span>
          </button>
        </div>

        {/* =========================================================
            COLLAPSE BUTTON
        ========================================================== */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 hidden h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:text-slate-800 lg:flex"
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