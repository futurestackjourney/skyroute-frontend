import { useEffect, useRef, useState } from "react";
import { ArrowRight, Hotel, Plane, Tag, Clock, Users, Star } from "lucide-react";
import { getAllActiveDeals } from "../../api/deals";
import { showError } from "../../utils/toast";
import BookDealModal from "../../components/modals/commonmodals/BookDealModal";

const IMAGE_BASE_URL = "https://localhost:7042";
import { BASE_URL } from "../../config";

/* ─────────────────── COUNTDOWN ─────────────────── */
function useCountdown(targetHours = 6) {
  const [secs, setSecs] = useState(targetHours * 3600);
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : targetHours * 3600)), 1000);
    return () => clearInterval(t);
  }, [targetHours]);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0"));
}

/* ─────────────────── DEAL CARD ─────────────────── */
function DealCard({ deal, onBook, index }) {
  const cardRef = useRef(null);
  const isValid = new Date(deal.validTo) > new Date();

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(40px)";
    const timeout = setTimeout(() => {
      el.style.transition = `opacity 0.6s ease ${index * 0.07}s, transform 0.6s ease ${index * 0.07}s`;
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 80);
    return () => clearTimeout(timeout);
  }, [index]);

  const savings = Math.round(deal.originalPrice - deal.dealPrice);
  const validDays = Math.max(0, Math.ceil((new Date(deal.validTo) - new Date()) / 86400000));

  return (
    <div
      ref={cardRef}
      className="group bg-white rounded-3xl overflow-hidden flex flex-col border border-black/5 cursor-pointer"
      style={{ boxShadow: "0 2px 16px rgba(0,0,0,.06)" }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 24px 64px rgba(0,0,0,.13)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,.06)")}
    >
      {/* Image / Hero */}
      <div className="relative h-44 overflow-hidden bg-charcoal flex items-center justify-center">
        {deal.hotelImageUrl ? (
          <img
            src={`${BASE_URL}${deal.hotelImageUrl}`}
            alt={deal.hotelName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-charcoal to-charcoal/60 flex items-center justify-center">
            <Hotel size={32} className="text-white/20" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Route badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5">
          <Plane size={10} className="text-white" />
          <span className="text-[.65rem] font-bold text-white tracking-wide">
            {deal.origin} → {deal.destination}
          </span>
        </div>

        {/* Discount badge */}
        <div className="absolute top-3 right-3 w-12 h-12 rounded-full bg-pumpkin flex flex-col items-center justify-center shadow-lg">
          <span className="text-white font-black text-sm leading-none">{deal.discountPercentage}%</span>
          <span className="text-white/80 text-[.5rem] uppercase tracking-wide">off</span>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-3 left-4 right-4">
          <p className="text-white font-black text-base leading-tight">{deal.hotelName}</p>
          <p className="text-white/70 text-[.72rem]">{deal.hotelCity}, {deal.hotelCountry}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col gap-3">
        {/* Title */}
        <div>
          <h3 className="font-black text-charcoal text-[1rem] leading-snug">{deal.title}</h3>
          {deal.description && (
            <p className="text-[.75rem] text-gray-400 mt-0.5 line-clamp-2">{deal.description}</p>
          )}
        </div>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-1.5">
          <span className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1 text-[.65rem] font-semibold text-gray-500">
            <Hotel size={9} /> {deal.roomType}
          </span>
          <span className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1 text-[.65rem] font-semibold text-gray-500">
            <Clock size={9} /> {deal.nights} nights
          </span>
          <span className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1 text-[.65rem] font-semibold text-gray-500">
            <Users size={9} /> {deal.maxGuests} guests
          </span>
          {validDays <= 3 && validDays > 0 && (
            <span className="flex items-center gap-1 bg-red-50 border border-red-100 rounded-full px-2.5 py-1 text-[.65rem] font-bold text-red-500">
              🔥 {validDays}d left
            </span>
          )}
        </div>

        {/* Airline */}
        <div className="flex items-center gap-1.5 text-[.72rem] text-gray-400">
          <Plane size={10} className="text-pumpkin" />
          <span className="font-medium">{deal.airlineName}</span>
          <span className="text-gray-200">·</span>
          <span>{deal.origin} → {deal.destination}</span>
        </div>

        {/* Pricing + CTA */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[.7rem] text-gray-400 line-through">
              USD {deal.originalPrice?.toLocaleString()}
            </p>
            <p className="text-[1.4rem] font-black text-charcoal leading-none">
              {deal.dealPrice?.toLocaleString()}
              <span className="text-xs font-normal text-gray-400 ml-1">USD</span>
            </p>
            <p className="text-[.65rem] text-pumpkin font-bold mt-0.5">
              Save USD {savings.toLocaleString()}
            </p>
          </div>

          <button
            onClick={() => onBook(deal)}
            disabled={!isValid}
            className="flex items-center gap-2 bg-charcoal hover:bg-pumpkin text-white rounded-full px-5 py-2.5 text-[.78rem] font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isValid ? "Book Now" : "Expired"}
            {isValid && <ArrowRight size={13} />}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── FEATURED DEAL ─────────────────── */
function FeaturedDeal({ deal, onBook }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    setTimeout(() => {
      el.style.transition = "opacity 0.8s ease, transform 0.8s ease";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 200);
  }, []);

  return (
    <div
      ref={ref}
      className="rounded-[28px] overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-80 cursor-pointer group"
      style={{ background: "linear-gradient(135deg, #1a2a35, #233d4c)", boxShadow: "0 30px 80px rgba(0,0,0,.18)" }}
      onClick={() => onBook(deal)}
    >
      {/* Left */}
      <div className="p-10 md:p-12 flex flex-col justify-between">
        <div>
          <span className="inline-flex items-center gap-2 bg-pumpkin text-white text-[.65rem] font-black uppercase tracking-widest rounded-full px-4 py-1.5 mb-5">
            <Star size={9} fill="white" /> Editor's Pick · {deal.discountPercentage}% OFF
          </span>
          <h2 className="text-white font-black text-3xl md:text-4xl leading-[1.1] mb-3">
            {deal.title}
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            {deal.description}
          </p>
        </div>
        <div>
          <div className="flex items-baseline gap-3 mt-6">
            <span className="text-white/40 text-sm line-through">USD {deal.originalPrice?.toLocaleString()}</span>
            <span className="text-pumpkin font-black text-4xl leading-none">{deal.dealPrice?.toLocaleString()}</span>
            <span className="text-white/40 text-sm">USD</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onBook(deal); }}
            className="mt-6 inline-flex items-center gap-2 bg-white text-charcoal font-bold text-sm rounded-full px-7 py-3 hover:bg-pumpkin hover:text-white transition-all duration-200"
          >
            Book This Deal <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Right */}
      <div className="relative overflow-hidden min-h-64">
        {deal.hotelImageUrl ? (
          <img
            src={`${BASE_URL}${deal.hotelImageUrl}`}
            alt={deal.hotelName}
            className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-white/5" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a2a35]/80 to-transparent md:from-transparent" />
        <div className="absolute bottom-6 left-6">
          <p className="text-white font-black text-xl">{deal.hotelName}</p>
          <p className="text-white/60 text-sm">{deal.hotelCity}, {deal.hotelCountry}</p>
        </div>
        <div className="absolute top-5 right-5 flex flex-col items-center justify-center bg-pumpkin w-16 h-16 rounded-full shadow-xl">
          <span className="text-white font-black text-lg leading-none">{deal.discountPercentage}%</span>
          <span className="text-white/80 text-[.5rem] uppercase tracking-wide">off</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── HERO ─────────────────── */
function Hero({ totalDeals }) {
  const heroRef = useRef(null);
  const [h, m, s] = useCountdown(8);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const children = el.querySelectorAll(".hero-item");
    children.forEach((child, i) => {
      child.style.opacity = "0";
      child.style.transform = "translateY(32px)";
      setTimeout(() => {
        child.style.transition = `opacity 0.7s ease ${i * 0.12}s, transform 0.7s ease ${i * 0.12}s`;
        child.style.opacity = "1";
        child.style.transform = "translateY(0)";
      }, 50);
    });
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden min-h-[52vh] flex flex-col items-center justify-center text-center px-6 pt-32 pb-16"
      style={{ background: "#f7f9fb" }}
    >
      {/* Dot texture */}
      <div className="absolute inset-0 pointer-events-none opacity-40"
        style={{ backgroundImage: "radial-gradient(circle, rgba(0,0,0,.07) 1px, transparent 1px)", backgroundSize: "26px 26px" }} />

      {/* Blobs */}
      <div className="absolute w-96 h-96 rounded-full pointer-events-none bg-pumpkin/25 -top-20 -left-32 blur-[100px]"
        style={{ animation: "blobFloat 10s ease-in-out infinite" }} />
      <div className="absolute w-64 h-64 rounded-full pointer-events-none bg-pumpkin/20 bottom-0 -right-20 blur-[80px]"
        style={{ animation: "blobFloat 13s ease-in-out infinite reverse" }} />

      <style>{`
        @keyframes blobFloat { 0%,100%{transform:translate(0,0)} 50%{transform:translate(12px,-18px)} }
        @keyframes tickerScroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.6);opacity:.5} }
      `}</style>

      {/* Ticker */}
      <div className="absolute top-20 left-0 right-0 h-9 flex items-center overflow-hidden bg-charcoal/50">
        <div className="inline-flex gap-0 whitespace-nowrap" style={{ animation: "tickerScroll 26s linear infinite" }}>
          {[...Array(2)].map((_, ti) =>
            ["✈ KHI → PARIS  –39%", "✈ LHE → DUBAI  –37%", "✈ ISB → TOKYO  –34%", "✈ KHI → NYC  –31%", "✈ KHI → BALI  –31%"].map((t, i) => (
              <span key={`${ti}-${i}`} className="px-8 flex items-center gap-2 text-white"
                style={{ fontSize: ".7rem", fontWeight: 700, letterSpacing: ".08em" }}>
                {t}<span style={{ opacity: .3 }}>|</span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Badge */}
      <div className="hero-item inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-charcoal text-white text-[.7rem] font-black uppercase tracking-widest">
        <span className="w-2 h-2 rounded-full bg-pumpkin" style={{ animation: "pulse 1.6s ease-in-out infinite" }} />
        🔥 {totalDeals} Live Deals
      </div>

      {/* Headline */}
      <h1 className="hero-item font-black tracking-tight leading-[1.02] text-charcoal text-5xl md:text-7xl mb-4">
        Fly More,<br />Pay <em className="text-pumpkin not-italic">Far Less</em>
      </h1>

      <p className="hero-item text-gray-400 text-base max-w-lg mb-10 leading-relaxed">
        Hand-picked flight + hotel packages refreshed daily. Real deals, real savings — up to 40% off.
      </p>

      {/* Countdown */}
      <div className="hero-item flex items-center gap-4 flex-wrap justify-center">
        <span className="text-[.72rem] uppercase tracking-widest text-gray-400 font-semibold">
          Flash sale ends in
        </span>
        <div className="flex items-center gap-1.5">
          {[{ val: h, l: "hrs" }, { val: m, l: "min" }, { val: s, l: "sec" }].map(({ val, l }, i) => (
            <span key={l} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-gray-300 font-bold text-xl">:</span>}
              <div className="bg-charcoal rounded-xl px-3 py-2 text-center min-w-[3rem]">
                <div className="text-pumpkin font-black text-xl leading-none">{val}</div>
                <div className="text-gray-500 text-[.55rem] uppercase tracking-widest mt-0.5">{l}</div>
              </div>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── SKELETON ─────────────────── */
function Skeleton() {
  return (
    <div className="bg-white rounded-[24px] overflow-hidden border border-black/[.04] animate-pulse">
      <div className="h-44 bg-gray-100" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-100 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 rounded-full w-1/2" />
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-gray-100 rounded-full" />
          <div className="h-5 w-16 bg-gray-100 rounded-full" />
        </div>
        <div className="h-8 bg-gray-100 rounded-full w-full mt-4" />
      </div>
    </div>
  );
}

/* ─────────────────── MAIN PAGE ─────────────────── */
export default function DealsPage() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("savings");
  const [selectedDeal, setSelectedDeal] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllActiveDeals();
        setDeals(data);
      } catch {
        showError("Failed to load deals");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Derive unique destinations for filter tabs
  const destinations = ["All", ...new Set(deals.map((d) => d.hotelCountry).filter(Boolean))];

  const filtered = deals.filter((d) => filter === "All" || d.hotelCountry === filter);

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "savings") return (b.originalPrice - b.dealPrice) - (a.originalPrice - a.dealPrice);
    if (sort === "price") return a.dealPrice - b.dealPrice;
    if (sort === "discount") return b.discountPercentage - a.discountPercentage;
    return 0;
  });

  const featuredDeal = sorted[0] ?? null;
  const gridDeals = sorted.slice(1);

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      {/* ── Hero ── */}
      <Hero totalDeals={deals.length} />

      {/* ── Filter / Sort Bar ── */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-black/[.06]">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex items-center overflow-x-auto gap-1 no-scrollbar">
          {destinations.map((dest) => (
            <button
              key={dest}
              onClick={() => setFilter(dest)}
              className={`px-4 py-4 text-[.8rem] font-semibold whitespace-nowrap border-b-2 transition-all duration-200 bg-transparent border-none cursor-pointer ${
                filter === dest
                  ? "text-pumpkin border-b-pumpkin"
                  : "text-gray-400 border-b-transparent hover:text-charcoal"
              }`}
              style={{ borderBottom: filter === dest ? "2px solid" : "2px solid transparent" }}
            >
              {dest}
            </button>
          ))}
          <div className="ml-auto shrink-0 pl-4 py-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-[.78rem] border border-gray-200 rounded-full px-4 py-2 outline-none bg-white text-gray-600 cursor-pointer"
            >
              <option value="savings">Best Savings</option>
              <option value="price">Lowest Price</option>
              <option value="discount">Highest Discount</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-12 space-y-14">

        {/* ── Featured Deal ── */}
        {!loading && featuredDeal && (
          <section>
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-[.72rem] font-black uppercase tracking-widest text-pumpkin">Deal of the Day</span>
              <h2 className="text-3xl font-black text-charcoal">Editor's Pick</h2>
            </div>
            <FeaturedDeal deal={featuredDeal} onBook={setSelectedDeal} />
          </section>
        )}

        {/* ── Grid ── */}
        <section>
          <div className="flex items-baseline justify-between mb-7">
            <h2 className="text-3xl font-black text-charcoal">
              {loading ? "Loading…" : `${sorted.length} Deal${sorted.length !== 1 ? "s" : ""}`}
            </h2>
            <span className="text-sm text-gray-400">
              {filter !== "All" && `Filtered by ${filter} · `}
              Sorted by {sort === "savings" ? "best savings" : sort === "price" ? "lowest price" : "highest discount"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)
              : gridDeals.map((deal, i) => (
                  <DealCard key={deal.id} deal={deal} onBook={setSelectedDeal} index={i} />
                ))}

            {!loading && sorted.length === 0 && (
              <div className="col-span-3 py-24 text-center text-gray-400">
                <div className="text-5xl mb-4">🏖️</div>
                <p className="font-bold text-lg">No deals found for this filter.</p>
                <p className="text-sm mt-1">Try switching to "All" or check back later.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ── Book Modal ── */}
      {selectedDeal && (
        <BookDealModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onBooked={(booking) => {
            console.log("Booking confirmed:", booking);
          }}
        />
      )}
    </div>
  );
}


// import { ArrowBigRightDash } from "lucide-react";
// import { useState, useEffect } from "react";
// import { allDeals, flashSales } from "../../constants/deals";

// const tabs = ["All Deals", "Europe", "Middle East", "Asia", "Americas", "Africa"];

// /* ─────────────────────────── COUNTDOWN ─────────────────────────── */
// function useCountdown() {
//   const [time, setTime] = useState({ h: 5, m: 47, s: 33 });
//   useEffect(() => {
//     const t = setInterval(() => {
//       setTime(prev => {
//         let { h, m, s } = prev;
//         s--; if (s < 0) { s = 59; m--; } if (m < 0) { m = 59; h--; } if (h < 0) { h = 5; m = 59; s = 59; }
//         return { h, m, s };
//       });
//     }, 1000);
//     return () => clearInterval(t);
//   }, []);
//   return time;
// }

// function pad(n) { return String(n).padStart(2, "0"); }

// /* ─────────────────────────── SCROLL REVEAL HOOK ─────────────────────────── */
// function useScrollReveal() {
//   useEffect(() => {
//     const els = document.querySelectorAll(".reveal");
//     const obs = new IntersectionObserver(
//       entries => entries.forEach(e => {
//         if (e.isIntersecting) {
//           e.target.style.opacity = "1";
//           e.target.style.transform = "translateY(0)";
//         }
//       }),
//       { threshold: 0.08 }
//     );
//     els.forEach(el => obs.observe(el));
//     return () => obs.disconnect();
//   }, []);
// }

// /* ─────────────────────────── REVEAL WRAPPER ─────────────────────────── */
// function Reveal({ children, delay = 0, className = "" }) {
//   return (
//     <div
//       className={`reveal ${className}`}
//       style={{
//         opacity: 0,
//         transform: "translateY(28px)",
//         transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
//       }}
//     >
//       {children}
//     </div>
//   );
// }

// /* ─────────────────────────── COMPONENT ─────────────────────────── */
// export default function DealsPage() {
//   const [activeTab, setActiveTab] = useState("All Deals");
//   const [sort, setSort] = useState("savings");
//   const [toast, setToast] = useState("");
//   const [emailVal, setEmailVal] = useState("");
//   const [copiedCode, setCopiedCode] = useState("");
//   const time = useCountdown();
//   useScrollReveal();

//   const showToast = (msg) => {
//     setToast(msg);
//     setTimeout(() => setToast(""), 2400);
//   };

//   const handleCopyCode = (code) => {
//     setCopiedCode(code);
//     showToast(`✅ Code "${code}" copied to clipboard!`);
//     setTimeout(() => setCopiedCode(""), 2400);
//   };

//   const handleBook = (city) => showToast(`✈️ Opening booking for ${city}…`);
//   const handleNewsletter = () => {
//     if (emailVal) {
//       showToast("🎉 You're on the list! First deal drops tomorrow.");
//       setEmailVal("");
//     }
//   };

//   const filteredDeals = allDeals.filter(d => activeTab === "All Deals" || d.category === activeTab);
//   const sortedDeals = [...filteredDeals].sort((a, b) => {
//     if (sort === "savings") return parseInt(b.savings) - parseInt(a.savings);
//     if (sort === "price") return parseInt(a.now.replace(/\D/g, "")) - parseInt(b.now.replace(/\D/g, ""));
//     return 0;
//   });

//   return (
//     <div className="min-h-screen bg-[#f7f9fb]">

// {showToast && (
//   <div className="fixed bottom-8 left-[50%] py-[.85rem] px-7 rounded-[100px] text[.875rem] font-normal"
//   style={{
//     position: "fixed", bottom: "2rem", left: "50%",
//     transform: toast ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(80px)",
//     background: "oklch(34.591% 0.04142 235.083)", color: "#fff",
//     padding: ".85rem 1.75rem", borderRadius: "100px",
//     fontSize: ".875rem", fontWeight: 600, zIndex: 999,
//     boxShadow: "0 10px 40px rgba(0,0,0,.2)",
//     transition: "transform .35s cubic-bezier(.34,1.56,.64,1)",
//     pointerEvents: "none",
//   }}>{toast}</div>
// )}
// {/* ── TOAST ── */}

//       {/* ── HERO ── */}
//       <section className="relative overflow-hidden flex flex-col items-center justify-center text-center px-6 pt-36 pb-20 min-h-[58vh] bg-[#f7f9fb]">

//         {/* Ticker tape */}
//         <div className="absolute top-15 sm:top-19 left-0 right-0 overflow-hidden h-9 flex items-center bg-charcoal/50 text-nowrap">
//           <div className="inline-flex gap-0 animate-scroll " 
//           style={{
//             animation: "tickerScroll 28s linear infinite",
//           }}>
//             <style>{`
//               @keyframes tickerScroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
//               @keyframes blobFloat { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(15px,-20px) scale(1.04)} }
//               @keyframes badgePulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:.6} }
//             `}</style>
//             {[...Array(2)].map((_, ti) =>
//               ["✈ KARACHI → PARIS  –39%", "✈ LAHORE → DUBAI  –37%", "✈ ISLAMABAD → TOKYO  –34%", "✈ KARACHI → NEW YORK  –31%", "✈ LAHORE → ROME  –33%", "✈ KARACHI → BALI  –31%"].map((t, i) => (
//                 <span key={`${ti}-${i}`} className="px-8 flex items-center gap-2"
//                   style={{ fontSize: ".72rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#fff" }}>
//                   {t}<span style={{ opacity: .4 }}>|</span>
//                 </span>
//               ))
//             )}
//           </div>
//         </div>

//         {/* Dot pattern */}
//         <div className="absolute inset-0 pointer-events-none" style={{
//           backgroundImage: "radial-gradient(circle, rgba(0,0,0,.045) 1px, transparent 1px)",
//           backgroundSize: "28px 28px",
//         }} />

//         {/* Blobs */}
//         <div className="absolute rounded-full pointer-events-none w-115 h-115 bg-pumpkin/30 top-20 -left-40 blur-[90px]" 
//         style={{
//           animation: "blobFloat 9s ease-in-out infinite",
//         }} />
//         <div className="absolute rounded-full pointer-events-none w-50 h-50 bg-pumpkin/40 bottom-10 right-0 blur-[80px]" 
//         style={{
//           animation: "blobFloat 11s ease-in-out infinite reverse",
//         }} />

//         {/* Badge */}
//         <div className="relative inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-charcoal text-white text-[0.72rem] font-bold tracking-widest uppercase">
//           <span className="w-2 h-2 rounded-full bg-accent " 
//           style={{ animation: "badgePulse 1.6s ease-in-out infinite" }} />
//           🔥 Limited Time Offers
//         </div>

//         {/* Title */}
//         <h1 className="relative font-bold tracking-tight leading-[1.04] mb-5 text-charcoal text-7xl"
//           >
//           Fly More,<br />Pay <em className="text-pumpkin">Far Less</em>
//         </h1>

//         <p className="relative mb-10 leading-relaxed text-[1.05rem] text-gray-400 max-w-120">
//           Hand-picked deals refreshed daily. Up to 40% off on flights to 180+ destinations worldwide.
//         </p>

//         {/* Countdown */}
//         <div className="relative grid grid-cols-1 sm:grid-cols-2 items-center gap-4 flex-wrap justify-center ">
//           <span className="uppercase tracking-widest mr-1 text-[0.75rem] font-medium text-gray-400 ">
//             Flash sale ends in
//           </span>
//           <div className="flex gap-2">
//           {[{ val: time.h, label: "hrs" }, { val: time.m, label: "min" }, { val: time.s, label: "sec" }].map(({ val, label }, idx) => (
//             <span key={label} className="flex justify-evenly items-center gap-2">
//               {idx > 0 && <span className="text-[1.4rem] font-bold text-gray-600">:</span>}
//               <div className="rounded-[10px] px-2 py-1.5 sm:px-4 sm:py-3 text-center w-12 sm:w-15 bg-charcoal">
//                 <div className="text-[.9rem] sm:text-[1.6rem] font-extrabold leading-5 text-pumpkin" >{pad(val)}</div>
//                 <div className="uppercase tracking-widest text-[0.6rem] text-gray-400">{label}</div>
//               </div>
//             </span>
//           ))}

//           </div>
//         </div>
//       </section>

//       {/* ── FILTER BAR ── */}
//       <div className="bg-white border-b border-black/[.07] flex items-center overflow-x-auto sticky top-0 z-100 px-6 sm:px-12">
//         {tabs.map(tab => (
//           <button key={tab} onClick={() => setActiveTab(tab)}
//             className={`px-5 py-[1.1rem] border-none bg-transparent cursor-pointer whitespace-nowrap text-[.875rem] border-b-2 transition-colors duration-200 font-inherit 
//               ${
//                 activeTab === tab
//                   ? "text-pumpkin border-b-pumpkin font-semibold"
//                   : "text-gray-400 border-b-transparent font-medium"
//                 }`}>
//             {tab}
//           </button>
//         ))}
//         <div className="ml-auto flex items-center gap-3 py-3 shrink-0 ">
//           <select className="rounded-full text-[.8rem] outline-none cursor-pointer px-4 py-2 border border-gray-200 text-gray-600 bg-white transition-colors duration-200"
//             value={sort} onChange={e => setSort(e.target.value)}>
//             <option value="savings">Best Savings</option>
//             <option value="price">Lowest Price</option>
//           </select>
//         </div>
//       </div>

//       {/* ── FEATURED DEAL ── */}
//       <section className="px-6 sm:px-12 pt-16 pb-8 bg-[#f7f9fb]">
//         <div className="max-w-275 mx-auto">
//           <Reveal>
//             <span className="block text-[.75rem] font-semibold tracking-widest uppercase mb-3 text-pumpkin">Deal of the Week</span>
//             <h2 className="font-black tracking-tight mb-8 text-4xl text-charcoal">
//               Editor's Pick
//             </h2>
//           </Reveal>
//           <Reveal delay={0.1}>
//             <div onClick={() => handleBook("Paris")}
//               className="rounded-[28px] overflow-hidden cursor-pointer grid grid-cols-2 min-h-85 transition-all duration-300 hover:-translate-y-1 bg-charcoal/90"
//               onMouseEnter={e => e.currentTarget.style.boxShadow = "0 30px 80px rgba(0,0,0,.18)"}
//               onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,.1)"}>

//               {/* Left */}
//               <div className="p-12 flex flex-col justify-between relative z-1">
//                 <div>
//                   <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 w-fit bg-pumpkin text-white text-[0.7rem] font-bold uppercase tracking-widest">
//                     🔥 Flash Sale — 39% Off
//                   </div>
//                   <div className="font-black leading-[1.1] my-4 text-4xl text-white">
//                     The City of<br />Lights Awaits
//                   </div>
//                   <div className="text-gray-400 text-[0.9rem]">
//                     Karachi (KHI) → Paris (CDG) · Jun 10 – Jun 20
//                   </div>
//                 </div>
//                 <div>
//                   <div className="flex items-baseline gap-3 mt-4">
//                     <span className="line-through text-gray-400 text-[1rem]">PKR 185,000</span>
//                     <span className="font-black leading-none text-[2.8rem] text-pumpkin">112K</span>
//                     <span className="text-gray-400 text[0.8rem]">/ person</span>
//                   </div>
//                   <button className="inline-flex items-center gap-2 mt-6 rounded-full px-7 py-3 font-bold text-[.9rem] transition-all duration-200 w-fit border-none cursor-pointer bg-white text-charcoal"
//                     onMouseEnter={e => e.currentTarget.style.background = "#f0f0f0"} 
//                     onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
//                     Book This Deal →
//                   </button>
//                 </div>
//               </div>

//               {/* Right */}
//               <div className="relative overflow-hidden min-h-75 flex items-center justify-center"
//                 style={{ background: "linear-gradient(135deg, oklch(55% 0.06 235 / .3), oklch(73% 0.17 49 / .2))" }}>
//                 <div className="absolute inset-0 opacity-[.28]">
//                   <img src="https://images.pexels.com/photos/30892607/pexels-photo-30892607.jpeg" alt=""
//                     className="w-full h-full object-cover" />
//                 </div>
//                 <div className="relative z-1 text-center">
//                   <div className="font-black text-[1.6rem] text-white ">Paris, France</div>
//                   <div className="text-[.85rem] text-gray-400 mt-1">Romance, art & croissants</div>
//                 </div>
//                 <div className="absolute top-6 right-6 rounded-full flex flex-col items-center justify-center font-bold bg-pumpkin text-white w-18 h-18 shadow-lg">
//                   <span className="font-black leading-none text-[1.3rem]">39%</span>
//                   <span className="uppercase tracking-wide text-[.6rem] opacity-85">off</span>
//                 </div>
//               </div>
//             </div>
//           </Reveal>
//         </div>
//       </section>

//       {/* ── DEALS GRID ── */}
//       <section className="px-6 sm:px-12 py-8 pb-20 bg-[#f7f9fb]">
//         <div className="max-w-275 mx-auto " >
//           <Reveal>
//             <div className="flex items-baseline justify-between mb-6">
//               <h2 className="font-black tracking-tight text-4xl text-charcoal">
//                 {sortedDeals.length} Deal{sortedDeals.length !== 1 ? "s" : ""} Found
//               </h2>
//               <span className="text-[.85rem] text-gray-600" >
//                 Sorted by {sort === "savings" ? "best savings" : "lowest price"}
//               </span>
//             </div>
//           </Reveal>

//           <div className="grid grid-cols-3 gap-5" >
//             {sortedDeals.map((d, i) => (
//               <Reveal key={d.id} delay={(i % 3) * 0.1}>
//                 <div className="bg-white rounded-[22px] overflow-hidden flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1.5 border border-[rgba(0,0,0,.06)] shadow-lg"
//                   onMouseEnter={e => e.currentTarget.style.boxShadow = "0 20px 55px rgba(0,0,0,.1)"}
//                   onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,.04)"}>

//                   {/* Visual */}
//                   <div className="h-40 flex items-center justify-center relative overflow-hidden text-[5rem]"
//                     style={{ background: d.bg }}>
//                     <span className="relative z-1 drop-shadow-xl" >
//                       <img src={d.emoji} alt="" className="w-full h-full object-cover" />
//                     </span>
//                     {d.badge && (
//                       <span className={`absolute top-3 left-3 z-10 text-white rounded-full px-3 py-1.5 text-[.65rem] font-bold uppercase tracking-wide
//                         ${
//                           d.badge === "flash" ? "bg-[#fd802e]" :
//                             d.badge === "limited" ? "bg-[#b94642]" : "bg-[#233d4c]"
//                         }`}>
//                         {d.badgeLabel}
//                       </span>
//                     )}
//                   </div>

//                   {/* Body */}
//                   <div className="p-5 pb-6 flex-1 flex flex-col">
//                     <div className="flex items-center gap-2 mb-1 text-[.8rem] text-gray-500" >
//                       <span>{d.from}</span>
//                       <span className="text-pumpkin font-bold ">→</span>
//                       <span>{d.city}</span>
//                     </div>
//                     <div className="font-bold mb-1 text-[1.15rem] text-charcoal">
//                       {d.city}, {d.country}
//                     </div>
//                     <div className="text-[.8rem] text-gray-500 leading-relaxed" >{d.dates} · {d.seats}</div>

//                     <div className="mt-auto pt-4 flex items-center justify-between border-t border-[rgba(0,0,0,.06)]">
//                       <div className="flex flex-col">
//                         <span className="text-[.75rem] line-through text-gray-600" >{d.was}</span>
//                         <span className="font-black leading-none text-[1.5rem] text-charcoal">{d.now.replace("PKR ", "")}</span>
//                         <span className="text-[.7rem] text-gray-600" >per person</span>
//                       </div>
//                       <div className="flex flex-col items-end gap-2">
//                         <span className="rounded-full px-3 py-1 font-bold bg-pumpkin/20 text-charcoal text-[.75rem]">
//                           Save {d.savings}
//                         </span>
//                         <button
//                           className="flex items-center gap-1 rounded-full px-5 py-2 font-semibold text-[.8rem] border-none cursor-pointer text-white transition-all duration-200 bg-charcoal"
//                           onMouseEnter={e => e.currentTarget.style.background = "oklch(73.073% 0.17623 49.145)"}
//                           onMouseLeave={e => e.currentTarget.style.background = "oklch(34.591% 0.04142 235.083)"}
//                           onClick={() => handleBook(d.city)}>
//                           Book <ArrowBigRightDash size={18} />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </Reveal>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── FLASH SALES STRIP ── */}
//       <section className="px-6 sm:px-12 py-12 relative overflow-hidden bg-charcoal">
//         <div className="absolute inset-0 pointer-events-none"
//           style={{ background: "radial-gradient(ellipse 50% 100% at 50% 50%, oklch(73% 0.17 49 / .1), transparent)" }} />
//         <div className="max-w-275 mx-auto" >
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="font-black text-white text-[1.6rem]">
//               ⚡ 
//               <em className="italic text-pumpkin">Flash</em> 
//               Fares — Today Only
//             </h2>
//             <button className="rounded-full px-4 py-2 text-[.8rem] font-medium bg-transparent cursor-pointer transition-colors duration-200 text-gray-400 border border-gray-600"
//               onMouseEnter={e => { e.currentTarget.style.borderColor = "oklch(73.073% 0.17623 49.145)"; e.currentTarget.style.color = "oklch(73.073% 0.17623 49.145)"; }}
//               onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.15)"; e.currentTarget.style.color = "rgba(255,255,255,.5)"; }}>
//               View All →
//             </button>
//           </div>
//           <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin", scrollbarColor: "oklch(73.073% 0.17623 49.145) rgba(255,255,255,.05)" }}>
//             {flashSales.map((f, i) => (
//               <div key={i} onClick={() => handleBook(f.dest)}
//                 className="shrink-0 rounded-[18px] p-5 w-50 cursor-pointer transition-all duration-200 hover:-translate-y-1 bg-[rgba(255,255,255,.07)] border border-gray-700/50"
//                 onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.12)"}
//                 onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.07)"}>
//               <div className="text-[2rem] mb-2"><img src={f.flag} alt={f.dest} width={60} /></div>
//                 <div className="font-bold text-white mb-1 text-[0.9rem]">{f.dest}</div>
//                 <div className="mb-3 text-[.75rem] text-gray-400" >From {f.from}</div>
//                 <div className="block">
//                   <span className="font-black text-[1.5rem] text-pumpkin block">{f.price}</span>
//                   <span className="inline-block rounded-full mb-2 px-2 py-0.5 font-bold text-white bg-pumpkin text-[.65rem]">-{f.pct}</span>
//                 </div>
//                 <div className="text-[.75rem] line-through text-gray-400">{f.was}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── PROMO CODES ── */}
//       <section className="px-6 sm:px-12 py-16 bg-white ">
//         <div className="max-w-275 mx-auto">
//           <Reveal>
//             <span className="block text-[.75rem] font-semibold tracking-widest uppercase mb-3 text-pumpkin">Promo Codes</span>
//             <h2 className="font-black tracking-tight mb-8 text-charcoal text-4xl text-[clamp(1.8rem, 3vw, 2.4rem)]">
//               Stack Savings Even Further
//             </h2>
//           </Reveal>
//           <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr] gap-6" >

//             {/* Wide card */}
//             <Reveal delay={0.1}>
//               <div onClick={() => handleCopyCode("SKY15")}
//                 className="rounded-3xl p-10 relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 bg-pumpkin text-white"
//                 onMouseEnter={e => e.currentTarget.style.boxShadow = "0 20px 55px rgba(0,0,0,.12)"}
//                 onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
//                 <div className="absolute rounded-full pointer-events-none w-65 h-65 bg-[rgba(255,255,255,.08)] -right-15 -top-15" />
//                 <div className="absolute rounded-full pointer-events-none w-35 h-35 bg-[rgba(255,255,255,.06)] -bottom-7 right-10" />
//                 <span className="inline-block rounded-full px-3 py-1 mb-4 font-bold uppercase tracking-widest bg-[rgba(255,255,255,.18)] text-[.7rem]">First Booking</span>
//                 <div className="font-black leading-[1.15] mb-3 text-3xl">
//                   15% off your<br />first SkyRoute flight
//                 </div>
//                 <p className="mb-6 leading-relaxed text-[.875rem] opacity-75 max-w-[320px]">
//                   New to SkyRoute? Welcome aboard. Use this code at checkout and save 15% on any flight, any destination.
//                 </p>
//                 <div className="inline-flex items-center gap-3 rounded-[10px] px-4 py-3 cursor-pointer transition-all duration-200 bg-[rgba(255,255,255,.15)] border border-dashed border-[rgba(255,255,255,.4)] text-[.875rem] font-semibold"
//                   onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.25)"}
//                   onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.15)"}>
//                   <span className="font-mono text-[1rem] tracking-widest">SKY15</span>
//                   <span className="text-[.7rem] opacity-60">{copiedCode === "SKY15" ? "✅ Copied!" : "Click to copy"}</span>
//                 </div>
//               </div>
//             </Reveal>

//             {/* Narrow card */}
//             <Reveal delay={0.2}>
//               <div onClick={() => handleCopyCode("ELITE10")}
//                 className="rounded-3xl p-10 relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 h-full bg-[#233d4c] text-white"
//                 onMouseEnter={e => e.currentTarget.style.boxShadow = "0 20px 55px rgba(0,0,0,.12)"}
//                 onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
//                 <div className="absolute rounded-full pointer-events-none w-65 h-65 bg-[rgba(255,255,255,.06)] -top-15 -right-15" />
//                 <span className="inline-block rounded-full px-3 py-1 mb-4 font-bold uppercase tracking-widest bg-[rgba(255,255,255,.12)] text-[.7rem]">Elite Members</span>
//                 <div className="font-black leading-[1.15] mb-3 text-3xl">
//                   Extra 10% for SkyRoute Elite
//                 </div>
//                 <p className="mb-6 leading-relaxed text-[.875rem] opacity-75">
//                   Loyalty deserves rewards. Elite members get an additional 10% on top of any existing deal.
//                 </p>
//                 <div className="inline-flex items-center gap-3 rounded-[10px] px-4 py-3 cursor-pointer transition-all duration-200 bg-[rgba(255,255,255,.1)] border border-dashed border-[rgba(255,255,255,.25)] text-[.875rem] font-semibold"
//                   onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.2)"}
//                   onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.1)"}>
//                   <span className="font-mono text-[1rem] tracking-widest">ELITE10</span>
//                   <span className="text-[0.7rem] opacity-60">{copiedCode === "ELITE10" ? "✅ Copied!" : "Click to copy"}</span>
//                 </div>
//               </div>
//             </Reveal>
//           </div>
//         </div>
//       </section>

//       {/* ── NEWSLETTER ── */}
//       <section className="px-6 sm:px-12 py-20 text-center bg-[#f7f9fb]">
//         <Reveal>
//           <div className="max-w-135 mx-auto">
//             <div className="text-[2.5rem] mb-4">✉️</div>
//             <h2 className="font-black tracking-tight mb-3 text-5xl text-charcoal">
//               Never Miss a <em className="text-pumpkin italic">Deal</em>
//             </h2>
//             <p className="leading-relaxed mb-8 text-[.95rem] text-gray-500">
//               Get the hottest flight deals dropped straight into your inbox — before they sell out.
//               Thousands of travellers already save big every week.
//             </p>
//             <div className="flex gap-2 rounded-full p-1.5 pl-6 max-w-lg mx-auto items-center justify-between bg-white border border-[rgba(0,0,0,.08)] shadow-md"
//               onMouseEnter={e => e.currentTarget.style.boxShadow = "0 20px 55px rgba(0,0,0,.1)"}
//               onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,.04)"}>
//               <input
//                 className="flex-1 border-none outline-none text-[.9rem] bg-transparent text-gray-600 placeholder-gray-400"
//                 placeholder="your@email.com"
//                 value={emailVal}
//                 onChange={e => setEmailVal(e.target.value)}
//                 onKeyDown={e => e.key === "Enter" && handleNewsletter()}
//               />
//               <button
//                 className="rounded-full px-6 py-3 font-bold text-[.875rem] text-white border-none cursor-pointer whitespace-nowrap transition-all duration-200 bg-pumpkin"
//                 onMouseEnter={e => e.currentTarget.style.background = "oklch(77.669% 0.14767 52.458)"}
//                 onMouseLeave={e => e.currentTarget.style.background = "oklch(73.073% 0.17623 49.145)"}
//                 onClick={handleNewsletter}>
//                 Get Deals ✈
//               </button>
//             </div>
//             <p className="mt-4 text-[.75rem] text-gray-500">
//               No spam, ever. Unsubscribe anytime. We hate junk mail as much as you do.
//             </p>
//           </div>
//         </Reveal>
//       </section>

//     </div>
//   );
// }