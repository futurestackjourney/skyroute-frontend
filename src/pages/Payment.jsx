import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { payBooking } from "../api/bookings";
import {
  Plane, ChevronRight, Lock, CreditCard, CheckCircle2,
  AlertCircle, X, ShieldCheck, Wifi, Zap
} from "lucide-react";

// ─── Mock card brands ─────────────────────────────────────────────────────────
const CARD_BRANDS = [
  { id: "visa",       label: "Visa",        pattern: /^4/,           icon: "💳" },
  { id: "mastercard", label: "Mastercard",  pattern: /^5[1-5]/,      icon: "💳" },
  { id: "amex",       label: "Amex",        pattern: /^3[47]/,       icon: "💳" },
];

const detectBrand = (num) =>
  CARD_BRANDS.find((b) => b.pattern.test(num.replace(/\s/g, ""))) ?? null;

// ─── Format card number with spaces ──────────────────────────────────────────
const fmtCard = (val) => {
  const digits = val.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
};

// ─── Format expiry MM/YY ──────────────────────────────────────────────────────
const fmtExpiry = (val) => {
  const digits = val.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
};

// ─── Input component ──────────────────────────────────────────────────────────
const CardInput = ({ label, error, children }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
    {children}
    {error && (
      <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
        <AlertCircle size={11} /> {error}
      </p>
    )}
  </div>
);

const inputCls = (hasError) =>
  `w-full h-11 px-3.5 text-sm border rounded-xl bg-white text-slate-800
   placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all font-mono tracking-wider
   ${hasError
     ? "border-red-300 focus:ring-red-100"
     : "border-slate-200 focus:ring-slate-200 focus:border-slate-400"
   }`;

// ─── Credit card visual ───────────────────────────────────────────────────────
const CardPreview = ({ number, name, expiry, flipped, onFlip }) => {
  const brand = detectBrand(number);
  const displayNum = number || "•••• •••• •••• ••••";
  const displayName = name || "YOUR NAME";
  const displayExp  = expiry || "MM/YY";

  return (
    <div
      className="relative w-full max-w-95 mx-auto cursor-pointer select-none"
      style={{ perspective: "1000px", height: "196px" }}
      onClick={onFlip}
      title="Click to flip"
    >
      <div
        className="absolute inset-0 transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-between overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            background: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)",
          }}
        >
          {/* Shine */}
          <div className="absolute inset-0 opacity-20"
            style={{ background: "radial-gradient(ellipse at 30% 20%, white 0%, transparent 60%)" }} />

          {/* Chip + brand */}
          <div className="flex items-start justify-between relative z-10">
            <div className="w-10 h-7 bg-linear-to-br from-amber-300 to-amber-500 rounded-md
              grid grid-cols-2 gap-0.5 p-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-amber-600/30 rounded-sm" />
              ))}
            </div>
            {brand && (
              <span className="text-white/80 text-sm font-bold tracking-widest uppercase">
                {brand.label}
              </span>
            )}
            <Wifi size={18} className="text-white/40 rotate-90" />
          </div>

          {/* Number */}
          <div className="relative z-10">
            <p className="text-white text-xl font-mono tracking-[0.25em] drop-shadow">
              {displayNum}
            </p>
          </div>

          {/* Name + Expiry */}
          <div className="flex items-end justify-between relative z-10">
            <div>
              <p className="text-white/50 text-[10px] uppercase tracking-widest mb-0.5">Card Holder</p>
              <p className="text-white text-sm font-bold tracking-wider truncate max-w-40">
                {displayName.toUpperCase()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/50 text-[10px] uppercase tracking-widest mb-0.5">Expires</p>
              <p className="text-white text-sm font-bold font-mono">{displayExp}</p>
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden flex flex-col justify-center"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
          }}
        >
          {/* Magnetic stripe */}
          <div className="absolute top-8 left-0 right-0 h-12 bg-slate-900/80" />

          {/* CVV strip */}
          <div className="mx-6 mt-16 relative z-10">
            <div className="bg-white rounded-lg px-4 py-2 flex items-center justify-end">
              <p className="text-slate-400 text-xs tracking-widest mr-3">CVV</p>
              <p className="text-slate-800 font-mono font-bold tracking-widest text-sm">•••</p>
            </div>
            <p className="text-white/40 text-xs mt-3 text-center">Click to flip back</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const Payment = () => {
  const { bookingId } = useParams();
  const navigate      = useNavigate();

  const [cardNumber, setCardNumber] = useState("");
  const [cardName,   setCardName]   = useState("");
  const [expiry,     setExpiry]     = useState("");
  const [cvv,        setCvv]        = useState("");
  const [flipped,    setFlipped]    = useState(false);
  const [errors,     setErrors]     = useState({});
  const [paying,     setPaying]     = useState(false);
  const [paid,       setPaid]       = useState(false);
  const [apiError,   setApiError]   = useState("");

  // ── Validation ────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    const rawNum = cardNumber.replace(/\s/g, "");
    if (rawNum.length < 16)   errs.cardNumber = "Enter a valid 16-digit card number";
    if (!cardName.trim())     errs.cardName   = "Name on card is required";
    const [mm, yy] = expiry.split("/");
    if (!mm || !yy || Number(mm) > 12 || Number(mm) < 1)
      errs.expiry = "Enter a valid expiry date";
    if (cvv.length < 3)       errs.cvv        = "CVV must be 3–4 digits";
    return errs;
  };

  // ── Pay handler ───────────────────────────────────────────────────────
  const handlePay = async () => {
    setApiError("");
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    try {
      setPaying(true);
      await payBooking(bookingId);
      setPaid(true);
      // Redirect after brief success moment
      setTimeout(() => navigate("/user/profile/my-bookings"), 2200);
    } catch (err) {
      setApiError(err.response?.data?.message ?? "Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────
  if (paid) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center max-w-sm w-full shadow-xl">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5
            animate-[scale_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)]">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Payment Successful!</h2>
          <p className="text-slate-500 text-sm mb-6">
            Your booking <span className="font-semibold text-slate-700">#{bookingId}</span> is confirmed.
            Redirecting to your bookings…
          </p>
          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full animate-[grow_2.2s_linear]"
              style={{ animation: "width 2.2s linear forwards",
                       ["--tw-translate-x"]: "0" }} />
          </div>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Plane size={15} className="text-white -rotate-45" />
            </div>
            <div>
              <p className="text-xs text-slate-400 leading-none">Booking #{bookingId}</p>
              <p className="text-sm font-bold text-slate-800 leading-tight">Secure Payment</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs">
            <span className="px-2.5 py-1 text-slate-400 font-medium">1 Seats</span>
            <ChevronRight size={13} className="text-slate-400" />
            <span className="px-2.5 py-1 text-slate-400 font-medium">2 Details</span>
            <ChevronRight size={13} className="text-slate-400" />
            <span className="px-2.5 py-1 bg-slate-900 text-white rounded-full font-semibold">3 Payment</span>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-5xl mx-auto px-4 py-8 grid lg:grid-cols-[1fr_300px] gap-6 items-start">

        {/* ── LEFT: Card form ── */}
        <div>
          {/* Card preview */}
          <div className="mb-7">
            <CardPreview
              number={cardNumber}
              name={cardName}
              expiry={expiry}
              flipped={flipped}
              onFlip={() => setFlipped((f) => !f)}
            />
            <p className="text-center text-xs text-slate-400 mt-3">Click card to see CVV side</p>
          </div>

          {/* Form card */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard size={15} className="text-slate-400" />
                <h2 className="text-sm font-bold text-slate-800">Card Details</h2>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Lock size={11} />
                <span>SSL Encrypted</span>
              </div>
            </div>

            <div className="px-5 py-5 space-y-4">
              {/* API error */}
              {apiError && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{apiError}</span>
                  <button onClick={() => setApiError("")} className="ml-auto text-red-400 hover:text-red-600">
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Card number */}
              <CardInput label="Card Number" error={errors.cardNumber}>
                <div className="relative">
                  <input
                    className={inputCls(!!errors.cardNumber)}
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    maxLength={19}
                    inputMode="numeric"
                    onChange={(e) => {
                      setCardNumber(fmtCard(e.target.value));
                      if (errors.cardNumber) setErrors((p) => ({ ...p, cardNumber: undefined }));
                    }}
                  />
                  {detectBrand(cardNumber) && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 tracking-widest">
                      {detectBrand(cardNumber)?.label.toUpperCase()}
                    </span>
                  )}
                </div>
              </CardInput>

              {/* Name */}
              <CardInput label="Name on Card" error={errors.cardName}>
                <input
                  className={inputCls(!!errors.cardName).replace("font-mono tracking-wider", "")}
                  placeholder="John Doe"
                  value={cardName}
                  autoComplete="cc-name"
                  onChange={(e) => {
                    setCardName(e.target.value);
                    if (errors.cardName) setErrors((p) => ({ ...p, cardName: undefined }));
                  }}
                />
              </CardInput>

              {/* Expiry + CVV */}
              <div className="grid grid-cols-2 gap-4">
                <CardInput label="Expiry Date" error={errors.expiry}>
                  <input
                    className={inputCls(!!errors.expiry)}
                    placeholder="MM/YY"
                    value={expiry}
                    maxLength={5}
                    inputMode="numeric"
                    onChange={(e) => {
                      setExpiry(fmtExpiry(e.target.value));
                      if (errors.expiry) setErrors((p) => ({ ...p, expiry: undefined }));
                    }}
                  />
                </CardInput>

                <CardInput label="CVV" error={errors.cvv}>
                  <input
                    className={inputCls(!!errors.cvv)}
                    placeholder="•••"
                    value={cvv}
                    maxLength={4}
                    inputMode="numeric"
                    type="password"
                    onFocus={() => setFlipped(true)}
                    onBlur={() => setFlipped(false)}
                    onChange={(e) => {
                      setCvv(e.target.value.replace(/\D/g, ""));
                      if (errors.cvv) setErrors((p) => ({ ...p, cvv: undefined }));
                    }}
                  />
                </CardInput>
              </div>
            </div>
          </div>

          {/* Pay button */}
          <div className="mt-4">
            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full h-13 rounded-xl bg-slate-900 text-white text-sm font-bold
                hover:bg-slate-700 active:scale-[0.99]
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-150 flex items-center justify-center gap-2 shadow-sm py-3.5"
            >
              {paying ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing Payment…
                </>
              ) : (
                <>
                  <Lock size={15} />
                  Pay Now
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── RIGHT: Sidebar ── */}
        <aside className="space-y-4 sticky top-20">

          {/* Order summary */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800">Order Summary</h2>
            </div>
            <div className="px-5 py-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Booking</span>
                <span className="font-semibold text-slate-800">#{bookingId}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800">Total</span>
                <span className="font-black text-slate-900">— at checkout</span>
              </div>
            </div>
          </div>

          {/* Security badges */}
          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Why it's safe</h3>
            {[
              { icon: ShieldCheck, color: "text-emerald-500", title: "SSL Encryption",     body: "256-bit encryption on all transactions."       },
              { icon: Zap,         color: "text-amber-500",   title: "Instant Confirmation", body: "Booking confirmed the moment payment clears." },
              { icon: Lock,        color: "text-blue-500",    title: "No Data Stored",      body: "Card details are never saved on our servers." },
            ].map(({ icon: Icon, color, title, body }) => (
              <div key={title} className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 ${color}`}>
                  <Icon size={13} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">{title}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Accepted cards */}
          <div className="flex items-center justify-center gap-2">
            {["VISA", "MC", "AMEX"].map((b) => (
              <div key={b} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500">
                {b}
              </div>
            ))}
            <span className="text-xs text-slate-400">& more</span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Payment;




// import { useParams, useNavigate } from "react-router-dom";
// import { payBooking } from "../api/bookings";

// const Payment = () => {
//   const { bookingId } = useParams();
//   const navigate = useNavigate();

//   const handlePay = async () => {
//     await payBooking(bookingId);
//     navigate("/user/profile/my-bookings");
//   };

//   return (
//     <>
//     <div className="padding-x">
//       <h2 className="text-2xl">Payment</h2>
//       <p className="text-lg">Mock payment gateway</p>
//       <button onClick={handlePay} className="px-4 py-2 bg-charcoal rounded-lg text-creame hover:bg-charcoal-100">Pay Now</button>
//     </div>
//     </>
//   );
// };

// export default Payment;
