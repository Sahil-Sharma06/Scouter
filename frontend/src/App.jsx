import React from "react";

const stats = [
  { label: "Agents", value: "4" },
  { label: "Pipeline", value: "JD to Outreach" },
  { label: "Latency", value: "Under 2 mins" },
];

export default function App() {
  return (
    <div className="min-h-screen scouter-bg">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between reveal">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-600">Scouter</p>
            <h1 className="text-4xl font-semibold text-slate-900 md:text-5xl">
              Job intelligence that ships your outreach fast.
            </h1>
            <p className="max-w-xl text-lg text-slate-700">
              Drop a job URL and get a ready-to-send cold email with a grounded fit score, backed
              by your resume evidence.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {stats.map((item) => (
              <div
                key={item.label}
                className="float-card rounded-2xl bg-white/80 px-5 py-4 text-center backdrop-blur"
              >
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  {item.label}
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </header>

        <section className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="float-card rounded-3xl bg-white/90 p-8 backdrop-blur reveal">
            <h2 className="text-2xl font-semibold text-slate-900">Launch a new run</h2>
            <p className="mt-2 text-slate-600">
              Authenticate, upload your resume once, then reuse it across roles.
            </p>

            <div className="mt-6 grid gap-4">
              <label className="text-sm font-medium text-slate-700">Work email</label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:border-slate-400 focus:outline-none"
                placeholder="you@domain.com"
              />
              <label className="text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:border-slate-400 focus:outline-none"
                placeholder="••••••••"
              />
              <div className="flex flex-wrap gap-3">
                <button className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
                  Register
                </button>
                <button className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700">
                  Login
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-4">
              <label className="text-sm font-medium text-slate-700">Job URL</label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:border-slate-400 focus:outline-none"
                placeholder="https://company.com/jobs/role"
              />
              <label className="text-sm font-medium text-slate-700">Resume text</label>
              <textarea
                className="min-h-[140px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 focus:border-slate-400 focus:outline-none"
                placeholder="Paste your resume"
              />
              <button className="rounded-xl bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-slate-900">
                Analyse job
              </button>
            </div>
          </div>

          <div className="float-card rounded-3xl bg-white/90 p-8 backdrop-blur reveal reveal-delay">
            <h3 className="text-xl font-semibold text-slate-900">Latest output</h3>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-slate-900 px-4 py-3 text-white">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Subject</p>
                <p className="mt-2 text-base">
                  Focused on platform reliability for your next senior backend hire
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-700">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Preview</p>
                <p className="mt-2 text-sm leading-relaxed">
                  I built high-throughput ingestion pipelines for payment events, and I see the
                  same reliability emphasis in your role. If you are open to it, I can share a
                  short plan for cutting retry latency while keeping audit trails intact.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-[color:var(--sun)] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-700">Fit score</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">82</p>
                </div>
                <div className="rounded-2xl bg-[color:var(--mint)] px-4 py-4 text-slate-900">
                  <p className="text-xs uppercase tracking-[0.2em]">Top skill match</p>
                  <p className="mt-2 text-lg font-semibold">Distributed systems</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
