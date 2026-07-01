import { useEffect, useState, useRef, useMemo, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Armchair, Clock, ChevronRight, X, Plane, AlertCircle } from "lucide-react";
import { getSeatsByFlight, lockSeats, releaseSeats } from "../../api/seats";
import { AuthContext } from "../../context/AuthContext";

// ─── Constants ────────────────────────────────────────────────────────────────
const LOCK_MINUTES = 10;

const CLASS_META = {
  First: {
    label: "First Class",
    tagline: "Ultimate luxury",
    seatColor: "bg-amber-400 hover:bg-amber-300",
    selectedColor: "bg-amber-500 ring-2 ring-amber-600 ring-offset-1",
    badgeColor: "bg-amber-100 text-amber-800",
    headerBg: "from-amber-50 to-orange-50",
    borderColor: "border-amber-200",
    icon: "✦",
  },
  Business: {
    label: "Business",
    tagline: "Premium comfort",
    seatColor: "bg-sky-400 hover:bg-sky-300",
    selectedColor: "bg-sky-500 ring-2 ring-sky-600 ring-offset-1",
    badgeColor: "bg-sky-100 text-sky-800",
    headerBg: "from-sky-50 to-blue-50",
    borderColor: "border-sky-200",
    icon: "◈",
  },
  Economy: {
    label: "Economy",
    tagline: "Smart value",
    seatColor: "bg-emerald-400 hover:bg-emerald-300",
    selectedColor: "bg-emerald-500 ring-2 ring-emerald-600 ring-offset-1",
    badgeColor: "bg-emerald-100 text-emerald-800",
    headerBg: "from-emerald-50 to-teal-50",
    borderColor: "border-emerald-200",
    icon: "●",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtPrice = (n) =>
  n != null ? `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 0 })}` : "—";

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Single seat button */
const SeatButton = ({ seat, isSelected, onPress }) => {
  const meta = CLASS_META[seat.class];
  const isUnavailable = seat.isLocked || seat.isBooked;

  let colorClass = meta?.seatColor ?? "bg-slate-300";
  if (seat.isBooked)  colorClass = "bg-slate-300 cursor-not-allowed";
  else if (seat.isLocked) colorClass = "bg-slate-200 cursor-not-allowed";
  else if (isSelected) colorClass = meta?.selectedColor ?? "bg-green-500";

  return (
    <button
      disabled={isUnavailable}
      onClick={() => onPress(seat)}
      title={`${seat.seatNumber} · ${seat.class}${seat.price ? ` · $${seat.price}` : ""}`}
      className={`
        relative w-9 h-10 sm:w-10 sm:h-11 rounded-t-lg rounded-b-sm
        flex flex-col items-center justify-center gap-0.5
        text-[9px] font-bold text-white/90 shadow-sm
        transition-all duration-150 ease-out
        ${colorClass}
        ${!isUnavailable ? "hover:scale-110 hover:-translate-y-0.5 active:scale-95" : "opacity-50"}
      `}
    >
      {/* Seat back nub */}
      <div className="absolute -top-1 w-5 h-1.5 bg-black/10 rounded-full" />
      <Armchair size={12} strokeWidth={2.5} />
      <span className="leading-none">{seat.seatNumber}</span>
    </button>
  );
};

/** Legend item */
const LegendDot = ({ color, label }) => (
  <div className="flex items-center gap-1.5">
    <div className={`w-4 h-4 rounded-sm shadow-sm ${color}`} />
    <span className="text-xs text-slate-500">{label}</span>
  </div>
);

/** Countdown ring */
const TimerRing = ({ seconds, total }) => {
  const pct = seconds / total;
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  const isUrgent = seconds < 60;

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="56" height="56" className="-rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#e2e8f0" strokeWidth="3" />
        <circle
          cx="28" cy="28" r={r} fill="none"
          stroke={isUrgent ? "#ef4444" : "#f59e0b"}
          strokeWidth="3"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <span className={`absolute text-xs font-bold tabular-nums ${isUrgent ? "text-red-500" : "text-amber-500"}`}>
        {m}:{String(s).padStart(2, "0")}
      </span>
    </div>
  );
};

/** Cabin divider */
const CabinDivider = () => (
  <div className="flex items-center gap-3 my-4 px-4">
    <div className="flex-1 h-px bg-slate-200" />
    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium tracking-widest uppercase">
      <Plane size={11} className="rotate-90" />
      <span>Cabin</span>
    </div>
    <div className="flex-1 h-px bg-slate-200" />
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SeatSelection() {
  const { user }    = useContext(AuthContext);
  const { flightId } = useParams();
  const navigate    = useNavigate();

  const [seats,          setSeats]          = useState([]);
  const [selected,       setSelected]       = useState([]);
  const [timer,          setTimer]          = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [locking,        setLocking]        = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [error,          setError]          = useState(null);

  const timerRef   = useRef(null);
  const totalTimer = useRef(LOCK_MINUTES * 60);

  // ── Fetch ────────────────────────────────────────────────────────────
  const fetchSeats = useCallback(async () => {
    try {
      const res = await getSeatsByFlight(flightId);
      setSeats(res ?? []);
    } catch (e) {
      setError("Failed to load seats. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [flightId]);

  useEffect(() => {
    fetchSeats();
    return () => clearInterval(timerRef.current);
  }, [fetchSeats]);

  // ── Grouped seats (memoized) ─────────────────────────────────────────
  const grouped = useMemo(() => {
    return seats.reduce((acc, seat) => {
      const cls = seat.class;
      const row = seat.seatNumber.match(/\d+/)?.[0] ?? "?";
      if (!acc[cls])      acc[cls] = {};
      if (!acc[cls][row]) acc[cls][row] = [];
      acc[cls][row].push(seat);
      return acc;
    }, {});
  }, [seats]);

  const selectedSeats = useMemo(
    () => seats.filter((s) => selected.includes(s.seatId)),
    [seats, selected]
  );

  // Price calculation
  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((sum, s) => sum + (s.price ?? 0), 0);
  }, [selectedSeats]);

  const featureTotal = useMemo(() => {
    return selectedSeats.reduce((sum, s) => {
      const featureSum = (s.features ?? []).reduce((fs, f) => fs + (f.priceModifier ?? 0), 0);
      return sum + featureSum;
    }, 0);
  }, [selectedSeats]);

  // ── Seat toggle ──────────────────────────────────────────────────────
  const handleSeatPress = (seat) => {
    if (!user) { setShowLoginModal(true); return; }
    if (seat.isLocked || seat.isBooked) return;
    setSelected((prev) =>
      prev.includes(seat.seatId) ? prev.filter((id) => id !== seat.seatId) : [...prev, seat.seatId]
    );
  };

  // ── Lock ─────────────────────────────────────────────────────────────
  const handleLock = async () => {
    if (!selected.length || locking) return;
    try {
      setLocking(true);
      await lockSeats({ flightId: Number(flightId), seatIds: selected, lockDurationMinutes: LOCK_MINUTES });
      startTimer(LOCK_MINUTES * 60);
      await fetchSeats();
      navigate("/booking/booking", { state: { flightId: Number(flightId), seatIds: selected } });
    } catch (e) {
      setError("Failed to lock seats. Please try again.");
      console.error(e);
    } finally {
      setLocking(false);
    }
  };

  // ── Release ──────────────────────────────────────────────────────────
  const handleRelease = useCallback(async () => {
    try {
      if (selected.length) {
        await releaseSeats({ flightId: Number(flightId), seatIds: selected });
      }
    } catch (e) {
      console.error(e);
    } finally {
      clearInterval(timerRef.current);
      setSelected([]);
      setTimer(null);
      await fetchSeats();
    }
  }, [flightId, selected, fetchSeats]);

  // ── Timer ────────────────────────────────────────────────────────────
  const startTimer = (seconds) => {
    totalTimer.current = seconds;
    setTimer(seconds);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); handleRelease(); return null; }
        return prev - 1;
      });
    }, 1000);
  };

  // ── Cabin section renderer ───────────────────────────────────────────
  const renderCabin = (type) => {
    const rows = grouped[type];
    if (!rows || Object.keys(rows).length === 0) return null;
    const meta = CLASS_META[type];
    const seatCount = Object.values(rows).flat().length;
    const availCount = Object.values(rows).flat().filter((s) => !s.isBooked && !s.isLocked).length;

    return (
      <div key={type} className={`mb-2 border ${meta.borderColor} rounded-2xl overflow-hidden`}>
        {/* Cabin header */}
        <div className={`bg-linear-to-r ${meta.headerBg} px-5 py-3 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{meta.icon}</span>
            <div>
              <p className="text-sm font-bold text-slate-800">{meta.label}</p>
              <p className="text-xs text-slate-500">{meta.tagline}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${meta.badgeColor}`}>
              {availCount} available
            </span>
          </div>
        </div>

        {/* Rows */}
        <div className="bg-white px-6 py-4 space-y-3">
          {/* Column labels */}
          <div className="grid grid-cols-[28px_1fr_24px_1fr] gap-x-3 mb-1">
            <div />
            <div className="flex gap-2 justify-end pr-1">
              {["A","B","C"].map((l) => (
                <div key={l} className="w-9 sm:w-10 text-center text-[10px] font-semibold text-slate-400">{l}</div>
              ))}
            </div>
            <div />
            <div className="flex gap-2 justify-start pl-1">
              {["D","E","F"].map((l) => (
                <div key={l} className="w-9 sm:w-10 text-center text-[10px] font-semibold text-slate-400">{l}</div>
              ))}
            </div>
          </div>

          {Object.entries(rows)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([row, rowSeats]) => (
              <div key={row} className="grid grid-cols-[28px_1fr_24px_1fr] items-center gap-x-3">
                {/* Row number */}
                <div className="text-xs font-bold text-slate-400 text-center">{row}</div>

                {/* Left seats */}
                <div className="flex gap-2 justify-end">
                  {rowSeats.slice(0, 3).map((s) => (
                    <SeatButton
                      key={s.seatId}
                      seat={s}
                      isSelected={selected.includes(s.seatId)}
                      onPress={handleSeatPress}
                    />
                  ))}
                </div>

                {/* Aisle */}
                <div className="flex items-center justify-center">
                  <div className="w-px h-8 bg-slate-100" />
                </div>

                {/* Right seats */}
                <div className="flex gap-2 justify-start">
                  {rowSeats.slice(3, 6).map((s) => (
                    <SeatButton
                      key={s.seatId}
                      seat={s}
                      isSelected={selected.includes(s.seatId)}
                      onPress={handleSeatPress}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading seat map…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Plane size={15} className="text-white -rotate-45" />
            </div>
            <div>
              <p className="text-xs text-slate-400 leading-none">Flight {flightId}</p>
              <p className="text-sm font-bold text-slate-800 leading-tight">Select Your Seat</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer */}
            {timer !== null && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5">
                <Clock size={13} className="text-amber-500" />
                <span className={`text-xs font-bold tabular-nums ${timer < 60 ? "text-red-500" : "text-amber-600"}`}>
                  {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
                </span>
                <span className="text-xs text-amber-500">left</span>
              </div>
            )}

            {/* Step indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs">
              <span className="px-2.5 py-1 bg-slate-900 text-white rounded-full font-semibold">1 Seats</span>
              <ChevronRight size={13} className="text-slate-400" />
              <span className="px-2.5 py-1 text-slate-400 font-medium">2 Details</span>
              <ChevronRight size={13} className="text-slate-400" />
              <span className="px-2.5 py-1 text-slate-400 font-medium">3 Payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            <AlertCircle size={15} />
            {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── Main layout ── */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-[1fr_340px] gap-6 items-start">

        {/* ── LEFT: Seat map ── */}
        <div>
          {/* Legend */}
          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3.5 mb-4 flex flex-wrap gap-x-5 gap-y-2">
            <LegendDot color="bg-amber-400"   label="First"    />
            <LegendDot color="bg-sky-400"     label="Business" />
            <LegendDot color="bg-emerald-400" label="Economy"  />
            <div className="w-px bg-slate-200 mx-1" />
            <LegendDot color="bg-green-500"  label="Selected" />
            <LegendDot color="bg-slate-200"  label="Locked"   />
            <LegendDot color="bg-slate-300"  label="Booked"   />
          </div>

          {/* Nose */}
          <div className="flex justify-center mb-4">
            <div className="flex flex-col items-center gap-1">
              <div className="w-16 h-8 bg-linear-to-b from-slate-300 to-slate-200 rounded-t-full border border-slate-300" />
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Front</p>
            </div>
          </div>

          {/* Fuselage */}
          <div className="relative bg-white border-x-2 border-slate-200 rounded-none px-3 py-2">
            {/* Windows strip */}
            <div className="absolute top-0 left-3 right-3 h-1.5 bg-linear-to-r from-transparent via-sky-100 to-transparent" />

            {renderCabin("First")}
            {grouped.First && grouped.Business && <CabinDivider />}
            {renderCabin("Business")}
            {grouped.Business && grouped.Economy && <CabinDivider />}
            {renderCabin("Economy")}
          </div>

          {/* Tail */}
          <div className="flex justify-center mt-2">
            <div className="flex flex-col items-center gap-1">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Rear</p>
              <div className="w-12 h-6 bg-linear-to-t from-slate-300 to-slate-200 rounded-b-full border border-slate-300" />
            </div>
          </div>
        </div>

        {/* ── RIGHT: Summary ── */}
        <aside className="sticky top-20 space-y-4">

          {/* Selected seats */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800">Your Selection</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {selected.length === 0 ? "No seats selected yet" : `${selected.length} seat${selected.length > 1 ? "s" : ""} selected`}
              </p>
            </div>

            {selectedSeats.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {selectedSeats.map((s) => {
                  const meta = CLASS_META[s.class];
                  return (
                    <div key={s.seatId} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold
                          ${s.class === "First" ? "bg-amber-400" : s.class === "Business" ? "bg-sky-400" : "bg-emerald-400"}`}>
                          {s.seatNumber}
                        </div>
                        <div className="flex gap-2">
                          <p className="text-sm font-semibold text-slate-800">{s.seatNumber}</p>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${meta?.badgeColor}`}>
                            {s.class}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">{fmtPrice(s.price)}</span>
                        <button
                          onClick={() => setSelected((prev) => prev.filter((id) => id !== s.seatId))}
                          className="w-5 h-5 rounded-full bg-slate-100 hover:bg-red-100 hover:text-red-500 text-slate-400 flex items-center justify-center transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-5 py-8 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Armchair size={20} className="text-slate-400" />
                </div>
                <p className="text-sm text-slate-400">Click any available seat on the map</p>
              </div>
            )}
          </div>

          {/* Price breakdown */}
          {selectedSeats.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 space-y-3">
              <h3 className="text-sm font-bold text-slate-800">Price Breakdown</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Seat{selectedSeats.length > 1 ? "s" : ""} ({selectedSeats.length}×)</span>
                  <span>{fmtPrice(totalPrice)}</span>
                </div>
                {/* {featureTotal > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Add-ons</span>
                    <span>{fmtPrice(featureTotal)}</span>
                  </div>
                )} */}
                {selectedSeats.flatMap((s) => s.features ?? []).length > 0 && (
                <div className="space-y-1">
                  {selectedSeats.map((seat) =>
                    (seat.features ?? []).map((feature) => (
                      <div
                        key={`${seat.seatId}-${feature.seatFeatureId}`}
                        className="flex justify-between text-slate-600 text-sm"
                      >
                        <span>
                          {feature.name} ({seat.seatNumber})
                        </span>
                        <span>+{fmtPrice(feature.priceModifier)}</span>
                      </div>
                    ))
                  )}
                </div>
)}
                <div className="flex justify-between text-slate-500 text-xs">
                  <span>Taxes & fees</span>
                  <span>calculated at checkout</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <span className="text-sm font-bold text-slate-800">Subtotal</span>
                <span className="text-lg font-black text-slate-900">{fmtPrice(totalPrice + featureTotal)}</span>
              </div>
            </div>
          )}

          {/* Timer ring (visible when timer active) */}
          {timer !== null && (
            <div className="bg-white border border-amber-200 rounded-2xl px-5 py-4 flex items-center gap-4">
              <TimerRing seconds={timer} total={totalTimer.current} />
              <div>
                <p className="text-sm font-bold text-slate-800">Seats Reserved</p>
                <p className="text-xs text-slate-500 mt-0.5">Complete booking before time runs out</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2.5">
            <button
              disabled={!selected.length || locking}
              onClick={handleLock}
              className="w-full h-12 rounded-xl bg-slate-900 text-white text-sm font-bold
                hover:bg-slate-700 active:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-150 flex items-center justify-center gap-2 shadow-sm"
            >
              {locking ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Locking seats…
                </>
              ) : (
                <>
                  Lock & Continue
                  <ChevronRight size={16} />
                </>
              )}
            </button>

            {selected.length > 0 && (
              <button
                onClick={handleRelease}
                className="w-full h-10 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-medium
                  hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-150"
              >
                Clear Selection
              </button>
            )}
          </div>

          {/* Trust signals */}
          <p className="text-center text-xs text-slate-400 leading-relaxed">
            🔒 Seats held for {LOCK_MINUTES} minutes after locking. No charges until payment.
          </p>
        </aside>
      </div>

      {/* ── Login Modal ── */}
      {showLoginModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plane size={24} className="text-slate-600 -rotate-45" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">Sign in to continue</h2>
            <p className="text-sm text-slate-500 mb-6">You need to be logged in to select and book seats.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 h-10 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => navigate("/login")}
                className="flex-1 h-10 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-700 transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




// import { useEffect, useState, useRef, useMemo } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { Armchair } from "lucide-react";
// import { getSeatsByFlight, lockSeats, releaseSeats } from "../../api/seats";
// import { useContext } from "react";
// import { AuthContext } from "../../context/AuthContext";

// const LOCK_MINUTES = 10;

// const CLASS_META = {
//   First: { color: "bg-yellow-400", label: "First Class" },
//   Business: { color: "bg-sky-300", label: "Business Class" },
//   Economy: { color: "bg-emerald-200", label: "Economy Class" },
// };

// export default function SeatSelection() {
//   const { user } = useContext(AuthContext);
//   const { flightId } = useParams();
//   const navigate = useNavigate();

//   const [seats, setSeats] = useState([]);
//   const [selected, setSelected] = useState([]);
//   const [timer, setTimer] = useState(null);
//   const [showLoginModal, setShowLoginModal] = useState(false);

//   const timerRef = useRef(null);

//   /* --------------------------------
//      Load Seats
//   -------------------------------- */
//   useEffect(() => {
//     fetchSeats();

//     return () => clearInterval(timerRef.current);
//   }, [flightId]);

//   const fetchSeats = async () => {
//     try {
//       const res = await getSeatsByFlight(flightId);
//       setSeats(res);
//     } catch (e) {
//       console.error("Failed to load seats", e);
//     }
//   };

//   /* --------------------------------
//      Group Seats (Memoized)
//   -------------------------------- */
//   const grouped = useMemo(() => {
//     return seats.reduce((acc, seat) => {
//       const row = seat.seatNumber.match(/\d+/)?.[0];

//       if (!acc[seat.class]) acc[seat.class] = {};
//       if (!acc[seat.class][row]) acc[seat.class][row] = [];

//       acc[seat.class][row].push(seat);
//       return acc;
//     }, {});
//   }, [seats]);

//   // seleted seats
//   const selectedSeatNumbers = useMemo(() => {
//     return seats
//       .filter((seat) => selected.includes(seat.seatId))
//       .map((seat) => seat.seatNumber);
//   }, [selected, seats]);

//   /* --------------------------------
//      Seat Selection
//   -------------------------------- */
//   const toggleSeat = (id) => {
//     const seat = seats.find((s) => s.seatId === id);

//     if (seat.isLocked || seat.isBooked) return;

//     setSelected((prev) =>
//       prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
//     );
//   };

//   /* --------------------------------
//      Lock / Release
//   -------------------------------- */
//   const handleLock = async () => {
//     if (!selected.length) return;

//     try {
//       await lockSeats({
//         flightId: Number(flightId),
//         seatIds: selected,
//         lockDurationMinutes: LOCK_MINUTES,
//       });

//       startTimer(LOCK_MINUTES * 60);
//       await fetchSeats();

//       navigate("/booking", {
//         state: { flightId: Number(flightId), seatIds: selected },
//       });
//     } catch (e) {
//       console.error("Lock failed", e);
//     }
//   };

//   const handleRelease = async () => {
//     try {
//       await releaseSeats({
//         flightId: Number(flightId),
//         seatIds: selected,
//       });

//       clearInterval(timerRef.current);
//       setSelected([]);
//       setTimer(null);

//       await fetchSeats();
//     } catch (e) {
//       console.error("Release failed", e);
//     }
//   };

//   /* --------------------------------
//      Timer
//   -------------------------------- */
//   const startTimer = (seconds) => {
//     setTimer(seconds);

//     timerRef.current = setInterval(() => {
//       setTimer((prev) => {
//         if (prev <= 1) {
//           clearInterval(timerRef.current);
//           handleRelease();
//           return null;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//   };

//   const formattedTime = useMemo(() => {
//     if (!timer) return null;

//     const m = Math.floor(timer / 60);
//     const s = timer % 60;

//     return `${m}:${String(s).padStart(2, "0")}`;
//   }, [timer]);

//   /* --------------------------------
//      For Login Modal
//   -------------------------------- */
//   const handleSeatClick = (seat) => {
//     console.log("USER NOT LOGGED IN");
//     if (!user) {
//       // show login modal instead of selecting
//       console.log("USER NOT LOGGED IN");
//       setShowLoginModal(true);
//       return;
//     }

//     if (seat.isLocked || seat.isBooked) return;

//     toggleSeat(seat.seatId);
//   };

//   /* --------------------------------
//      Render Seat
//   -------------------------------- */
//   const Seat = ({ seat }) => {
//     const isSelected = selected.includes(seat.seatId);
//     const locked = seat.isLocked;
//     const booked = seat.isBooked;

//     let base = CLASS_META[seat.class]?.color;

//     if (booked) base = "bg-gray-400";
//     else if (locked) base = "bg-gray-200";
//     else if (isSelected) base = "bg-green-500";

//     return (
//       <button
//         disabled={locked || booked}
//         onClick={() => handleSeatClick(seat)}
//         className={`
//           relative
//           w-9 h-9 sm:w-11 sm:h-11
//           rounded-md
//           ${base}
//           text-[10px]
//           font-semibold
//           flex flex-col
//           items-center
//           justify-center
//           shadow-sm
//           transition
//           hover:scale-105
//           disabled:cursor-not-allowed
//           disabled:opacity-60
//         `}
//       >
//         <Armchair size={14} />
//         {seat.seatNumber}
//       </button>
//     );
//   };

//   /* --------------------------------
//      Render Cabin Section
//   -------------------------------- */
//   const CabinSection = ({ type, rows }) => {
//     if (!rows) return null;

//     return (
//       <section className="mb-10">
//         <h3 className="text-center text-lg font-semibold mb-4">
//           {CLASS_META[type]?.label}
//         </h3>

//         <div className="space-y-3">
//           {Object.entries(rows).map(([row, rowSeats]) => (
//             <div
//               key={row}
//               className="grid grid-cols-[28px_1fr_28px_1fr] items-center gap-2"
//             >
//               {/* Row */}
//               <div className="text-xs font-bold text-center">{row}</div>

//               {/* Left Seats */}
//               <div className="flex gap-2 justify-end">
//                 {rowSeats.slice(0, 3).map((s) => (
//                   <Seat key={s.seatId} seat={s} />
//                 ))}
//               </div>

//               {/* Aisle */}
//               <div />

//               {/* Right Seats */}
//               <div className="flex gap-2 justify-start">
//                 {rowSeats.slice(3, 6).map((s) => (
//                   <Seat key={s.seatId} seat={s} />
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>
//     );
//   };

//   /* --------------------------------
//      UI
//   -------------------------------- */
//   return (
//     <div className="min-h-screen padding-x max-w-7xl py-12 sm:py-22 ">
//       <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-[2fr_1fr] gap-8 ">
//         {/* LEFT: SEAT MAP */}
//         <div>
//           <h1 className="text-3xl font-bold text-center mb-4">
//             Choose Your Seat
//           </h1>

//           <p className="text-center text-sm text-gray-500 mb-6">
//             Front of Aircraft
//           </p>

//           {/* Legend */}
//           <Legend />

//           {/* Plane */}
//           <div className="bg-white rounded-xl shadow p-6 max-w-xl mx-auto">
//             <CabinSection type="First" rows={grouped.First} />
//             <CabinSection type="Business" rows={grouped.Business} />
//             <CabinSection type="Economy" rows={grouped.Economy} />
//           </div>

//           <p className="text-center text-sm text-gray-500 mt-4">
//             Rear of Aircraft
//           </p>

//           {/* Mobile Actions */}
//           <div className="flex justify-center gap-3 mt-6 lg:hidden">
//             <PrimaryButton disabled={!selected.length} onClick={handleLock}>
//               Continue
//             </PrimaryButton>

//             <SecondaryButton onClick={handleRelease}>Release</SecondaryButton>
//           </div>

//           {formattedTime && (
//             <p className="text-center mt-3 text-red-600 font-medium">
//               Time left: {formattedTime}
//             </p>
//           )}
//         </div>

//         {/* RIGHT: SUMMARY */}
//         <aside className="bg-white  rounded-xl shadow p-6 h-fit sticky top-24 ">
//           <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>

//           <div className="space-y-2 text-sm text-charcoal">
//             <p>
//               <span className="font-medium">Flight:</span> {flightId}
//             </p>

//             <p>
//               <span className="font-medium">Route:</span> KHI → LHR
//             </p>

//             <p>
//               <span className="font-medium">Seats:</span>{" "}
//               {selected.length || "None"}
//             </p>

//             <p>
//               <span className="font-medium">Seat Number:</span>{" "}
//               {selectedSeatNumbers.length
//                 ? selectedSeatNumbers.join(", ")
//                 : "None"}
//             </p>

//             <p>
//               <span className="font-medium">Class:</span> {selected.length ? seats.find((s) => s.seatId === selected[0])?.class : "N/A"}
//             </p>

//             <p>
//               <span className="font-medium">Base Fare:</span> $120
//             </p>

//             <p>
//               <span className="font-medium">Extra:</span> $30
//             </p>

//             <hr />

//             <p className="font-semibold">Total: $150</p>
//           </div>

//           {/* Desktop Actions */}
//           <div className="flex flex-col gap-3 mt-6">
//             <PrimaryButton disabled={!selected.length} onClick={handleLock}>
//               Lock & Continue
//             </PrimaryButton>

//             <SecondaryButton onClick={handleRelease}>
//               Release Seats
//             </SecondaryButton>
//           </div>

//           {formattedTime && (
//             <p className="text-center mt-4 text-red-600 text-sm font-medium">
//               Expires in {formattedTime}
//             </p>
//           )}
//         </aside>
//       </div>

//       {/* LOGIN MODAL */}
//       {showLoginModal && (
//         <div
//           className=" z-50 fixed inset-0 bg-black/50 flex items-center justify-center "
//           onClick={() => setShowLoginModal(false)}
//         >
//           <div className="bg-zinc-100 p-6 rounded-lg text-center">
//             <div className="mb-2">
//               <h2 className="text-xl font-semibold">Please login first</h2>
//               <h2 className="text-sm text-charcoal-100">
//                 For Select, Book or lock{" "}
//               </h2>
//             </div>

//             <div className="flex gap-5">
//             <button className="mt-3 px-4 py-3 bg-gray-300 hover:bg-gray-200 rounded"
//             onClick={() => setShowLoginModal(false)}
//             >
//               Okay
//             </button>
//             <button
//               onClick={() => navigate("/login")}
//               className="mt-3 px-4 py-3 bg-charcoal hover:bg-charcoal-50 text-white rounded"
//             >
//               Go to Login
//             </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// /* --------------------------------
//    UI Helpers
// -------------------------------- */

// function PrimaryButton({ children, ...props }) {
//   return (
//     <button
//       {...props}
//       className="
//         w-full
//         py-2.5
//         rounded-lg
//         bg-charcoal
//         text-white
//         font-medium
//         hover:bg-charcoal-100
//         transition
//         disabled:opacity-50
//         disabled:cursor-not-allowed
//       "
//     >
//       {children}
//     </button>
//   );
// }

// function SecondaryButton({ children, ...props }) {
//   return (
//     <button
//       {...props}
//       className="
//         w-full
//         py-2.5
//         rounded-lg
//         bg-slate-100
//         hover:bg-slate-200
//         font-medium
//         transition
//       "
//     >
//       {children}
//     </button>
//   );
// }

// function Legend() {
//   const items = [
//     { color: "bg-gray-200", label: "Locked" },
//     { color: "bg-gray-400", label: "Booked" },
//     { color: "bg-green-500", label: "Selected" },
//     { color: "bg-yellow-400", label: "First" },
//     { color: "bg-sky-300", label: "Business" },
//     { color: "bg-emerald-200", label: "Economy" },
//   ];

//   return (
//     <div className="flex flex-wrap justify-center gap-4 mb-6 text-xs">
//       {items.map((i) => (
//         <div key={i.label} className="flex items-center gap-2">
//           <div className={`w-3.5 h-3.5 rounded ${i.color}`} />
//           <span>{i.label}</span>
//         </div>
//       ))}
//     </div>
//   );
// }
