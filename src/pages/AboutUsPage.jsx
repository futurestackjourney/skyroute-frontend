import { useState, useEffect, useRef } from "react";

const stats = [
  { value: "12M+", label: "Happy Travelers" },
  { value: "190+", label: "Countries Served" },
  { value: "850+", label: "Airline Partners" },
  { value: "99.2%", label: "On-Time Booking" },
];

const team = [
  {
    name: "Layla Hassan",
    role: "Chief Executive Officer",
    bio: "Former aviation director with 18 years shaping the future of air travel.",
    initials: "LH",
    color: "#0ea5e9",
  },
  {
    name: "James Okafor",
    role: "Chief Technology Officer",
    bio: "Ex-NASA engineer who reimagined flight booking from the ground up.",
    initials: "JO",
    color: "#38bdf8",
  },
  {
    name: "Sofia Reyes",
    role: "Head of Experience",
    bio: "Crafts journeys that feel effortless — from search to touchdown.",
    initials: "SR",
    color: "#7dd3fc",
  },
  {
    name: "Marcus Chen",
    role: "Head of Partnerships",
    bio: "Built our global airline network across 6 continents in 3 years.",
    initials: "MC",
    color: "#bae6fd",
  },
];

const values = [
  {
    icon: "✦",
    title: "Transparency First",
    desc: "No hidden fees. No fine print surprises. Every cost is visible before you commit.",
  },
  {
    icon: "◈",
    title: "Speed as Respect",
    desc: "Your time is precious. We built our engine to deliver results in under a second.",
  },
  {
    icon: "⬡",
    title: "Human at Heart",
    desc: "Real support, real people — available around the clock across every timezone.",
  },
  {
    icon: "◎",
    title: "Always Improving",
    desc: "We ship new features every two weeks, guided entirely by traveler feedback.",
  },
];

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function AnimatedNumber({ target }) {
  const [display, setDisplay] = useState("0");
  const [ref, inView] = useInView();
  useEffect(() => {
    if (!inView) return;
    const num = parseFloat(target.replace(/[^0-9.]/g, ""));
    const suffix = target.replace(/[0-9.]/g, "");
    let start = 0;
    const steps = 60;
    const inc = num / steps;
    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      start += inc;
      if (frame >= steps) { setDisplay(target); clearInterval(timer); }
      else setDisplay(Math.floor(start) + suffix);
    }, 20);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{display}</span>;
}

export default function AboutUs() {
  const [heroRef, heroIn] = useInView(0.05);
  const [missionRef, missionIn] = useInView();
  const [valuesRef, valuesIn] = useInView();
  const [teamRef, teamIn] = useInView();
  const [ctaRef, ctaIn] = useInView();

  return (
    <div style={{ fontFamily: "'Sora', 'DM Sans', sans-serif", background: "#020B18", color: "#e2f0ff", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .fade-up { opacity: 0; transform: translateY(36px); transition: opacity 0.75s cubic-bezier(.22,1,.36,1), transform 0.75s cubic-bezier(.22,1,.36,1); }
        .fade-up.in { opacity: 1; transform: translateY(0); }
        .delay-1 { transition-delay: 0.12s; }
        .delay-2 { transition-delay: 0.24s; }
        .delay-3 { transition-delay: 0.36s; }
        .delay-4 { transition-delay: 0.48s; }

        .glow-line { background: linear-gradient(90deg, transparent, #0ea5e9, transparent); height: 1px; width: 100%; }
        
        .nav-link { color: #7dd3fc; text-decoration: none; font-size: 0.85rem; letter-spacing: 0.06em; font-weight: 500; transition: color 0.2s; }
        .nav-link:hover { color: #fff; }

        .sky-btn {
          background: linear-gradient(135deg, #0284c7, #0ea5e9);
          color: #fff;
          border: none;
          border-radius: 50px;
          padding: 12px 32px;
          font-family: inherit;
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 0 24px rgba(14,165,233,0.35);
        }
        .sky-btn:hover { transform: translateY(-2px); box-shadow: 0 0 36px rgba(14,165,233,0.55); }

        .plane-trail {
          position: absolute;
          width: 2px;
          background: linear-gradient(180deg, transparent, #38bdf8, transparent);
          animation: trail 3s ease-in-out infinite;
        }
        @keyframes trail { 0%,100%{opacity:0;} 50%{opacity:0.6;} }

        .orbit {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(14,165,233,0.12);
          animation: spin linear infinite;
        }
        @keyframes spin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }

        .stat-card {
          background: rgba(14,165,233,0.04);
          border: 1px solid rgba(14,165,233,0.15);
          border-radius: 16px;
          padding: 28px 24px;
          text-align: center;
          transition: border-color 0.3s, background 0.3s;
          backdrop-filter: blur(8px);
        }
        .stat-card:hover { border-color: rgba(14,165,233,0.45); background: rgba(14,165,233,0.08); }

        .value-card {
          background: rgba(2,11,24,0.6);
          border: 1px solid rgba(14,165,233,0.12);
          border-radius: 20px;
          padding: 32px 28px;
          transition: transform 0.3s, border-color 0.3s;
          backdrop-filter: blur(10px);
        }
        .value-card:hover { transform: translateY(-6px); border-color: rgba(14,165,233,0.35); }

        .team-card {
          background: rgba(14,165,233,0.03);
          border: 1px solid rgba(14,165,233,0.1);
          border-radius: 20px;
          padding: 36px 28px;
          text-align: center;
          transition: transform 0.3s, border-color 0.3s;
        }
        .team-card:hover { transform: translateY(-8px); border-color: rgba(14,165,233,0.3); }

        .avatar {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          font-weight: 700;
          margin: 0 auto 20px;
          border: 2px solid rgba(14,165,233,0.3);
        }

        .timeline-dot {
          width: 12px; height: 12px;
          border-radius: 50%;
          background: #0ea5e9;
          box-shadow: 0 0 12px #0ea5e9;
          flex-shrink: 0;
          margin-top: 4px;
        }

        .noise {
          position: fixed; inset: 0; pointer-events: none; z-index: 1;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.35;
        }

        section { position: relative; z-index: 2; }
      `}</style>

      {/* Noise overlay */}
      <div className="noise" />

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid rgba(14,165,233,0.1)", backdropFilter: "blur(20px)", background: "rgba(2,11,24,0.8)", padding: "0 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M4 20L14 4L24 20" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 16h12" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="14" cy="4" r="2" fill="#38bdf8"/>
            </svg>
            <span style={{ fontWeight: 800, fontSize: "1.15rem", letterSpacing: "0.02em", color: "#fff" }}>SKY<span style={{ color: "#0ea5e9" }}>ROUTE</span></span>
          </div>
          <div style={{ display: "flex", gap: 36 }}>
            {["Home", "Flights", "About", "Contact"].map(l => (
              <a key={l} href="#" className="nav-link" style={{ color: l === "About" ? "#fff" : undefined }}>{l}</a>
            ))}
          </div>
          <button className="sky-btn" style={{ padding: "9px 22px", fontSize: "0.8rem" }}>Book Now</button>
        </div>
      </nav>

      {/* HERO */}
      <section ref={heroRef} style={{ minHeight: "88vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", padding: "0 40px" }}>
        {/* Decorative orbits */}
        <div className="orbit" style={{ width: 600, height: 600, top: "50%", left: "60%", transform: "translate(-50%,-50%)", animationDuration: "40s" }} />
        <div className="orbit" style={{ width: 400, height: 400, top: "50%", left: "60%", transform: "translate(-50%,-50%)", animationDuration: "25s" }} />
        <div className="orbit" style={{ width: 200, height: 200, top: "50%", left: "60%", transform: "translate(-50%,-50%)", animationDuration: "14s" }} />

        {/* Globe glow */}
        <div style={{ position: "absolute", right: "8%", top: "50%", transform: "translateY(-50%)", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle at 40% 40%, rgba(14,165,233,0.18), rgba(2,132,199,0.06) 60%, transparent)", border: "1px solid rgba(14,165,233,0.2)", boxShadow: "0 0 80px rgba(14,165,233,0.12)" }} />

        {/* Plane trails */}
        {[120, 220, 320].map((h, i) => (
          <div key={i} className="plane-trail" style={{ height: h, left: `${55 + i * 8}%`, top: `${20 + i * 12}%`, animationDelay: `${i * 1}s`, animationDuration: `${3 + i}s` }} />
        ))}

        {/* Mesh gradient */}
        <div style={{ position: "absolute", top: -200, left: -200, width: 800, height: 800, background: "radial-gradient(ellipse at center, rgba(14,165,233,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", position: "relative", zIndex: 2 }}>
          <div className={`fade-up ${heroIn ? "in" : ""}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.25)", borderRadius: 50, padding: "6px 18px", marginBottom: 32 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0ea5e9", display: "inline-block", boxShadow: "0 0 8px #0ea5e9" }} />
            <span style={{ fontSize: "0.78rem", color: "#7dd3fc", letterSpacing: "0.1em", fontWeight: 500 }}>ABOUT SKYROUTE</span>
          </div>

          <h1 className={`fade-up delay-1 ${heroIn ? "in" : ""}`} style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)", fontWeight: 800, lineHeight: 1.06, maxWidth: 680, marginBottom: 28 }}>
            We make the{" "}
            <span style={{ background: "linear-gradient(135deg, #38bdf8, #0284c7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              sky accessible
            </span>{" "}
            to everyone.
          </h1>

          <p className={`fade-up delay-2 ${heroIn ? "in" : ""}`} style={{ fontSize: "1.1rem", color: "#93c5fd", maxWidth: 520, lineHeight: 1.75, marginBottom: 40, fontWeight: 300 }}>
            SkyRoute was built on one conviction — booking a flight should feel as light as the journey itself. We connect travelers to 190+ countries with clarity, speed, and care.
          </p>

          <div className={`fade-up delay-3 ${heroIn ? "in" : ""}`} style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <button className="sky-btn">Explore Our Story</button>
            <button style={{ background: "transparent", border: "1px solid rgba(14,165,233,0.3)", color: "#7dd3fc", borderRadius: 50, padding: "12px 28px", fontFamily: "inherit", fontSize: "0.9rem", fontWeight: 500, cursor: "pointer", transition: "border-color 0.2s, color 0.2s" }}
              onMouseOver={e => { e.target.style.borderColor = "rgba(14,165,233,0.7)"; e.target.style.color = "#fff"; }}
              onMouseOut={e => { e.target.style.borderColor = "rgba(14,165,233,0.3)"; e.target.style.color = "#7dd3fc"; }}>
              Meet the Team ↓
            </button>
          </div>
        </div>
      </section>

      <div className="glow-line" />

      {/* STATS */}
      <section style={{ padding: "80px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <div style={{ fontSize: "2.4rem", fontWeight: 800, color: "#38bdf8", marginBottom: 6 }}>
                <AnimatedNumber target={s.value} />
              </div>
              <div style={{ fontSize: "0.82rem", color: "#7dd3fc", letterSpacing: "0.08em", fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="glow-line" />

      {/* MISSION */}
      <section ref={missionRef} style={{ padding: "100px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          {/* Left: Timeline */}
          <div className={`fade-up ${missionIn ? "in" : ""}`}>
            <p style={{ fontSize: "0.75rem", letterSpacing: "0.14em", color: "#0ea5e9", fontWeight: 600, marginBottom: 16 }}>OUR JOURNEY</p>
            <h2 style={{ fontSize: "2.4rem", fontWeight: 800, marginBottom: 48, lineHeight: 1.2 }}>From a startup<br />to the sky.</h2>
            {[
              { year: "2014", text: "Founded in a Karachi co-working space with 3 engineers and a dream." },
              { year: "2017", text: "Reached 1 million bookings. Launched mobile app. Expanded to 40 countries." },
              { year: "2020", text: "Pivoted to flexible booking during the pandemic — protecting travelers worldwide." },
              { year: "2024", text: "190+ countries, 850 airline partners, and still growing every single day." },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 20, marginBottom: 28 }} className={`fade-up delay-${i + 1} ${missionIn ? "in" : ""}`}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div className="timeline-dot" />
                  {i < 3 && <div style={{ width: 1, flex: 1, background: "rgba(14,165,233,0.2)", marginTop: 6 }} />}
                </div>
                <div style={{ paddingBottom: 20 }}>
                  <div style={{ fontSize: "0.78rem", color: "#0ea5e9", fontWeight: 700, letterSpacing: "0.06em", marginBottom: 4 }}>{item.year}</div>
                  <div style={{ fontSize: "0.95rem", color: "#bfdbfe", lineHeight: 1.65, fontWeight: 300 }}>{item.text}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Mission card */}
          <div className={`fade-up delay-2 ${missionIn ? "in" : ""}`}>
            <div style={{ background: "linear-gradient(135deg, rgba(14,165,233,0.08), rgba(2,132,199,0.04))", border: "1px solid rgba(14,165,233,0.18)", borderRadius: 28, padding: 48, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.15), transparent)" }} />
              <div style={{ fontSize: "3rem", marginBottom: 24 }}>🌐</div>
              <h3 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: 16 }}>Our Mission</h3>
              <p style={{ color: "#93c5fd", lineHeight: 1.8, fontWeight: 300, marginBottom: 28 }}>
                To democratize air travel by making every route — from the most popular to the most remote — discoverable, affordable, and bookable in seconds.
              </p>
              <div style={{ height: 1, background: "rgba(14,165,233,0.2)", marginBottom: 28 }} />
              <h3 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: 16 }}>Our Vision</h3>
              <p style={{ color: "#93c5fd", lineHeight: 1.8, fontWeight: 300 }}>
                A world where distance is no barrier — where every traveler, regardless of budget or destination, finds their perfect route through SkyRoute.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="glow-line" />

      {/* VALUES */}
      <section ref={valuesRef} style={{ padding: "100px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className={`fade-up ${valuesIn ? "in" : ""}`} style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: "0.75rem", letterSpacing: "0.14em", color: "#0ea5e9", fontWeight: 600, marginBottom: 12 }}>WHAT DRIVES US</p>
            <h2 style={{ fontSize: "2.4rem", fontWeight: 800, lineHeight: 1.2 }}>Values we fly by.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
            {values.map((v, i) => (
              <div key={i} className={`value-card fade-up delay-${i + 1} ${valuesIn ? "in" : ""}`}>
                <div style={{ fontSize: "1.8rem", marginBottom: 20, color: "#0ea5e9" }}>{v.icon}</div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 12 }}>{v.title}</h3>
                <p style={{ color: "#7dd3fc", fontSize: "0.9rem", lineHeight: 1.7, fontWeight: 300 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="glow-line" />

      {/* TEAM */}
      <section ref={teamRef} style={{ padding: "100px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className={`fade-up ${teamIn ? "in" : ""}`} style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: "0.75rem", letterSpacing: "0.14em", color: "#0ea5e9", fontWeight: 600, marginBottom: 12 }}>THE CREW</p>
            <h2 style={{ fontSize: "2.4rem", fontWeight: 800 }}>Meet the navigators.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
            {team.map((m, i) => (
              <div key={i} className={`team-card fade-up delay-${i + 1} ${teamIn ? "in" : ""}`}>
                <div className="avatar" style={{ background: `${m.color}18`, borderColor: `${m.color}40` }}>
                  <span style={{ color: m.color }}>{m.initials}</span>
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 4 }}>{m.name}</h3>
                <p style={{ fontSize: "0.75rem", color: "#0ea5e9", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 12 }}>{m.role}</p>
                <p style={{ fontSize: "0.875rem", color: "#7dd3fc", lineHeight: 1.65, fontWeight: 300 }}>{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="glow-line" />

      {/* CTA */}
      <section ref={ctaRef} style={{ padding: "100px 40px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <div className={`fade-up ${ctaIn ? "in" : ""}`} style={{ background: "linear-gradient(135deg, rgba(14,165,233,0.1), rgba(2,132,199,0.05))", border: "1px solid rgba(14,165,233,0.2)", borderRadius: 32, padding: "64px 48px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center top, rgba(14,165,233,0.12), transparent 60%)", pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 2 }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 20 }}>✈️</div>
              <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 16 }}>Ready for takeoff?</h2>
              <p style={{ color: "#93c5fd", marginBottom: 36, lineHeight: 1.75, fontWeight: 300, fontSize: "1.05rem" }}>
                Join millions of travelers who trust SkyRoute to get them where they need to be — seamlessly, every time.
              </p>
              <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                <button className="sky-btn">Start Booking</button>
                <button style={{ background: "transparent", border: "1px solid rgba(14,165,233,0.3)", color: "#7dd3fc", borderRadius: 50, padding: "12px 28px", fontFamily: "inherit", fontSize: "0.9rem", fontWeight: 500, cursor: "pointer" }}>
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(14,165,233,0.1)", padding: "32px 40px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}>
          <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
            <path d="M4 20L14 4L24 20" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 16h12" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#fff" }}>SKY<span style={{ color: "#0ea5e9" }}>ROUTE</span></span>
        </div>
        <p style={{ fontSize: "0.8rem", color: "#334155" }}>© 2026 SkyRoute. All rights reserved. Built for travelers, by travelers.</p>
      </footer>
    </div>
  );
}