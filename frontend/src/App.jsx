import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";

import ProtectedRoute from "./routes/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={<Login />}
      />

      {/* Protected CRM */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/leads"
            element={<Leads />}
          />

          {/* These will be added next */}
          {/* 
          <Route
            path="/properties"
            element={<Properties />}
          />

          <Route
            path="/bookings"
            element={<Bookings />}
          />
          */}
        </Route>
      </Route>

      {/* Application entry */}
      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

      {/* Unknown URL */}
      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />
    </Routes>
  );
}