
import { Navigate, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Properties from "./pages/Properties";
import Bookings from "./pages/Bookings";
import Employees from "./pages/Employees";

import ProtectedRoute from "./routes/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

import { useEffect } from "react";
import { useLocation } from "react-router-dom";


function SeoRouteHandler() {
  const location = useLocation();

  useEffect(() => {
    const privatePaths = [
      "/login",
      "/dashboard",
      "/leads",
      "/properties",
      "/bookings",
      "/employees",
    ];

    const isPrivate = privatePaths.includes(location.pathname);

    let robots = document.querySelector('meta[name="robots"]');

    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }

    robots.content = isPrivate
      ? "noindex, nofollow"
      : "index, follow";
  }, [location.pathname]);

  return null;
}


export default function App() {
  return (

     <>
      <SeoRouteHandler />
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      {/* Authenticated users */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/bookings" element={<Bookings />} />

          {/* Admin only */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/employees" element={<Employees />} />
          </Route>
        </Route>
      </Route>

      {/* Unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}
