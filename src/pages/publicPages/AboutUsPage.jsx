import { useState, useEffect, useRef } from "react";

const PlaneIcon = ({ size = 80 }) => (
  <svg
    width={size * 3}
    height={size * 2}
    viewBox="0 0 240 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g filter="url(#shadow)">
      <path
        d="M200 70L40 30L60 80L40 130L200 90L220 80L200 70Z"
        fill="oklch(34.591% 0.04142 235.083)"
        opacity="0.9"
      />
      <path d="M200 70L220 80L200 90" fill="oklch(34.591% 0.04142 235.083)" />
      <path
        d="M60 80L80 60L140 55L80 80Z"
        fill="oklch(73.073% 0.17623 49.145)"
      />
      <path
        d="M60 80L80 100L140 105L80 80Z"
        fill="oklch(73.073% 0.17623 49.145)"
        opacity="0.7"
      />
      <rect
        x="90"
        y="70"
        width="60"
        height="20"
        rx="4"
        fill="rgba(255,255,255,0.15)"
      />
      <circle cx="100" cy="80" r="3" fill="rgba(255,255,255,0.4)" />
      <circle cx="115" cy="80" r="3" fill="rgba(255,255,255,0.4)" />
      <circle cx="130" cy="80" r="3" fill="rgba(255,255,255,0.4)" />
    </g>
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" floodOpacity="0.2" />
      </filter>
    </defs>
  </svg>
);

const stats = [
  { number: "4M+", label: "Passengers Served" },
  { number: "180+", label: "Destinations" },
  { number: "98%", label: "On-Time Rate" },
  { number: "14yrs", label: "In the Sky" },
];

const values = [
  {
    icon: "🛡️",
    title: "Safety First",
    desc: "Every route, every booking, every flight — safety is our non-negotiable standard. We partner only with verified, top-rated carriers.",
  },
  {
    icon: "✨",
    title: "Seamless Experience",
    desc: "From search to landing, we obsess over removing friction. A three-minute booking shouldn't feel like a chore.",
  },
  {
    icon: "🌍",
    title: "Global Reach",
    desc: "We connect you to 180+ destinations across 60 countries — from bustling capitals to hidden coastal gems.",
  },
  {
    icon: "💰",
    title: "Best Value",
    desc: "Our AI-powered fare engine monitors millions of prices daily to guarantee you're never overpaying.",
  },
  {
    icon: "🤝",
    title: "Human Support",
    desc: "Real people available 24/7 — not chatbots. Our travel specialists are one call away, always.",
  },
  {
    icon: "🌱",
    title: "Responsible Travel",
    desc: "Carbon offset programs and eco-routing options built into every booking, because travel and care aren't opposites.",
  },
];

const team = [
  {
    emoji: "👩🏽‍✈️",
    bg: "#fff3e9",
    name: "Amara Hassan",
    role: "CEO & Co-Founder",
    bio: "Former airline ops director with 20 years at Emirates. Built SkyRoute to reimagine how people fly.",
  },
  {
    emoji: "👨🏻‍💻",
    bg: "#e9f0ff",
    name: "Daniel Park",
    role: "CTO",
    bio: "Ex-Google engineer who built the fare prediction engine that powers our real-time pricing.",
  },
  {
    emoji: "👩🏼‍🎨",
    bg: "#f0ffe9",
    name: "Léa Moreau",
    role: "Chief Design Officer",
    bio: "Award-winning UX designer from Paris. Led redesigns for three European travel platforms.",
  },
  {
    emoji: "👨🏾‍💼",
    bg: "#ffe9f3",
    name: "Marcus Osei",
    role: "Head of Partnerships",
    bio: "Negotiated deals with 120+ airlines across 6 continents. Fluent in aviation policy and partnership law.",
  },
];

const timeline = [
  {
    year: "2011",
    event: "SkyRoute Founded",
    detail:
      "Amara and Daniel founded SkyRoute from a small Karachi flat with a bold vision: make global flight booking effortless.",
  },
  {
    year: "2013",
    event: "First Million Bookings",
    detail:
      "Reached one million bookings across South Asia & Middle East within 18 months of launch.",
  },
  {
    year: "2016",
    event: "AI Fare Engine Launched",
    detail:
      "Debuted our proprietary real-time fare intelligence system — cutting average ticket costs by 23%.",
  },
  {
    year: "2019",
    event: "Global Expansion",
    detail:
      "Opened offices in Dubai, London, and Singapore. Crossed 100 destination partnerships.",
  },
  {
    year: "2022",
    event: "4M Passengers",
    detail:
      "Welcomed our four-millionth passenger. Launched carbon offset program for all bookings.",
  },
  {
    year: "2024",
    event: "Sky is Not the Limit",
    detail:
      "Ranked #1 flight booking platform in South Asia for customer satisfaction. Expanding to 200+ routes.",
  },
];

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        }),
      { threshold: 0.12 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

// Reveal styles injected once
const revealStyles = `
  .reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease, transform 0.7s ease; }
  .reveal.visible { opacity: 1; transform: none; }
  .reveal-delay-1 { transition-delay: 0.1s; }
  .reveal-delay-2 { transition-delay: 0.2s; }
  .reveal-delay-3 { transition-delay: 0.3s; }
  .reveal-delay-4 { transition-delay: 0.4s; }
  @keyframes floatBlob { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(20px,-30px) scale(1.05); } }
  @keyframes planeDrift { 0%,100% { transform: translateY(-50%) rotate(-5deg); } 50% { transform: translateY(calc(-50% - 18px)) rotate(-3deg); } }
  .blob-1 { animation: floatBlob 8s ease-in-out infinite; }
  .blob-2 { animation: floatBlob 11s ease-in-out infinite reverse; }
  .plane-drift { animation: planeDrift 6s ease-in-out infinite; }
`;

export default function AboutUsPage() {
  useReveal();

  return (
    <>
      <style>{revealStyles}</style>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center px-12 pt-32 pb-16 overflow-hidden">
        {/* Grid bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.04) 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Blobs */}
        <div className="blob-1 absolute rounded-full pointer-events-none w-150 h-150 blur-3xl -top-37.5 -right-25 opacity-30 bg-pumpkin" />
        <div className="blob-2 absolute rounded-full pointer-events-none  w-100 h-100 opacity-20 blur-2xl -bottom-25 left-[30%] bg-pumpkin" />

        {/* Content */}
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-pumpkin text-white text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6">
            ✈ About SkyRoute
          </div>
          <h1 className="font-extrabold leading-[1.03] tracking-tight mb-6 text-charcoal-50 text-5xl">
            We Don't Just Book
            <br />
            <span className="text-pumpkin">Flights.</span> We Open
            <br />
            Horizons.
          </h1>
          <p className="text-base leading-relaxed text-charcoal-100 max-w-130 mb-6">
            SkyRoute was born from a simple frustration: why is booking a flight
            still complicated? Since 2011, we've made it our mission to change
            that — connecting millions of travellers to the world, effortlessly.
          </p>
          <div className="flex gap-4 items-center">
            <button className="bg-[var(--color-charcoal)] text-white px-8 py-3.5 rounded-full text-sm font-semibold transition-all duration-150 hover:-translate-y-0.5 hover:shadow-xl cursor-pointer border-none font-[DM_Sans,sans-serif]">
              Explore Destinations
            </button>
            <button className="bg-transparent text-[var(--color-charcoal)] px-8 py-3.5 rounded-full text-sm font-medium border border-[var(--color-charcoal-100)] transition-all duration-200 hover:border-[var(--color-pumpkin)] hover:text-[var(--color-pumpkin)] cursor-pointer font-[DM_Sans,sans-serif]">
              Our Story ↓
            </button>
          </div>
        </div>

        {/* Plane */}
        <div
          className="plane-drift absolute right-16 top-1/2 z-10 opacity-[0.92] hidden lg:block"
          style={{ top: "50%", transform: "translateY(-50%)" }}
        >
          <PlaneIcon size={80} />
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="bg-[var(--color-charcoal)] flex justify-center items-stretch flex-wrap">
        {stats.map((s, i) => (
          <div
            key={i}
            className="flex-1 max-w-[240px] min-w-[50%] sm:min-w-0 px-6 py-8 text-center border-r border-white/10 last:border-r-0 hover:bg-[var(--color-charcoal-50)] transition-colors duration-200"
          >
            <div
              className="font-black text-[var(--color-pumpkin)] leading-none text-[2.5rem]"
              style={{ fontFamily: "'Playfair Display',serif" }}
            >
              {s.number}
            </div>
            <div className="text-[0.8rem] font-medium tracking-widest uppercase text-white/55 mt-1.5">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── MISSION ── */}
      <section className="py-24 px-12 bg-[var(--color-surface)]">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Text */}
            <div className="reveal">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[var(--color-pumpkin)] mb-4">
                Our Mission
              </span>
              <h2
                className="font-black leading-[1.15] tracking-tight text-[var(--color-charcoal)] mb-5"
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "clamp(2rem,4vw,3rem)",
                  letterSpacing: "-0.02em",
                }}
              >
                Travel Should Feel Like Freedom, Not a Form
              </h2>
              <p className="text-base leading-relaxed text-[var(--color-charcoal-100)]">
                We founded SkyRoute because the world's most exciting thing —
                getting on a plane to somewhere new — was buried under confusing
                interfaces, hidden fees, and outdated tech.
              </p>
              <p className="text-base leading-relaxed text-[var(--color-charcoal-100)] mt-4">
                Today, our platform serves over four million travellers
                annually. But our obsession remains the same: a booking
                experience so smooth, so transparent, so human, that the only
                thing left to feel is excitement.
              </p>
            </div>

            {/* Visual */}
            <div className="reveal reveal-delay-2 relative pb-8 pr-8">
              <div className="relative bg-[var(--color-pumpkin)] rounded-3xl p-12 text-white overflow-hidden">
                {/* decorative circles */}
                <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute -bottom-16 -left-8 w-40 h-40 rounded-full bg-black/[0.08] pointer-events-none" />
                <div
                  className="font-black text-white/25 leading-[0.7] mb-2 relative z-10"
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: "5rem",
                  }}
                >
                  "
                </div>
                <p
                  className="italic leading-snug relative z-10 text-[1.4rem]"
                  style={{ fontFamily: "'Playfair Display',serif" }}
                >
                  The best journey begins the moment you decide to go. We make
                  sure nothing gets in the way of that decision.
                </p>
              </div>
              {/* Float card */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl px-6 py-5 shadow-2xl flex items-center gap-4 min-w-[220px]">
                <div className="w-11 h-11 rounded-xl bg-[var(--color-card)] flex items-center justify-content-center shrink-0 text-[1.4rem] flex items-center justify-center">
                  🏆
                </div>
                <div>
                  <div className="font-bold text-base text-[var(--color-charcoal)]">
                    #1 in South Asia
                  </div>
                  <div className="text-xs text-[var(--color-charcoal-100)]">
                    Customer Satisfaction 2024
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="py-24 px-12 bg-[var(--color-card)]">
        <div className="max-w-[1100px] mx-auto">
          <div className="reveal text-center max-w-[520px] mx-auto">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[var(--color-pumpkin)] mb-4">
              Our Values
            </span>
            <h2
              className="font-black leading-[1.15] tracking-tight text-[var(--color-charcoal)]"
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "clamp(2rem,4vw,3rem)",
                letterSpacing: "-0.02em",
              }}
            >
              What We Stand For, Every Single Flight
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {values.map((v, i) => (
              <div
                key={i}
                className={`reveal reveal-delay-${(i % 3) + 1} bg-white rounded-[20px] p-8 border border-black/[0.06] transition-all duration-300 cursor-default hover:-translate-y-1.5 hover:shadow-2xl`}
              >
                <div
                  className="font-black text-[var(--color-pumpkin-100)] leading-none mb-3 opacity-40"
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: "3rem",
                  }}
                >
                  0{i + 1}
                </div>
                <div className="text-3xl mb-3">{v.icon}</div>
                <div
                  className="font-bold text-[var(--color-charcoal)] text-[1.2rem] mb-2"
                  style={{ fontFamily: "'Playfair Display',serif" }}
                >
                  {v.title}
                </div>
                <p className="text-sm leading-relaxed text-[var(--color-charcoal-100)]">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="py-24 px-12 bg-[var(--color-surface)]">
        <div className="max-w-[1100px] mx-auto">
          <div className="reveal text-center max-w-[480px] mx-auto">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[var(--color-pumpkin)] mb-4">
              The People
            </span>
            <h2
              className="font-black leading-[1.15] tracking-tight text-[var(--color-charcoal)]"
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "clamp(2rem,4vw,3rem)",
                letterSpacing: "-0.02em",
              }}
            >
              Built by Travellers, for Travellers
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {team.map((m, i) => (
              <div
                key={i}
                className={`reveal reveal-delay-${i + 1} bg-white rounded-[20px] overflow-hidden border border-black/[0.06] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl`}
              >
                <div
                  className="w-full aspect-square flex items-center justify-center text-[4.5rem]"
                  style={{ background: m.bg }}
                >
                  {m.emoji}
                </div>
                <div className="p-5">
                  <div
                    className="font-bold text-base text-[var(--color-charcoal)]"
                    style={{ fontFamily: "'Playfair Display',serif" }}
                  >
                    {m.name}
                  </div>
                  <div className="text-[0.8rem] text-[var(--color-pumpkin)] font-medium mt-0.5">
                    {m.role}
                  </div>
                  <p className="text-[0.8rem] text-[var(--color-charcoal-100)] mt-2 leading-relaxed">
                    {m.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="py-24 px-12 bg-[var(--color-card)]">
        <div className="max-w-[1100px] mx-auto">
          <div className="reveal text-center max-w-[480px] mx-auto">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[var(--color-pumpkin)] mb-4">
              Our Journey
            </span>
            <h2
              className="font-black leading-[1.15] tracking-tight text-[var(--color-charcoal)]"
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "clamp(2rem,4vw,3rem)",
                letterSpacing: "-0.02em",
              }}
            >
              A Decade of Taking Off
            </h2>
          </div>

          <div className="relative mt-12">
            {/* Center line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 pointer-events-none"
              style={{
                left: "50%",
                transform: "translateX(-50%)",
                background:
                  "linear-gradient(to bottom, var(--color-pumpkin), transparent)",
              }}
            />
            {/* Mobile left line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 pointer-events-none lg:hidden"
              style={{
                left: 24,
                background:
                  "linear-gradient(to bottom, var(--color-pumpkin), transparent)",
              }}
            />

            {timeline.map((t, i) => (
              <div
                key={i}
                className={`reveal reveal-delay-${(i % 3) + 1} flex items-start mb-12 relative
                  ${i % 2 === 0 ? "flex-row-reverse lg:flex-row-reverse" : "flex-col lg:flex-row"}
                  flex-col lg:flex-row
                `}
                style={{ flexDirection: i % 2 === 0 ? undefined : undefined }}
              >
                {/* Dot — centered on the line */}
                <div
                  className="absolute w-4 h-4 rounded-full bg-[var(--color-pumpkin)] border-[3px] border-white z-10 shrink-0"
                  style={{
                    left: "50%",
                    transform: "translateX(-50%)",
                    top: 4,
                    boxShadow: "0 0 0 3px var(--color-pumpkin-100)",
                  }}
                />
                {/* Mobile dot */}
                <div
                  className="lg:hidden absolute w-4 h-4 rounded-full bg-[var(--color-pumpkin)] border-[3px] border-white z-10 shrink-0"
                  style={{
                    left: 24,
                    transform: "translateX(-50%)",
                    top: 4,
                    boxShadow: "0 0 0 3px var(--color-pumpkin-100)",
                  }}
                />

                {/* Content */}
                <div
                  className={`flex-1 pl-12 lg:pl-0
                    ${i % 2 === 0 ? "lg:text-right lg:mr-12" : "lg:ml-12"}
                  `}
                >
                  <div
                    className="font-bold text-[0.8rem] tracking-wide text-[var(--color-pumpkin)] mb-1"
                    style={{ fontFamily: "'Playfair Display',serif" }}
                  >
                    {t.year}
                  </div>
                  <div
                    className="font-bold text-[1.1rem] text-[var(--color-charcoal)]"
                    style={{ fontFamily: "'Playfair Display',serif" }}
                  >
                    {t.event}
                  </div>
                  <p className="text-sm text-[var(--color-charcoal-100)] mt-1 leading-relaxed">
                    {t.detail}
                  </p>
                </div>

                {/* Spacer for opposite side */}
                <div className="hidden lg:block flex-1" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="relative py-24 px-12 text-center bg-[var(--color-charcoal)] overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 50% 50%, oklch(73% 0.17 49 / 0.12), transparent)",
          }}
        />
        <h2
          className="relative font-black text-white tracking-tight mb-4"
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "clamp(2.5rem,5vw,4rem)",
            letterSpacing: "-0.02em",
          }}
        >
          Ready to Go{" "}
          <em className="italic text-[var(--color-pumpkin)]">Somewhere</em>?
        </h2>
        <p className="relative text-base text-white/60 mb-8">
          180+ destinations. Millions of happy travellers. Your next adventure
          is one click away.
        </p>
        <button className="relative bg-[var(--color-pumpkin)] text-white border-none cursor-pointer text-base font-bold px-10 py-4 rounded-full transition-all duration-150 hover:-translate-y-0.5 hover:shadow-2xl font-[DM_Sans,sans-serif]">
          Book Your Flight →
        </button>
      </section>
    </>
  );
}
