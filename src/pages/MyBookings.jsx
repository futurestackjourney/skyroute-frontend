import { useEffect, useState } from "react";
import { getMyBoardingPasses, downloadBoardingPassPdf } from "../api/boardingPasses";
import { Plane, Clock, User, AlertCircle, Download, Loader2 } from "lucide-react";

// ─── Barcode (visual only — cosmetic for display/print) ───────────────────────
// NOTE: For a real scannable barcode at check-in, generate it on the backend
// (e.g. QRCoder / ZXing in .NET) and return the base64 image in MyBookingDto.
// This SVG is deterministic from bookingId so it always looks unique and correct,
// but it is NOT cryptographically signed or airport-verifiable.
const Barcode = ({ value, width = 180, height = 48 }) => {
  const str  = String(value).toUpperCase();
  const bars = [];
  const narrow = 2, wide = 4, gap = 1;
  let x = 6;

  const addBar = (w, isBar) => {
    if (isBar) bars.push({ x, w });
    x += w + gap;
  };

  [1,0,1,0,1].forEach((b, i) => addBar(i % 2 === 0 ? narrow : narrow, b === 1));

  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    for (let bit = 4; bit >= 0; bit--) {
      addBar((code >> bit) & 1 ? wide : narrow, true);
      addBar(narrow, false);
    }
    addBar(narrow, false);
  }

  [1,0,1].forEach((b) => addBar(narrow, b === 1));

  const scale = (width - 12) / x;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
      {bars.map((bar, i) => (
        <rect key={i} x={bar.x * scale + 6} y={0} width={Math.max(1, bar.w * scale)} height={height - 10} fill="#1e293b" />
      ))}
      <text x={width / 2} y={height} textAnchor="middle" fontSize="7" fill="#64748b" fontFamily="monospace" letterSpacing="2">
        {value}
      </text>
    </svg>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const fmtTime = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const STATUS_CFG = {
  0: { label: "Pending",   bg: "bg-amber-100",  text: "text-amber-700",  ring: "ring-amber-300"  },
  1: { label: "Confirmed", bg: "bg-emerald-100", text: "text-emerald-700",ring: "ring-emerald-300"},
  2: { label: "Cancelled", bg: "bg-red-100",     text: "text-red-700",   ring: "ring-red-300"    },
  3: { label: "Completed", bg: "bg-slate-100",   text: "text-slate-600", ring: "ring-slate-300"  },
};

const CLASS_CFG = {
  First:    { bg: "bg-amber-500",   light: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200"  },
  Business: { bg: "bg-sky-500",     light: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-200"    },
  Economy:  { bg: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200"},
};

// ─── Boarding pass card ───────────────────────────────────────────────────────
const BoardingPass = ({ b }) => {
  const [saving, setSaving] = useState(false);

  const status     = STATUS_CFG[b.status]   ?? STATUS_CFG[0];
  const classCfg   = CLASS_CFG[b.class]     ?? CLASS_CFG.Economy;
  const barcodeVal = `SKY${String(b.bookingId).padStart(6, "0")}`;

  const handleDownload = async () => {
    try {
      setSaving(true);
      await downloadBoardingPassPdf(b.bookingId);
    } catch (e) {
      console.error("PDF export failed", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Download button — sits outside the card so it doesn't appear in the PDF */}
      <div className="flex justify-end">
        <button
          onClick={handleDownload}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600
            bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300
            disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          {saving
            ? <><Loader2 size={13} className="animate-spin" /> Generating PDF…</>
            : <><Download size={13} /> Download PDF</>
          }
        </button>
      </div>

      {/* The card — this ref is what gets captured */}
      <div
        className="w-full rounded-3xl overflow-hidden shadow-xl ring-1 ring-slate-200/80 bg-white
          transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-2xl"
      >
        {/* Top strip */}
        <div className="bg-slate-900 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
              <Plane size={14} className="text-white -rotate-45" />
            </div>
            <div>
              <p className="text-white font-black text-sm tracking-wider">SKYROUTE</p>
              <p className="text-white/40 text-[10px] tracking-widest uppercase">Boarding Pass</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ring-1 uppercase tracking-wider ${status.bg} ${status.text} ${status.ring}`}>
              {status.label}
            </span>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${classCfg.light} ${classCfg.text} ${classCfg.border}`}>
              {b.class}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col md:flex-row">

          {/* LEFT: Flight info */}
          <div className="flex-1 px-6 py-5">

            {/* Route */}
            <div className="flex items-center gap-4 mb-5">
              <div className="flex-1">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-0.5">From</p>
                <p className="text-5xl font-black text-slate-900 tracking-tight leading-none">{b.origin}</p>
                <p className="text-sm text-slate-500 font-medium mt-1 uppercase tracking-wide">{b.originCity}</p>
              </div>

              <div className="flex flex-col items-center gap-1 px-2 shrink-0">
                <p className="text-[10px] text-slate-400 font-bold tracking-widest">{b.flightNumber}</p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full border-2 border-slate-300" />
                  <div className="w-12 h-px bg-slate-300 relative">
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2">
                      <Plane size={12} className="text-slate-400 -rotate-45" />
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-slate-400" />
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Direct</p>
              </div>

              <div className="flex-1 text-right">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-0.5">To</p>
                <p className="text-5xl font-black text-slate-900 tracking-tight leading-none">{b.destination}</p>
                <p className="text-sm text-slate-500 font-medium mt-1 uppercase tracking-wide">{b.destinationCity}</p>
              </div>
            </div>

            {/* Times */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-0.5 flex items-center gap-1">
                  <Clock size={9} /> Departure
                </p>
                <p className="text-xl font-black text-slate-800 tabular-nums">{fmtTime(b.departureTime)}</p>
                <p className="text-xs text-slate-500">{fmtDate(b.departureTime)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-0.5 flex items-center justify-end gap-1">
                  <Clock size={9} /> Arrival
                </p>
                <p className="text-xl font-black text-slate-800 tabular-nums">{fmtTime(b.arrivalTime)}</p>
                <p className="text-xs text-slate-500">{fmtDate(b.arrivalTime)}</p>
              </div>
            </div>

            {/* Passenger strip */}
            <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${classCfg.light} border ${classCfg.border}`}>
              <div className={`w-8 h-8 rounded-xl ${classCfg.bg} flex items-center justify-center shrink-0`}>
                <User size={14} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Passenger</p>
                <p className="text-sm font-black text-slate-900 uppercase tracking-wide truncate">{b.passengerName}</p>
              </div>
              <div className="ml-auto text-right shrink-0">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Booking</p>
                <p className="text-sm font-bold text-slate-700">#{b.bookingId}</p>
              </div>
            </div>
          </div>

          {/* Tear line */}
          <div className="hidden md:flex flex-col items-center py-4 relative w-6">
            <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-slate-50 border border-slate-200" />
            <div className="w-px flex-1 border-l-2 border-dashed border-slate-200" />
            <div className="w-4 h-4 rounded-full bg-slate-100 border border-slate-200 my-2 shrink-0" />
            <div className="w-px flex-1 border-l-2 border-dashed border-slate-200" />
            <div className="absolute -left-3 bottom-0 w-6 h-6 rounded-full bg-slate-50 border border-slate-200" />
          </div>
          <div className="md:hidden mx-6 border-t-2 border-dashed border-slate-200 relative my-1">
            <div className="absolute -top-3 -left-6 w-6 h-6 rounded-full bg-slate-50 border border-slate-200" />
            <div className="absolute -top-3 -right-6 w-6 h-6 rounded-full bg-slate-50 border border-slate-200" />
          </div>

          {/* RIGHT: Stub */}
          <div className="w-full md:w-52 px-5 py-5 flex flex-col justify-between gap-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {[
                { label: "Seat",     value: b.seatNumbers },
                { label: "Class",    value: b.class        },
                { label: "Gate",     value: "A14"          },
                { label: "Terminal", value: "2B"           },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold">{label}</p>
                  <p className="text-base font-black text-slate-800 uppercase tracking-wide leading-tight">{value}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3">
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Total Paid</p>
              <p className="text-xl font-black text-slate-900">
                ${Number(b.totalPrice).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="flex flex-col items-center">
              {b.barcodeImage
                ? <img
                    src={`data:image/png;base64,${b.barcodeImage}`}
                    alt={`QR ${barcodeVal}`}
                    className="w-32 h-32 object-contain"
                  />
                : <Barcode value={barcodeVal} width={168} height={52} />
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyBoardingPasses();
        setBookings(data ?? []);
      } catch {
        setError("Failed to load your bookings. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading your boarding passes…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Bookings</h1>
          <p className="text-slate-400 text-sm mt-1">
            {bookings.length > 0
              ? `${bookings.length} boarding pass${bookings.length > 1 ? "es" : ""}`
              : "No bookings yet"}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-6 text-sm text-red-700">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {!error && bookings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
              <Plane size={32} className="opacity-40 -rotate-45" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-600">No bookings found</p>
              <p className="text-sm mt-1">Your boarding passes will appear here after booking.</p>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {bookings.map((b) => (
            <BoardingPass key={b.bookingId} b={b} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;



// import { useEffect, useState } from "react";
// import { getMyBoardingPasses } from "../api/boardingPasses";
// import { Plane, Clock, MapPin, User, Tag, AlertCircle } from "lucide-react";

// // ─── Barcode generator ────────────────────────────────────────────────────────
// // Generates a deterministic Code-39 style barcode SVG from any string.
// // No library needed — pure math from char codes.
// const Barcode = ({ value, width = 180, height = 48 }) => {
//   const str = String(value).toUpperCase();
//   // Build bar pattern: each char → 9 bars (5 bars + 4 spaces) based on Code 39 encoding idea
//   // Simplified: use char codes to produce varying narrow/wide bars
//   const bars = [];
//   const narrow = 2;
//   const wide   = 4;
//   const gap    = 1;

//   // Start quiet zone + start marker
//   let x = 6;
//   const addBar = (w, isBar) => {
//     if (isBar) bars.push({ x, w });
//     x += w + gap;
//   };

//   // Start guard
//   [1,0,1,0,1].forEach((b, i) => addBar(i % 2 === 0 ? narrow : narrow, b === 1));

//   for (let i = 0; i < str.length; i++) {
//     const code = str.charCodeAt(i);
//     // 5 bars per character based on binary of char code
//     for (let bit = 4; bit >= 0; bit--) {
//       const isWide = (code >> bit) & 1;
//       addBar(isWide ? wide : narrow, true);
//       addBar(narrow, false); // space
//     }
//     addBar(narrow, false); // inter-char gap
//   }

//   // End guard
//   [1,0,1].forEach((b) => addBar(narrow, b === 1));

//   // Scale to fit width
//   const totalW = x;
//   const scale  = (width - 12) / totalW;

//   return (
//     <svg
//       width={width}
//       height={height}
//       viewBox={`0 0 ${width} ${height}`}
//       xmlns="http://www.w3.org/2000/svg"
//       className="block"
//     >
//       {bars.map((bar, i) => (
//         <rect
//           key={i}
//           x={bar.x * scale + 6}
//           y={0}
//           width={Math.max(1, bar.w * scale)}
//           height={height - 10}
//           fill="#1e293b"
//         />
//       ))}
//       <text
//         x={width / 2}
//         y={height}
//         textAnchor="middle"
//         fontSize="7"
//         fill="#64748b"
//         fontFamily="monospace"
//         letterSpacing="2"
//       >
//         {value}
//       </text>
//     </svg>
//   );
// };

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// const fmtDate = (d) =>
//   new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

// const fmtTime = (d) =>
//   new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// const STATUS_CFG = {
//   0: { label: "Pending",   bg: "bg-amber-100",   text: "text-amber-700",  ring: "ring-amber-300"  },
//   1: { label: "Confirmed", bg: "bg-emerald-100",  text: "text-emerald-700",ring: "ring-emerald-300"},
//   2: { label: "Cancelled", bg: "bg-red-100",      text: "text-red-700",    ring: "ring-red-300"    },
//   3: { label: "Completed", bg: "bg-slate-100",    text: "text-slate-600",  ring: "ring-slate-300"  },
// };

// const CLASS_CFG = {
//   First:    { bg: "bg-amber-500",   light: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200" },
//   Business: { bg: "bg-sky-500",     light: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-200"   },
//   Economy:  { bg: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200"},
// };

// // ─── Single boarding pass ─────────────────────────────────────────────────────
// const BoardingPass = ({ b }) => {
//   const status   = STATUS_CFG[b.status] ?? STATUS_CFG[0];
//   const classCfg = CLASS_CFG[b.class]   ?? CLASS_CFG.Economy;

//   return (
//     <div className="w-full rounded-3xl overflow-hidden shadow-xl ring-1 ring-slate-200/80 bg-white
//       transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-2xl print:shadow-none">

//       {/* ── Top strip ── */}
//       <div className="bg-slate-900 px-6 py-3 flex items-center justify-between">
//         <div className="flex items-center gap-2.5">
//           <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
//             <Plane size={14} className="text-white -rotate-45" />
//           </div>
//           <div>
//             <p className="text-white font-black text-sm tracking-wider">SKYROUTE</p>
//             <p className="text-white/40 text-[10px] tracking-widest uppercase">Boarding Pass</p>
//           </div>
//         </div>
//         <div className="flex items-center gap-3">
//           <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ring-1 uppercase tracking-wider
//             ${status.bg} ${status.text} ${status.ring}`}>
//             {status.label}
//           </span>
//           <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ring-1 uppercase tracking-wider
//             ${classCfg.light} ${classCfg.text} ${classCfg.border} ring-0`}>
//             {b.class}
//           </span>
//         </div>
//       </div>

//       {/* ── Main body ── */}
//       <div className="flex flex-col md:flex-row">

//         {/* ── LEFT: Flight info ── */}
//         <div className="flex-1 px-6 py-5">

//           {/* Route */}
//           <div className="flex items-center gap-4 mb-5">
//             {/* Origin */}
//             <div className="flex-1">
//               <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-0.5">From</p>
//               <p className="text-5xl font-black text-slate-900 tracking-tight leading-none">{b.origin}</p>
//               <p className="text-sm text-slate-500 font-medium mt-1 uppercase tracking-wide">{b.originCity}</p>
//             </div>

//             {/* Flight path */}
//             <div className="flex flex-col items-center gap-1 px-2 flex-shrink-0">
//               <p className="text-[10px] text-slate-400 font-bold tracking-widest">{b.flightNumber}</p>
//               <div className="flex items-center gap-1">
//                 <div className="w-2 h-2 rounded-full border-2 border-slate-300" />
//                 <div className="w-12 h-px bg-slate-300 relative">
//                   <div className="absolute -top-1 left-1/2 -translate-x-1/2">
//                     <Plane size={12} className="text-slate-400 -rotate-45" />
//                   </div>
//                 </div>
//                 <div className="w-2 h-2 rounded-full bg-slate-400" />
//               </div>
//               <p className="text-[10px] text-slate-400 font-medium">Direct</p>
//             </div>

//             {/* Destination */}
//             <div className="flex-1 text-right">
//               <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-0.5">To</p>
//               <p className="text-5xl font-black text-slate-900 tracking-tight leading-none">{b.destination}</p>
//               <p className="text-sm text-slate-500 font-medium mt-1 uppercase tracking-wide">{b.destinationCity}</p>
//             </div>
//           </div>

//           {/* Times */}
//           <div className="flex items-center justify-between mb-5">
//             <div>
//               <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-0.5 flex items-center gap-1">
//                 <Clock size={9} /> Departure
//               </p>
//               <p className="text-xl font-black text-slate-800 tabular-nums">{fmtTime(b.departureTime)}</p>
//               <p className="text-xs text-slate-500">{fmtDate(b.departureTime)}</p>
//             </div>
//             <div className="text-right">
//               <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-0.5 flex items-center justify-end gap-1">
//                 <Clock size={9} /> Arrival
//               </p>
//               <p className="text-xl font-black text-slate-800 tabular-nums">{fmtTime(b.arrivalTime)}</p>
//               <p className="text-xs text-slate-500">{fmtDate(b.arrivalTime)}</p>
//             </div>
//           </div>

//           {/* Passenger strip */}
//           <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${classCfg.light} border ${classCfg.border}`}>
//             <div className={`w-8 h-8 rounded-xl ${classCfg.bg} flex items-center justify-center flex-shrink-0`}>
//               <User size={14} className="text-white" />
//             </div>
//             <div className="min-w-0">
//               <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Passenger</p>
//               <p className="text-sm font-black text-slate-900 uppercase tracking-wide truncate">{b.passengerName}</p>
//             </div>
//             <div className="ml-auto text-right flex-shrink-0">
//               <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Booking</p>
//               <p className="text-sm font-bold text-slate-700">#{b.bookingId}</p>
//             </div>
//           </div>
//         </div>

//         {/* ── Tear line ── */}
//         <div className="hidden md:flex flex-col items-center py-4 relative">
//           <div className="w-px flex-1 border-l-2 border-dashed border-slate-200" />
//           <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-slate-50 border border-slate-200" />
//           <div className="absolute -left-3 bottom-0 w-6 h-6 rounded-full bg-slate-50 border border-slate-200" />
//           <div className="w-4 h-4 rounded-full bg-slate-100 border border-slate-200 my-2 flex-shrink-0" />
//         </div>
//         <div className="md:hidden h-px mx-6 border-t-2 border-dashed border-slate-200 relative">
//           <div className="absolute -top-3 left-0 w-6 h-6 rounded-full bg-slate-50 border border-slate-200" />
//           <div className="absolute -top-3 right-0 w-6 h-6 rounded-full bg-slate-50 border border-slate-200" />
//         </div>

//         {/* ── RIGHT: Stub ── */}
//         <div className="w-full md:w-52 px-5 py-5 flex flex-col justify-between gap-4">

//           {/* Details grid */}
//           <div className="grid grid-cols-2 gap-x-4 gap-y-3">
//             {[
//               { label: "Seat",     value: b.seatNumbers },
//               { label: "Class",    value: b.class        },
//               { label: "Gate",     value: "A14"          },
//               { label: "Terminal", value: "2B"           },
//             ].map(({ label, value }) => (
//               <div key={label}>
//                 <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold">{label}</p>
//                 <p className="text-base font-black text-slate-800 uppercase tracking-wide leading-tight">{value}</p>
//               </div>
//             ))}
//           </div>

//           {/* Price */}
//           <div className="border-t border-slate-100 pt-3">
//             <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Total Paid</p>
//             <p className="text-xl font-black text-slate-900">
//               ${Number(b.totalPrice).toLocaleString("en-US", { minimumFractionDigits: 2 })}
//             </p>
//           </div>

//           {/* Barcode — generated from bookingId, no image needed */}
//           <div className="flex flex-col items-center">
//             <Barcode value={`SKY${String(b.bookingId).padStart(6, "0")}`} width={168} height={52} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── Page ─────────────────────────────────────────────────────────────────────
// const MyBookings = () => {
//   const [bookings, setBookings] = useState([]);
//   const [loading,  setLoading]  = useState(true);
//   const [error,    setError]    = useState(null);

//   useEffect(() => {
//     (async () => {
//       try {
//         const data = await getMyBoardingPasses();
//         setBookings(data ?? []);
//       } catch {
//         setError("Failed to load your bookings. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   // ── Loading ──────────────────────────────────────────────────────────
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-slate-50 flex items-center justify-center">
//         <div className="flex flex-col items-center gap-4">
//           <div className="w-10 h-10 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
//           <p className="text-sm text-slate-500 font-medium">Loading your boarding passes…</p>
//         </div>
//       </div>
//     );
//   }

//   // ── Render ───────────────────────────────────────────────────────────
//   return (
//     <div className="min-h-screen bg-slate-50 py-10 px-4">
//       <div className="max-w-3xl mx-auto">

//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Bookings</h1>
//           <p className="text-slate-400 text-sm mt-1">
//             {bookings.length > 0
//               ? `${bookings.length} booking${bookings.length > 1 ? "s" : ""} found`
//               : "No bookings yet"}
//           </p>
//         </div>

//         {/* Error */}
//         {error && (
//           <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-6 text-sm text-red-700">
//             <AlertCircle size={16} />
//             {error}
//           </div>
//         )}

//         {/* Empty */}
//         {!error && bookings.length === 0 && (
//           <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
//             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
//               <Plane size={32} className="opacity-40 -rotate-45" />
//             </div>
//             <div className="text-center">
//               <p className="font-semibold text-slate-600">No bookings found</p>
//               <p className="text-sm mt-1">Your boarding passes will appear here after booking.</p>
//             </div>
//           </div>
//         )}

//         {/* Boarding passes */}
//         <div className="space-y-6">
//           {bookings.map((b) => (
//             <BoardingPass key={b.bookingId} b={b} />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MyBookings;