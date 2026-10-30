import type { Metadata } from "next";
import { AppShell } from "@/app/ui/AppShell";

export const metadata: Metadata = {
  title: "Ski Touring & Risk Space — Oütlas",
  description:
    "An interactive guide to avalanche risk, the three essentials of ski touring, and a working checklist for assessing snow stability.",
};

/* -----------------------------------------------------------------
 * Editorial long-form page built on the Oütlas design system.
 * - Hero uses the Story surface (glacier canvas, pine accent, carbon
 *   ink) so the whole chapter opens with a cold, calm reading tone.
 * - Body chapters sit on the default canvas with hairline rules.
 * - Numerals, eyebrows and metadata use the .label / .micro utilities.
 * - Big statistics are rendered with font-display, not image mockups,
 *   so the numbers reflow and remain accessible.
 * ---------------------------------------------------------------- */
export default function SkiTouringPage() {
  return (
    <AppShell>
      <article>
        <Hero />
        <Intro />
        <Section
          n="01"
          slug="statistics"
          title="Statistics & Best Practice"
          intro="The scale of the risk, the history behind it, and the practice that turns awareness into instinct."
        >
          <Statistics />
          <HumanFactor />
          <AvalancheDanger />
          <FirstAid />
        </Section>
        <Section
          n="02"
          slug="essentials"
          title="The Three Essentials"
          intro="A transceiver, a shovel and a probe. One without the others is a souvenir — carry the set, train with it, and know how to use it under pressure."
        >
          <Essentials />
          <PracticeNote />
        </Section>
        <Section
          n="03"
          slug="checklist"
          title="Snow Stability Checklist"
          intro="A systematic record used by British mountain guides and avalanche professionals. Build the profile at a particular time and place; the fuller the record, the clearer the judgement."
        >
          <ChecklistIntro />
          <ChecklistTable />
        </Section>
        <Section
          n="04"
          slug="further"
          title="Further Reading"
          intro="Five short follow-ups that extend the guide: awareness, scale, incidents, search, response."
        >
          <FurtherReading />
        </Section>
        <ArticleFooter />
      </article>
    </AppShell>
  );
}

/* ---------- layout primitives ---------- */

function Section({
  n,
  slug,
  title,
  intro,
  children,
}: {
  n: string;
  slug: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <section id={slug} className="border-t border-rule">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-20 md:grid-cols-[1fr_2fr] md:px-10 md:py-28">
        <header className="space-y-6">
          <span className="label text-ink-faint">Chapter {n}</span>
          <h2 className="font-display text-display-2 leading-tight">{title}</h2>
          <p className="font-ui text-sm leading-relaxed text-ink-muted">
            {intro}
          </p>
        </header>
        <div className="space-y-16">{children}</div>
      </div>
    </section>
  );
}

/* ---------- hero ---------- */

function Hero() {
  return (
    <section
      data-surface="story"
      className="relative overflow-hidden bg-canvas"
    >
      <div className="mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-32">
        <div className="flex items-center gap-3">
          <span className="chip">Choose your path 1.0</span>
          <span className="micro text-ink-faint">Interactive guide</span>
        </div>
        <h1 className="mt-10 font-display leading-[0.9] tracking-[-0.03em] text-[clamp(3.5rem,10vw,8rem)]">
          Ski Touring
          <br />
          &amp; Risk Space
        </h1>
        <p className="mt-10 max-w-xl font-ui text-base leading-relaxed">
          During a ski tour, the danger of an avalanche is always present.
          Re-assessing risk depends on your knowledge and on being cautious
          when assessing the risk before each tour.
        </p>
        <dl className="mt-16 grid grid-cols-2 gap-x-10 gap-y-6 border-t border-rule pt-10 font-ui text-sm md:grid-cols-4">
          <HeroMeta label="Words & photos" value="Zeger Dox" />
          <HeroMeta label="Reading time"   value="~ 14 minutes" />
          <HeroMeta label="Season"         value="Winter 25/26" />
          <HeroMeta label="Series"         value="Risk Space, no. 1" />
        </dl>
      </div>
    </section>
  );
}

function HeroMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="label text-ink-faint">{label}</dt>
      <dd className="mt-2">{value}</dd>
    </div>
  );
}

function Intro() {
  return (
    <section className="border-t border-rule">
      <div className="mx-auto max-w-3xl px-6 py-20 md:px-10 md:py-28">
        <span className="label text-ink-faint">In this guide</span>
        <p className="mt-8 font-display text-section leading-relaxed text-ink">
          You&rsquo;ll obtain a better understanding of the statistics of
          avalanches, best practices for riders in the backcountry, the three
          essentials for touring, how to assess snow stability, a snow
          stability checklist, additional resources, accidents, what to do and
          how to search, plus immediate response to victims that have been
          buried.
        </p>
        <ul className="mt-10 space-y-3 border-t border-rule pt-10 font-ui text-sm leading-relaxed text-ink-muted">
          <IntroQuestion>
            What information do I have that makes me think this slope is
            stable?
          </IntroQuestion>
          <IntroQuestion>
            What is the likely outcome for our group should the slope
            avalanche?
          </IntroQuestion>
        </ul>
      </div>
    </section>
  );
}

function IntroQuestion({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="label text-ink-faint">Ask</span>
      <span className="flex-1 text-ink">{children}</span>
    </li>
  );
}

/* ---------- chapter 01 ---------- */

function Statistics() {
  const stats = [
    {
      figure: "4 in 10",
      caption: "casualties who survive an avalanche burial beyond 15 minutes.",
    },
    {
      figure: "1,347",
      caption: "incidents recorded across the European Alps last season.",
    },
    {
      figure: "1,000+",
      caption: "touring parties logged with Scottish Avalanche Information Service annually.",
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-px bg-rule sm:grid-cols-3">
      {stats.map((s) => (
        <div key={s.figure} className="bg-canvas p-8">
          <div className="font-display text-display-1 leading-none">
            {s.figure}
          </div>
          <p className="mt-6 font-ui text-sm leading-relaxed text-ink-muted">
            {s.caption}
          </p>
        </div>
      ))}
    </div>
  );
}

function HumanFactor() {
  return (
    <Subsection
      eyebrow="Heuristics"
      title="The human factor"
      body={[
        "Many riders think of snow safety as avalanches. There are plenty of other factors — human ones — before buckling boots at the top of the slope.",
        "'Heuristics' is the term for the mental shortcuts that influence decisions. Peer pressure is the most well-known, but so are individual expectations, previous experience, and uncertainty or excessive enthusiasm.",
        "Riders on a short holiday take risks they would not take with more time. Familiar descents are often mistaken for safe ones. People stick to a plan despite indications that it should be adjusted throughout the day.",
      ]}
    />
  );
}

function AvalancheDanger() {
  return (
    <Subsection
      eyebrow="Variables"
      title="Avalanche danger"
      body={[
        "Estimating danger means watching several variables: slope gradient, recent snowfall, presence of trees, quality of the existing snowpack, wind direction, aspect, time of day.",
        "The first port of call is always the local avalanche report. Local experts assign a score between 1 (low) and 5 (very high). Treat that score as the ceiling of your day, not the floor.",
      ]}
    />
  );
}

function FirstAid() {
  return (
    <Subsection
      eyebrow="Primary care"
      title="Advanced first aid"
      body={[
        "If you already carry a first aid certification in your salopets, the foundational principles still hold in the high mountains. Circumstances up here are trickier — simulating practical applications is how you stay ready.",
        "First save a life — bleeding, consciousness, breathing — while someone else calls for rescue services. Keep the group warm, keep the victim talking, keep the scene survey current.",
      ]}
    />
  );
}

function Subsection({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string[];
}) {
  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="label text-ink-faint">{eyebrow}</span>
      </div>
      <h3 className="mt-3 font-display text-title">{title}</h3>
      <div className="mt-6 space-y-4 font-ui text-base leading-relaxed text-ink-muted">
        {body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
    </div>
  );
}

/* ---------- chapter 02 ---------- */

function Essentials() {
  const items = [
    {
      n: "01",
      key: "Transceiver",
      body: "Owning one won't stop you being caught — but if you are buried it is almost your only hope of being found, dead or alive. Not a substitute for good practice; it is part of it.",
    },
    {
      n: "02",
      key: "Snow shovel",
      body: "A big metal-bladed shovel per rider — not flimsy things the size of dessert spoons. If you were buried, what would you want your rescuers to use? A JCB.",
    },
    {
      n: "03",
      key: "Probe",
      body: "Used with a transceiver, a probe pinpoints a body before digging starts. Also handy for probing snow structure on the move once you know the aspect's profile.",
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-px bg-rule md:grid-cols-3">
      {items.map((i) => (
        <div key={i.key} className="bg-canvas p-8">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-ink-faint">{i.n}</span>
            <span className="chip">Essential</span>
          </div>
          <h4 className="mt-6 font-display text-title">{i.key}</h4>
          <p className="mt-4 font-ui text-sm leading-relaxed text-ink-muted">
            {i.body}
          </p>
        </div>
      ))}
    </div>
  );
}

function PracticeNote() {
  return (
    <div className="border border-rule bg-canvas-raised p-8">
      <span className="label text-ink-faint">Drill</span>
      <h4 className="mt-3 font-display text-title">Practice as a group</h4>
      <p className="mt-4 font-ui text-base leading-relaxed text-ink-muted">
        One rider puts their transceiver in receive mode and skis away from the
        group. The others ski towards them one at a time. The receiver signals
        when they&rsquo;ve picked up a signal; everyone checks they are
        transmitting correctly. Spare batteries in every pack — malfunctions
        happen.
      </p>
    </div>
  );
}

/* ---------- chapter 03 ---------- */

function ChecklistIntro() {
  return (
    <div className="space-y-4 font-ui text-base leading-relaxed text-ink-muted">
      <p>
        There is a lot you can do to assess snow stability before you go on
        tour. Snowpack is the result of past snowfall and weather conditions;
        this information lets you understand how it has built up. Weather
        reports, avalanche bulletins and tourist offices all help.
      </p>
      <p>
        Some techniques depend on knowledge and skill — profiling, shovel
        shear, Rutschblock — and need interpretation training. Stability tests
        can seem like a chore, but they do not take long and they provide
        essential information. Record them, and the picture of snow stability
        becomes a lot clearer.
      </p>
    </div>
  );
}

type Trend = "stable" | "unstable" | "either";

type Factor = {
  label: string;
  stable: string;
  unstable: string;
  trend: Trend;
};

const FACTORS: Factor[] = [
  { label: "Slope angle",             stable: "< 30°",            unstable: "30° – 45°",          trend: "either"   },
  { label: "Snow depth",              stable: "settled, uniform", unstable: "deep, variable",     trend: "either"   },
  { label: "Past avalanche activity", stable: "none observed",    unstable: "recent debris",      trend: "unstable" },
  { label: "Current activity",        stable: "silent slopes",    unstable: "whumpfs, cracking",  trend: "unstable" },
  { label: "Shear tests",             stable: "no clean break",   unstable: "clean sudden break", trend: "either"   },
  { label: "Snowpack structure",      stable: "well-bonded",      unstable: "weak layers",        trend: "either"   },
  { label: "Snow temperature",        stable: "cold, dry",        unstable: "warming trend",      trend: "either"   },
  { label: "Precipitation",           stable: "none, dry period", unstable: "heavy, recent",      trend: "unstable" },
  { label: "Wind",                    stable: "light, calm",      unstable: "> 30 km/h sustained", trend: "unstable" },
  { label: "Effect of past winds",    stable: "no slabs built",   unstable: "wind-slab on lee",   trend: "unstable" },
  { label: "Surface penetration",     stable: "firm underfoot",   unstable: "deep post-holing",   trend: "either"   },
  { label: "Air temperature",         stable: "steady, cold",     unstable: "rapid rise",         trend: "unstable" },
  { label: "Solar radiation",         stable: "overcast / north", unstable: "intense on south",   trend: "unstable" },
  { label: "Snow settlement",         stable: "quiet consolidation", unstable: "pillowing, bridging", trend: "either" },
  { label: "Humidity",                stable: "low, dry air",     unstable: "high, damp air",     trend: "unstable" },
  { label: "Weather forecast",        stable: "stable high",      unstable: "front moving in",    trend: "unstable" },
  { label: "Avalanche forecast",      stable: "level 1 – 2",       unstable: "level 3 – 5",         trend: "unstable" },
  { label: "Stability rating",        stable: "based on the above", unstable: "based on the above", trend: "either" },
];

function ChecklistTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse font-ui text-sm">
        <thead>
          <tr className="border-b border-rule">
            <th className="label py-3 pr-4 text-left text-ink-faint">
              Record information
            </th>
            <th className="label py-3 pr-4 text-left text-ink-faint">
              Influence / stable
            </th>
            <th className="label py-3 pr-4 text-left text-ink-faint">
              Influence / unstable
            </th>
            <th className="label py-3 text-left text-ink-faint">Weight</th>
          </tr>
        </thead>
        <tbody>
          {FACTORS.map((f) => (
            <tr key={f.label} className="border-b border-rule align-top">
              <td className="py-3 pr-4 text-ink">{f.label}</td>
              <td className="py-3 pr-4 text-ink-muted">{f.stable}</td>
              <td className="py-3 pr-4 text-ink-muted">{f.unstable}</td>
              <td className="py-3">
                <TrendPill trend={f.trend} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TrendPill({ trend }: { trend: Trend }) {
  if (trend === "stable") {
    return (
      <span className="inline-flex items-center gap-2 rounded-pill border border-rule px-2 py-0.5 font-ui text-xs text-pine">
        <Dot className="bg-pine" /> Supports stability
      </span>
    );
  }
  if (trend === "unstable") {
    return (
      <span className="inline-flex items-center gap-2 rounded-pill border border-rule px-2 py-0.5 font-ui text-xs text-rust">
        <Dot className="bg-rust" /> Flags instability
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-pill border border-rule px-2 py-0.5 font-ui text-xs text-ink-muted">
      <Dot className="bg-ink-muted" /> Context dependent
    </span>
  );
}

function Dot({ className }: { className: string }) {
  return <span className={`h-1.5 w-1.5 rounded-full ${className}`} aria-hidden />;
}

/* ---------- chapter 04 ---------- */

function FurtherReading() {
  const items = [
    { n: "01", title: "Key points in avalanche awareness",   note: "Spotting the obvious signs you are trained to miss." },
    { n: "02", title: "European avalanche hazard scale",     note: "What each of the 1 – 5 bands actually asks you to do." },
    { n: "03", title: "Avalanche accidents",                 note: "Case studies with timing, terrain and the chain of calls." },
    { n: "04", title: "The search",                          note: "From beacon pattern to probe grid to shovel strategy." },
    { n: "05", title: "Immediate response to victims",       note: "Primary care for buried riders — training required." },
  ];
  return (
    <ul className="divide-y divide-rule border-y border-rule">
      {items.map((i) => (
        <li key={i.n} className="flex items-start gap-6 py-6">
          <span className="font-mono text-sm text-ink-faint">{i.n}</span>
          <div className="flex-1">
            <h4 className="font-display text-section">{i.title}</h4>
            <p className="mt-1 font-ui text-sm text-ink-muted">{i.note}</p>
          </div>
          <span className="label text-ink-faint">Up next</span>
        </li>
      ))}
    </ul>
  );
}

/* ---------- footer ---------- */

function ArticleFooter() {
  return (
    <footer className="border-t border-rule">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-16 font-ui text-xs text-ink-faint md:flex-row md:items-end md:justify-between md:px-10">
        <div>
          <span className="label">Credits</span>
          <p className="mt-2 text-ink-muted">
            Original words & photographs by Zeger Dox. Layout and tokens by
            HUX using the Oütlas Design System.
          </p>
        </div>
        <div className="font-mono text-ink-muted">
          Series &middot; Risk Space 01 &nbsp;·&nbsp; Winter 25/26
        </div>
      </div>
    </footer>
  );
}
