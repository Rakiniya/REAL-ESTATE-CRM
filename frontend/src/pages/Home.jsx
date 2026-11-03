
import { Link } from "react-router-dom";
import { useEffect } from "react";

const features = [
  {
    title: "Real Estate Lead Management",
    description:
      "Track potential customers, manage leads and organize customer interactions efficiently.",
  },
  {
    title: "Property Management",
    description:
      "Organize real estate projects, buildings and property units in one centralized platform.",
  },
  {
    title: "Property Booking Management",
    description:
      "Manage property bookings, customer details and booking history with ease.",
  },
  {
    title: "Real Estate Sales Dashboard",
    description:
      "Monitor sales activities and track your real estate business performance.",
  },
];

export default function Home() {

  useEffect(() => {
    document.title =
      "Real Estate CRM Software | Manage Leads & Properties - EstateFlow";

    document.querySelector('meta[name="description"]').content =
      "EstateFlow is real estate CRM software to manage property leads, track properties, handle bookings and simplify your real estate sales activities.";
  }, []);
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav
        aria-label="Main navigation"
        className="flex items-center justify-between px-6 py-5 lg:px-16"
      >
        <div>
          <div className="text-2xl font-bold">EstateFlow</div>
          <p className="text-xs text-slate-400">Real Estate CRM Software</p>
        </div>

        <Link
          to="/login"
          className="rounded-lg bg-white px-5 py-2.5 font-semibold text-slate-950 hover:bg-slate-200"
        >
          Login
        </Link>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-blue-400">
          Real Estate Management Platform
        </p>

        <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
          Real Estate CRM Software to Manage Your Business
          <span className="text-blue-400"> Smarter</span>
        </h1>

        <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-300">
          EstateFlow is a real estate CRM platform that helps teams manage
          property leads, properties, bookings and sales activities from
          one centralized platform.
        </p>

        <Link
          to="/login"
          className="mt-9 inline-block rounded-xl bg-blue-600 px-7 py-3.5 font-semibold hover:bg-blue-500"
        >
          Access EstateFlow
        </Link>
      </section>

      <section
        aria-labelledby="features-heading"
        className="mx-auto max-w-6xl px-6 pb-24"
      >
        <h2
          id="features-heading"
          className="mb-8 text-center text-2xl font-bold"
        >
          Real Estate CRM Features
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-slate-700 bg-slate-900 p-6"
            >
              <h3 className="text-lg font-bold">{feature.title}</h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {feature.description}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-slate-300">
          Ready to manage your real estate business?
          <Link
            to="/login"
            className="ml-2 text-blue-400 underline"
          >
            Explore EstateFlow CRM
          </Link>
        </p>
      </section>

      <footer className="border-t border-slate-800 px-6 py-7 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} EstateFlow. Real Estate CRM Software.
      </footer>
    </main>
  );
}
