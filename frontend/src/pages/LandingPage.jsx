import React, { useEffect, useState } from "react";

const terminalSeed = [
  { type: "primary", text: "[SEARCH] Scanning LinkedIn for \"Senior Rust Engineer\" in London..." },
  { type: "secondary", text: "[SUCCESS] Found 12 matching roles at Stripe, Revolut, and Starling." },
  { type: "primary", text: "[ANALYZE] Parsing Job ID #98234 (Stripe)..." },
  { type: "tertiary", text: "[SCORE] Fit Score: 94%. Primary Match: Systems Engineering." },
  { type: "primary", text: "[RESUME] Generating dynamic cover letter with context: 'Distributed Systems'." },
  { type: "secondary", text: "[READY] Outreach sequence primed for Lead Recruiter @ Stripe." },
];

const liveLogs = [
  { type: "primary", text: "[SEARCH] Navigating Meta careers portal..." },
  { type: "secondary", text: "[MATCH] Found Senior Product Engineer role." },
  { type: "primary", text: "[ANALYZE] Identifying tech stack: React, GraphQL, Relay." },
  { type: "tertiary", text: "[FIT] Resume alignment: 91% match." },
  { type: "secondary", text: "[ACTION] Tailoring resume for GraphQL expertise." },
];

const features = [
  {
    title: "Company Intel",
    description:
      'Deep-dive into tech stacks, Glassdoor sentiment, and GitHub activity. Our agents identify "hidden gems" before they hit the major boards.',
    icon: "business",
    accent: "primary",
    span: "md:col-span-8",
    meta: [
      { label: "Stack Match", value: "98% Node.js", tone: "secondary" },
      { label: "Culture Vibe", value: "Eng-First", tone: "primary" },
      { label: "Equity Score", value: "Tier A+", tone: "tertiary" },
    ],
  },
  {
    title: "Resume Fit",
    description: "Real-time AI score based on your unique profile vs. job requirements.",
    icon: "description",
    accent: "secondary",
    span: "md:col-span-4",
  },
  {
    title: "Outreach",
    description: "Personalized sequences that bypass gatekeepers.",
    icon: "mail",
    accent: "tertiary",
    span: "md:col-span-4",
  },
  {
    title: "Automated Discovery",
    description:
      "While you sleep, Scouter is mapping the entire job market, filtering out the noise, and only presenting high-value opportunities that match your specific developer DNA.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBlMW9x_s_npaZUSoS9kM49jvlD6XvJ1P6F71iUwirZnzPMb1IZGqe_H8ME0WxLfs_qkyjn0N_R5jLp6OgK9abeLEY2zxf_Es9FSuJuwGHfmwi-YQpECj4gy76tOZ_myuZjrIfK8hyRHEHaWdXzNR8Oz5k1CpOj2tQY3f2Db8Brg9qC3-W6hcrPqnXdvRE42bNQbkil-2vxaul-a2LRHKneMomjjyPNGVCvizkJVeIUougFmEG7ddo6SU1raXDJhmRyfxFc-qGIqFI",
    accent: "primary",
    span: "md:col-span-8",
  },
];

const testimonials = [
  {
    initials: "JD",
    name: "James D.",
    role: "Staff Engineer @ Uber",
    tone: "primary",
    quote:
      "The company intel is scary accurate. It told me about their Rust migration before the interview.",
  },
  {
    initials: "SL",
    name: "Sarah L.",
    role: "Lead Frontend @ Vercel",
    tone: "secondary",
    quote:
      "Resume fit saved me hours of tweaking. The AI knows exactly what recruiters are looking for.",
  },
  {
    initials: "MK",
    name: "Marcus K.",
    role: "Senior Dev @ Atlassian",
    tone: "tertiary",
    quote: "The automation is surgical. 12 interviews in 3 weeks without sending a single manual email.",
  },
];

const pricing = [
  {
    name: "EXPLORER",
    price: "$0",
    button: "Get Started",
    features: ["5 Company Reports / mo", "Basic Resume Scoring", "Community Access"],
  },
  {
    name: "PRO AGENT",
    price: "$29",
    button: "Go Pro",
    featured: true,
    features: [
      "Unlimited Company Reports",
      "AI Resume Tailoring",
      "Outreach Automation (50/mo)",
      "Priority Agent Access",
    ],
  },
  {
    name: "FLEET",
    price: "$99",
    button: "Contact Sales",
    features: ["10 Parallel Agents", "Custom Knowledge Base", "White-glove Concierge"],
  },
];

function toneClasses(tone) {
  if (tone === "secondary") return "text-secondary";
  if (tone === "tertiary") return "text-tertiary";
  return "text-primary";
}

function toneBorder(tone) {
  if (tone === "secondary") return "hover:border-secondary/50";
  if (tone === "tertiary") return "hover:border-tertiary/50";
  return "hover:border-primary/50";
}

export default function LandingPage({ onNavigate }) {
  const [logs, setLogs] = useState(terminalSeed);

  useEffect(() => {
    let index = 0;
    const interval = window.setInterval(() => {
      setLogs((current) => {
        const nextLog = liveLogs[index % liveLogs.length];
        index += 1;
        return [...current.slice(-7), nextLog];
      });
    }, 3000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="bg-background text-on-surface selection:bg-primary-container selection:text-on-primary-container scouter-bg">
      <nav className="sticky top-0 z-50 w-full border-b border-outline-variant/30 bg-surface/70 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-container-max items-center justify-between px-margin-desktop py-base">
          <div className="flex items-center gap-base">
            <span className="font-headline-md text-headline-md font-bold text-primary">DevAgent.AI</span>
          </div>
          <div className="hidden items-center gap-gutter md:flex">
            <a className="cursor-pointer text-body-md font-body-md text-on-surface-variant transition-colors hover:text-primary" href="#features">
              Features
            </a>
            <a className="cursor-pointer text-body-md font-body-md text-on-surface-variant transition-colors hover:text-primary" href="#workflow">
              Workflow
            </a>
            <a className="cursor-pointer text-body-md font-body-md text-on-surface-variant transition-colors hover:text-primary" href="#pricing">
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-base">
            <button className="material-symbols-outlined cursor-pointer text-on-surface-variant active:opacity-80">hub</button>
            <button className="material-symbols-outlined cursor-pointer text-on-surface-variant active:opacity-80">notifications</button>
            <button className="rounded-lg bg-primary px-4 py-2 text-label-md font-label-md font-bold text-on-primary transition-transform active:scale-95">
              Start Analyzing
            </button>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative overflow-hidden px-margin-desktop pb-32 pt-24" id="workflow">
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <div className="absolute -right-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px]" />
            <div className="absolute -bottom-1/4 -left-1/4 h-[600px] w-[600px] rounded-full bg-secondary/5 blur-[120px]" />
          </div>

          <div className="relative z-10 mx-auto grid max-w-container-max grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-label-sm font-label-sm text-primary">MULTI-AGENT SYSTEM v4.2 LIVE</span>
              </div>
              <h1 className="mb-6 font-display text-display tracking-tight">
                Automate your job search with <span className="text-primary">multi-agent AI</span>.
              </h1>
              <p className="mb-10 max-w-xl text-body-lg font-body-lg text-on-surface-variant">
                Stop manual searching. Deploy a swarm of AI agents that research companies, tailor your resume for every role, and automate outreach with surgical precision.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="rounded-xl bg-primary px-8 py-4 text-label-md font-label-md font-bold text-on-primary shadow-[0_0_20px_rgba(173,198,255,0.3)] transition-all active:scale-95" onClick={() => onNavigate?.("/login")}>
                  Deploy Your Agent Core
                </button>
                <button className="rounded-xl border border-outline-variant px-8 py-4 text-label-md font-label-md font-bold transition-all hover:bg-surface-variant/30" onClick={() => onNavigate?.("/register")}>
                  View Documentation
                </button>
              </div>
            </div>

            <div className="glass-card relative h-[500px] overflow-hidden rounded-2xl border border-outline-variant/30 p-base">
              <div className="mb-gutter flex items-center justify-between px-4 pt-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">terminal</span>
                  <span className="text-label-md font-label-md text-on-surface">Agent Core: Scraper-v2</span>
                </div>
                <div className="flex gap-1">
                  <div className="h-3 w-3 rounded-full bg-error/40" />
                  <div className="h-3 w-3 rounded-full bg-tertiary/40" />
                  <div className="h-3 w-3 rounded-full bg-secondary/40" />
                </div>
              </div>

              <div className="relative grid grid-cols-1 gap-4 p-4 text-label-sm font-label-sm">
                <div className="space-y-2 font-mono text-on-surface-variant" id="agent-terminal">
                  {logs.map((log, index) => (
                    <div className="flex gap-4" key={`${log.text}-${index}`}>
                      <span className={toneClasses(log.type)}>{log.text.split(" ")[0]}</span>
                      <span>{log.text.split(" ").slice(1).join(" ")}</span>
                    </div>
                  ))}
                </div>

                <div className="relative mt-12 flex h-32 items-center justify-between px-12">
                  <div className="z-10 rounded-xl border border-outline-variant bg-surface-container-high p-4">
                    <span className="material-symbols-outlined text-4xl text-primary">search</span>
                  </div>
                  <div className="z-10 rounded-xl border border-outline-variant bg-surface-container-high p-4">
                    <span className="material-symbols-outlined text-4xl text-secondary">psychology</span>
                  </div>
                  <div className="z-10 rounded-xl border border-outline-variant bg-surface-container-high p-4">
                    <span className="material-symbols-outlined text-4xl text-tertiary">send</span>
                  </div>

                  <svg className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2" xmlns="http://www.w3.org/2000/svg">
                    <line className="text-outline-variant/30" stroke="currentColor" strokeWidth="2" x1="20%" x2="80%" y1="50%" y2="50%" />
                    <line className="agent-line" stroke="url(#line-grad)" strokeWidth="2" x1="20%" x2="80%" y1="50%" y2="50%" />
                    <defs>
                      <linearGradient id="line-grad" x1="0%" x2="100%" y1="0%" y2="0%">
                        <stop offset="0%" stopColor="#adc6ff" />
                        <stop offset="100%" stopColor="#4edea3" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 flex w-full items-center justify-between border-t border-outline-variant/30 bg-surface-container-lowest/80 p-4">
                <div className="flex items-center gap-4">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-outline-variant">
                    <div className="h-full w-3/4 bg-secondary" />
                  </div>
                  <span className="text-label-sm">System Health: 99.8%</span>
                </div>
                <span className="font-bold text-primary">LIVE FEED</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-container-max px-margin-desktop py-32" id="features">
          <div className="mb-20 text-center">
            <h2 className="mb-4 font-headline-lg text-headline-lg">Engineered for Deep Job Search</h2>
            <p className="mx-auto max-w-2xl text-body-md font-body-md text-on-surface-variant">
              Scouter isn't just a scraper. It's an intelligence platform that thinks like a recruiter and acts like a developer.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-gutter md:grid-cols-12">
            {features.map((feature) => (
              <div
                className={`glass-card group relative overflow-hidden rounded-2xl border border-outline-variant/30 p-gutter transition-colors ${feature.span} ${toneBorder(feature.accent)}`}
                key={feature.title}
              >
                {feature.meta ? (
                  <div className="flex h-full flex-col">
                    <div className="mb-12 flex items-start justify-between">
                      <div>
                        <h3 className="mb-2 font-headline-md text-headline-md">Company Intel</h3>
                        <p className="max-w-md text-body-md font-body-md text-on-surface-variant">{feature.description}</p>
                      </div>
                      <span className="material-symbols-outlined text-4xl text-primary transition-transform group-hover:scale-110">business</span>
                    </div>
                    <div className="mt-auto grid grid-cols-3 gap-4">
                      {feature.meta.map((item) => (
                        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-high p-4" key={item.label}>
                          <span className="mb-1 block text-label-sm font-label-sm uppercase tracking-widest opacity-60">{item.label}</span>
                          <span className={`font-bold ${toneClasses(item.tone)}`}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : feature.image ? (
                  <div className="flex flex-col items-center gap-gutter md:flex-row">
                    <div className="flex-1">
                      <h3 className="mb-2 font-headline-md text-headline-md">{feature.title}</h3>
                      <p className="text-body-md font-body-md text-on-surface-variant">{feature.description}</p>
                    </div>
                    <div className="h-40 w-full overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-high md:w-64">
                      <img
                        alt="A sleek data visualization dashboard with dark obsidian background and neon electric blue charts and data points."
                        className="h-full w-full object-cover opacity-60 transition-opacity hover:opacity-100"
                        src={feature.image}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <span className={`material-symbols-outlined mb-6 text-4xl ${toneClasses(feature.accent)} transition-transform group-hover:rotate-12`}>
                      {feature.icon}
                    </span>
                    <h3 className="mb-2 font-headline-md text-headline-md">{feature.title}</h3>
                    <p className="mb-6 text-body-md font-body-md text-on-surface-variant">{feature.description}</p>
                    {feature.title === "Resume Fit" ? (
                      <div className="flex h-24 items-end justify-center gap-2">
                        <div className="h-1/2 w-8 rounded-t-sm bg-outline-variant/20" />
                        <div className="h-3/4 w-8 rounded-t-sm bg-outline-variant/20" />
                        <div className="h-full w-8 animate-pulse rounded-t-sm bg-secondary" />
                        <div className="h-2/3 w-8 rounded-t-sm bg-outline-variant/20" />
                      </div>
                    ) : (
                      <div className="rounded-lg border border-outline-variant/20 bg-surface-container-lowest p-3 text-label-sm font-label-sm italic text-on-surface-variant">
                        "Hey [Name], loved your recent blog on K8s operators. I saw you're hiring for..."
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface-container-low py-32 px-margin-desktop">
          <div className="mx-auto max-w-container-max">
            <div className="mb-16 flex flex-col items-end justify-between gap-gutter md:flex-row">
              <div className="max-w-xl">
                <h2 className="mb-4 font-headline-lg text-headline-lg text-primary">Senior Approved</h2>
                <p className="text-body-lg font-body-lg text-on-surface-variant">
                  "The best $20/mo I've spent in my career. Scouter found the Stripe role before my network even knew it was open."
                </p>
              </div>
              <div className="flex gap-4">
                <button className="flex h-12 w-12 items-center justify-center rounded-full border border-outline-variant transition-colors hover:bg-surface-variant">
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <button className="flex h-12 w-12 items-center justify-center rounded-full border border-outline-variant transition-colors hover:bg-surface-variant">
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div className="glass-card rounded-xl border border-outline-variant/20 p-gutter" key={testimonial.name}>
                  <div className="mb-6 flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-highest font-bold ${toneClasses(testimonial.tone)}`}>
                      {testimonial.initials}
                    </div>
                    <div>
                      <h4 className="text-label-md font-label-md">{testimonial.name}</h4>
                      <p className="text-label-sm text-on-surface-variant">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-body-md font-body-md text-on-surface-variant">{testimonial.quote}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-container-max px-margin-desktop py-32" id="pricing">
          <div className="mb-20 text-center">
            <h2 className="mb-4 font-headline-lg text-headline-lg">Choose Your Deployment</h2>
            <p className="text-body-md font-body-md text-on-surface-variant">Scalable AI intelligence for every stage of your career.</p>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-gutter md:grid-cols-3">
            {pricing.map((plan) => (
              <div
                className={`glass-card flex flex-col rounded-2xl border p-gutter transition-colors ${
                  plan.featured ? "relative scale-105 border-2 border-primary shadow-[0_20px_50px_rgba(173,198,255,0.1)]" : "border-outline-variant/20 hover:border-outline"
                }`}
                key={plan.name}
              >
                {plan.featured ? (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-label-sm font-label-sm font-bold text-on-primary">
                    MOST POPULAR
                  </div>
                ) : null}
                <h3 className={`mb-2 text-label-md font-label-md ${plan.featured ? "text-primary" : "text-on-surface-variant"}`}>{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-on-surface-variant">/month</span>
                </div>
                <ul className="mb-10 flex-1 space-y-4">
                  {plan.features.map((item) => (
                    <li className="flex items-center gap-2 text-label-sm font-label-sm" key={item}>
                      <span className="material-symbols-outlined text-sm text-secondary">check_circle</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <button className={`w-full rounded-lg py-3 text-label-md font-label-md transition-colors ${plan.featured ? "bg-primary font-bold text-on-primary hover:shadow-[0_0_15px_rgba(173,198,255,0.4)]" : "border border-outline-variant hover:bg-surface-variant"}`}>
                  {plan.button}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="relative py-32 px-margin-desktop">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-primary/20 bg-surface-container-lowest/70 p-gutter text-center glass-card md:p-16">
            <div className="pointer-events-none absolute inset-0 bg-primary/5 opacity-30" />
            <h2 className="mb-6 font-display text-display">The future of job hunting is automated.</h2>
            <p className="mx-auto mb-12 max-w-2xl text-body-lg font-body-lg text-on-surface-variant">
              Join 12,000+ senior developers using Scouter to land their dream roles. Your personal agent core is ready to deploy.
            </p>
            <div className="flex flex-col justify-center gap-4 md:flex-row">
              <button className="rounded-2xl bg-primary px-10 py-5 text-lg text-label-md font-label-md font-bold text-on-primary transition-all active:scale-95">
                Start Your Analysis
              </button>
              <button className="rounded-2xl border border-outline-variant bg-surface-container-high px-10 py-5 text-lg text-label-md font-label-md font-bold transition-all active:scale-95">
                Talk to an Agent
              </button>
            </div>
            <p className="mt-8 text-label-sm font-label-sm text-on-surface-variant opacity-60">No credit card required to start.</p>
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-outline-variant/10 bg-surface-dim py-gutter">
        <div className="mx-auto flex max-w-container-max flex-col items-center justify-between gap-gutter px-margin-desktop md:flex-row">
          <div className="flex flex-col gap-2">
            <span className="text-label-md font-label-md font-bold text-on-surface">DevAgent AI Intelligence Platform</span>
            <span className="text-label-sm font-label-sm text-on-surface-variant">© 2024 Scouter. All rights reserved.</span>
          </div>
          <div className="flex gap-gutter">
            <a className="text-label-sm font-label-sm text-on-surface-variant transition-opacity hover:text-secondary hover:opacity-100" href="#">
              Privacy Policy
            </a>
            <a className="text-label-sm font-label-sm text-on-surface-variant transition-opacity hover:text-secondary hover:opacity-100" href="#">
              Terms of Service
            </a>
            <a className="text-label-sm font-label-sm text-on-surface-variant transition-opacity hover:text-secondary hover:opacity-100" href="#">
              API Docs
            </a>
          </div>
          <div className="flex gap-base">
            <button className="material-symbols-outlined text-on-surface-variant transition-colors hover:text-primary">public</button>
            <button className="material-symbols-outlined text-on-surface-variant transition-colors hover:text-primary">code</button>
          </div>
        </div>
      </footer>
    </div>
  );
}