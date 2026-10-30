
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="flex items-center justify-between px-6 py-5 lg:px-16">
        <div>
          <h2 className="text-2xl font-bold">EstateFlow</h2>
          <p className="text-xs text-slate-400">Real Estate CRM</p>
        </div>

        <Link
          to="/login"
          className="rounded-lg bg-white px-5 py-2.5
          font-semibold text-slate-950 hover:bg-slate-200"
        >
          Login
        </Link>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <p className="mb-5 text-sm font-semibold uppercase
        tracking-widest text-blue-400">
          Real Estate Management Platform
        </p>

        <h1 className="text-4xl font-bold leading-tight
        sm:text-5xl lg:text-6xl">
          Manage Your Real Estate Business
          <span className="text-blue-400"> Smarter</span>
        </h1>

        <p className="mx-auto mt-7 max-w-2xl text-lg
        leading-8 text-slate-300">
          EstateFlow helps real estate teams manage leads,
          properties, bookings and sales activities
          from one centralized CRM platform.
        </p>

        <Link
          to="/login"
          className="mt-9 inline-block rounded-xl bg-blue-600
          px-7 py-3.5 font-semibold hover:bg-blue-500"
        >
          Access EstateFlow
        </Link>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6
      px-6 pb-24 sm:grid-cols-2 lg:grid-cols-4">

        {[
          {
            title: "Lead Management",
            description:
              "Track leads and manage customer interactions."
          },
          {
            title: "Property Management",
            description:
              "Organize projects, buildings and property units."
          },
          {
            title: "Booking Management",
            description:
              "Manage property bookings and booking history."
          },
          {
            title: "Sales Dashboard",
            description:
              "Monitor sales activities and business performance."
          }
        ].map((feature) => (
          <article
            key={feature.title}
            className="rounded-2xl border border-slate-700
            bg-slate-900 p-6"
          >
            <h2 className="text-lg font-bold">
              {feature.title}
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              {feature.description}
            </p>
          </article>
        ))}
      </section>

      <footer className="border-t border-slate-800
      px-6 py-7 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} EstateFlow.
        Real Estate CRM Platform.
      </footer>
    </main>
  );
}
