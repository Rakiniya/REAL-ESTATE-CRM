import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "ADMIN",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      submit: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(form.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!form.password) {
      newErrors.password = "Password is required.";
    }

    if (!form.role) {
      newErrors.role = "Please select a role.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const getErrorMessage = (error) => {
    const detail = error?.response?.data?.detail;

    if (Array.isArray(detail)) {
      return detail
        .map((item) => item?.msg)
        .filter(Boolean)
        .join(", ");
    }

    if (typeof detail === "string") {
      return detail;
    }

    if (error?.message) {
      return error.message;
    }

    return "Login failed. Please check your credentials.";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const loggedInUser = await login(
        form.email.trim(),
        form.password,
        form.role
      );

      console.log("Login successful:", loggedInUser);

      navigate("/dashboard");
    } catch (error) {
      console.error(
        "Login error:",
        error?.response?.data || error?.message
      );

      setErrors({
        submit: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const useAdminDemo = () => {
    setForm({
      email: "admin@realestate.com",
      password: "Admin@123",
      role: "ADMIN",
    });

    setErrors({});
  };

  const useSalesDemo = () => {
    setForm({
      email: "sales@realestate.com",
      password: "Sales@123",
      role: "SALES_EMPLOYEE",
    });

    setErrors({});
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* LEFT SIDE */}
        <div className="hidden bg-slate-950 lg:flex lg:flex-col lg:justify-between p-10 xl:p-14">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl font-bold text-slate-950">
                E
              </div>

              <div>
                <p className="text-lg font-bold text-white">
                  EstateFlow
                </p>
                <p className="text-xs text-slate-400">
                  Real Estate CRM
                </p>
              </div>
            </div>

            <div className="mt-24 max-w-xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400">
                Sales Management Platform
              </p>

              <h1 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
                Manage your real estate sales from one place.
              </h1>

              <p className="mt-6 text-lg leading-8 text-slate-400">
                Track leads, manage properties, handle bookings,
                and keep your sales team organized with EstateFlow.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="mb-3 text-xl">◉</div>
                <h3 className="font-semibold text-white">
                  Lead Management
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Track every lead from first contact to booking.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="mb-3 text-xl">◆</div>
                <h3 className="font-semibold text-white">
                  Property Management
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Manage projects, buildings, units and availability.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="mb-3 text-xl">✓</div>
                <h3 className="font-semibold text-white">
                  Smart Bookings
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Prevent duplicate bookings and maintain booking history.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="mb-3 text-xl">↗</div>
                <h3 className="font-semibold text-white">
                  Sales Dashboard
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Get a clear overview of your sales activity.
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-500">
            EstateFlow • Real Estate CRM
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">

            {/* MOBILE BRANDING */}
            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 font-bold text-white">
                E
              </div>

              <div>
                <p className="font-bold text-slate-950">
                  EstateFlow
                </p>
                <p className="text-xs text-slate-500">
                  Real Estate CRM
                </p>
              </div>
            </div>

            {/* LOGIN CARD */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/50 sm:p-9">

              <div className="mb-8">
                <p className="mb-2 text-sm font-semibold text-slate-500">
                  Welcome back
                </p>

                <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                  Sign in to EstateFlow
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Enter your credentials to access your CRM dashboard.
                </p>
              </div>

              {/* SUBMIT ERROR */}
              {errors.submit && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errors.submit}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* EMAIL */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="you@example.com"
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                      errors.email
                        ? "border-red-400 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200 focus:border-slate-950 focus:ring-2 focus:ring-slate-100"
                    }`}
                  />

                  {errors.email && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* PASSWORD */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="Enter your password"
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                      errors.password
                        ? "border-red-400 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200 focus:border-slate-950 focus:ring-2 focus:ring-slate-100"
                    }`}
                  />

                  {errors.password && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* ROLE */}
                <div>
                  <label
                    htmlFor="role"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Role
                  </label>

                  <select
                    id="role"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition ${
                      errors.role
                        ? "border-red-400 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200 focus:border-slate-950 focus:ring-2 focus:ring-slate-100"
                    }`}
                  >
                    <option value="ADMIN">
                      Admin
                    </option>

                    <option value="SALES_EMPLOYEE">
                      Sales Employee
                    </option>
                  </select>

                  {errors.role && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.role}
                    </p>
                  )}
                </div>

                {/* LOGIN BUTTON */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="mr-2 h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />

                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>

                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </form>

              {/* DEMO CREDENTIALS */}
              <div className="mt-7 border-t border-slate-100 pt-6">
                <div className="mb-4">
                  <p className="text-sm font-bold text-slate-800">
                    Demo Credentials
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Use these accounts to explore both user roles.
                  </p>
                </div>

                <div className="space-y-3">

                  {/* ADMIN DEMO */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs text-white">
                            A
                          </span>

                          <p className="text-sm font-semibold text-slate-800">
                            Admin
                          </p>
                        </div>

                        <div className="mt-3 space-y-1 text-xs text-slate-500">
                          <p>
                            <span className="font-medium text-slate-700">
                              Email:
                            </span>{" "}
                            admin@realestate.com
                          </p>

                          <p>
                            <span className="font-medium text-slate-700">
                              Password:
                            </span>{" "}
                            Admin@123
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={useAdminDemo}
                        disabled={isLoading}
                        className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-950 hover:bg-slate-950 hover:text-white disabled:opacity-50"
                      >
                        Use Admin
                      </button>
                    </div>
                  </div>

                  {/* SALES DEMO */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-700 text-xs text-white">
                            S
                          </span>

                          <p className="text-sm font-semibold text-slate-800">
                            Sales Employee
                          </p>
                        </div>

                        <div className="mt-3 space-y-1 text-xs text-slate-500">
                          <p>
                            <span className="font-medium text-slate-700">
                              Email:
                            </span>{" "}
                            sales@realestate.com
                          </p>

                          <p>
                            <span className="font-medium text-slate-700">
                              Password:
                            </span>{" "}
                            Sales@123
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={useSalesDemo}
                        disabled={isLoading}
                        className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-950 hover:bg-slate-950 hover:text-white disabled:opacity-50"
                      >
                        Use Sales
                      </button>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              Secure access • EstateFlow Real Estate CRM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}