import { useState } from "react";
import { createBooking } from "../api/bookings";
import { useNavigate, useLocation } from "react-router-dom";
import {
  User, CreditCard, ChevronRight, AlertCircle, CheckCircle2,
  Plane, Shield, Info, X, Users
} from "lucide-react";

// ─── Field component ──────────────────────────────────────────────────────────
const Field = ({ label, icon: Icon, error, children }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
      {Icon && <Icon size={11} />}
      {label}
    </label>
    {children}
    {error && (
      <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
        <AlertCircle size={11} />
        {error}
      </p>
    )}
  </div>
);

const inputCls = (hasError) =>
  `w-full h-11 px-3.5 text-sm border rounded-xl bg-white text-slate-800
   placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all
   ${hasError
     ? "border-red-300 focus:ring-red-100 bg-red-50/30"
     : "border-slate-200 focus:ring-slate-200 focus:border-slate-400"
   }`;

// ─── Passenger card ───────────────────────────────────────────────────────────
const PassengerCard = ({ passenger, index, onChange, errors, isExpanded, onToggle, total }) => {
  const isFilled = passenger.fullName.trim() && passenger.passportNumber.trim();
  const hasErrors = errors[`${index}.fullName`] || errors[`${index}.passportNumber`];

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-200
      ${hasErrors ? "border-red-200" : isFilled ? "border-emerald-200" : "border-slate-200"}`}>

      {/* Card header */}
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-5 py-4 transition-colors text-left
          ${isExpanded ? "bg-slate-50" : "bg-white hover:bg-slate-50/60"}`}
      >
        <div className="flex items-center gap-3">
          {/* Status icon */}
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
            ${hasErrors ? "bg-red-100" : isFilled ? "bg-emerald-100" : "bg-slate-100"}`}>
            {hasErrors
              ? <AlertCircle size={16} className="text-red-500" />
              : isFilled
              ? <CheckCircle2 size={16} className="text-emerald-500" />
              : <User size={16} className="text-slate-400" />
            }
          </div>

          <div>
            <p className="text-sm font-bold text-slate-800">
              {passenger.fullName.trim() || `Passenger ${index + 1}`}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {total > 1 ? `Seat ${index + 1} of ${total}` : "Single passenger"}
              {isFilled && !hasErrors && (
                <span className="ml-2 text-emerald-500 font-medium">· Complete</span>
              )}
            </p>
          </div>
        </div>

        <div className={`w-6 h-6 flex items-center justify-center rounded-full
          bg-slate-100 text-slate-400 transition-transform duration-200
          ${isExpanded ? "rotate-90" : ""}`}>
          <ChevronRight size={13} />
        </div>
      </button>

      {/* Collapsible fields */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-4 space-y-4 border-t border-slate-100 bg-white">
          <Field label="Full Name" icon={User} error={errors[`${index}.fullName`]?.[0]}>
            <input
              className={inputCls(!!errors[`${index}.fullName`])}
              placeholder="As shown on passport"
              value={passenger.fullName}
              onChange={(e) => onChange(index, "fullName", e.target.value)}
              autoComplete="name"
            />
          </Field>

          <Field label="Passport Number" icon={CreditCard} error={errors[`${index}.passportNumber`]?.[0]}>
            <input
              className={inputCls(!!errors[`${index}.passportNumber`])}
              placeholder="e.g. AB1234567"
              value={passenger.passportNumber}
              onChange={(e) => onChange(index, "passportNumber", e.target.value.toUpperCase())}
              autoComplete="off"
              spellCheck={false}
            />
          </Field>
        </div>
      )}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const Booking = () => {
  const navigate  = useNavigate();
  const { state } = useLocation();
  const { flightId, seatIds } = state ?? { flightId: null, seatIds: [] };

  const [passengers, setPassengers] = useState(
    seatIds.map((seatId) => ({ fullName: "", passportNumber: "", seatId }))
  );
  const [expandedIndex, setExpandedIndex] = useState(0); // first card open by default
  const [error,   setError]   = useState("");
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const filledCount = passengers.filter((p) => p.fullName.trim() && p.passportNumber.trim()).length;
  const allFilled   = filledCount === passengers.length;

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleChange = (index, field, value) => {
    setPassengers((prev) => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
    const key = `${index}.${field}`;
    if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setErrors({});
    setLoading(true);

    try {
      const booking = await createBooking({ flightId, seatIds, passengers });
      navigate(`/booking/profile/payment/${booking.bookingId}`);
    } catch (err) {
      const data = err.response?.data;

      if (data?.errors) {
        const normalized = {};
        Object.entries(data.errors).forEach(([key, value]) => {
          const match = key.match(/Passengers\[(\d+)\]\.(\w+)/);
          if (match) {
            const idx   = match[1];
            const field = match[2].charAt(0).toLowerCase() + match[2].slice(1);
            normalized[`${idx}.${field}`] = value;
            // Auto-expand first errored card
            setExpandedIndex(Number(idx));
          }
        });
        setErrors(normalized);
      } else {
        setError(data?.message ?? "Booking failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

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
              <p className="text-xs text-slate-400 leading-none">Flight {flightId}</p>
              <p className="text-sm font-bold text-slate-800 leading-tight">Passenger Details</p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs">
            <span className="px-2.5 py-1 text-slate-400 font-medium">1 Seats</span>
            <ChevronRight size={13} className="text-slate-400" />
            <span className="px-2.5 py-1 bg-slate-900 text-white rounded-full font-semibold">2 Details</span>
            <ChevronRight size={13} className="text-slate-400" />
            <span className="px-2.5 py-1 text-slate-400 font-medium">3 Payment</span>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-5xl mx-auto px-4 py-8 grid lg:grid-cols-[1fr_320px] gap-6 items-start">

        {/* ── LEFT: Form ── */}
        <div>
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center">
                <Users size={16} className="text-white" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Passenger Details</h1>
            </div>
            <p className="text-sm text-slate-500 ml-12">
              {passengers.length === 1
                ? "Enter your details to complete the booking."
                : `Enter details for all ${passengers.length} passengers.`}
            </p>
          </div>

          {/* Progress bar */}
          {passengers.length > 1 && (
            <div className="mb-5">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-500 font-medium">
                  {filledCount} of {passengers.length} passengers complete
                </span>
                <span className={`font-semibold ${allFilled ? "text-emerald-600" : "text-slate-500"}`}>
                  {Math.round((filledCount / passengers.length) * 100)}%
                </span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${(filledCount / passengers.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Global error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm text-red-700">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
              <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Passenger cards */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {passengers.map((p, i) => (
              <PassengerCard
                key={i}
                index={i}
                passenger={p}
                errors={errors}
                total={passengers.length}
                isExpanded={expandedIndex === i}
                onToggle={() => setExpandedIndex((prev) => prev === i ? -1 : i)}
                onChange={handleChange}
              />
            ))}

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-slate-900 text-white text-sm font-bold
                  hover:bg-slate-700 active:bg-slate-900
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-150 flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    Continue to Payment
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ── RIGHT: Sidebar ── */}
        <aside className="space-y-4 sticky top-20">

          {/* Booking summary */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Plane size={14} className="text-slate-400 -rotate-45" />
              <h2 className="text-sm font-bold text-slate-800">Booking Summary</h2>
            </div>
            <div className="px-5 py-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Flight</span>
                <span className="font-semibold text-slate-800">{flightId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Passengers</span>
                <span className="font-semibold text-slate-800">{passengers.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Seats</span>
                <span className="font-semibold text-slate-800">{seatIds.length}</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Info size={14} className="text-slate-400" />
              <h2 className="text-sm font-bold text-slate-800">Important Notes</h2>
            </div>
            <div className="px-5 py-4 space-y-4">
              {[
                {
                  title: "Full Name",
                  body: "Enter exactly as shown on your passport — first, middle (if any), and last name. Letters and spaces only.",
                },
                {
                  title: "Passport Number",
                  body: "Enter as printed on your passport. No spaces or special characters. Letters and numbers only.",
                },
                {
                  title: "Multiple Passengers",
                  body: "Each passenger needs their own details. Names must match travel documents exactly.",
                },
              ].map(({ title, body }) => (
                <div key={title}>
                  <p className="text-xs font-bold text-slate-700 mb-1">{title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trust badge */}
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3.5">
            <Shield size={18} className="text-emerald-500 shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-800">Secure Booking</p>
              <p className="text-xs text-emerald-600 mt-0.5">Your data is encrypted and never shared.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Booking;




// import { useState } from "react";
// import { createBooking } from "../api/bookings";
// import { useNavigate, useLocation } from "react-router-dom";

// const Booking = () => {
//   const navigate = useNavigate();
//   const { state } = useLocation();
//   const { flightId, seatIds } = state;

//   const [passengers, setPassengers] = useState(
//     seatIds.map((seatId) => ({
//       fullName: "",
//       passportNumber: "",
//       seatId,
//     }))
//   );

//   const [error, setError] = useState("");
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);

//   const handleChange = (index, field, value) => {
//     const updated = [...passengers];
//     updated[index][field] = value;
//     setPassengers(updated);

//     // Remove field error when typing (same as login)
//     const key = `${index}.${field}`;
//     if (errors[key]) {
//       setErrors((prev) => {
//         const newErrors = { ...prev };
//         delete newErrors[key];
//         return newErrors;
//       });
//     }

//     if (error) setError("");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setErrors({});
//     setLoading(true);

//     try {
//       const booking = await createBooking({
//         flightId,
//         seatIds,
//         passengers,
//       });

//       navigate(`/user/profile/payment/${booking.bookingId}`);
//     } catch (err) {
//       const data = err.response?.data;

//       if (data?.errors) {
//         /*
//           Convert backend keys like:
//           "Passengers[0].FullName"
//           into:
//           "0.fullName"
//         */
//         const normalizedErrors = {};

//         Object.entries(data.errors).forEach(([key, value]) => {
//           const match = key.match(/Passengers\[(\d+)\]\.(\w+)/);
//           if (match) {
//             const index = match[1];
//             const field =
//               match[2].charAt(0).toLowerCase() + match[2].slice(1);
//             normalizedErrors[`${index}.${field}`] = value;
//           }
//         });

//         setErrors(normalizedErrors);
//       } else if (data?.message) {
//         setError(data.message);
//       } else {
//         setError("Booking failed. Please try again.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="padding-x py-18 sm:py-22 bg-white">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       <div className="shadow-sm px-6 py-6 rounded-lg ">
//         <h2 className="text-4xl mb-6 font-tech">Passenger Details</h2>

//         {error && (
//           <div className="bg-red-100 text-red-700 p-2 mb-4 rounded text-sm">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit}>
//           {passengers.map((p, i) => (
//             <div key={i}>
//               <h3 className="text-2xl mb-4">
//                 {i === 0 ? "Passenger" : `Passenger ${i + 1}`}
//               </h3>

//               <div className="mb-4 relative">
//                 {/* <label className="form-label">Full Name</label> */}
//                 <input
//                   className="form-input"
//                   placeholder="Full Name"
//                   value={p.fullName}
//                   onChange={(e) =>
//                     handleChange(i, "fullName", e.target.value)
//                   }
//                 />
//                 {errors[`${i}.fullName`] && (
//                   <p className="error-message">
//                     {errors[`${i}.fullName`][0]}
//                   </p>
//                 )}
//               </div>

//               <div className="mb-4 relative">
//                 {/* <label className="form-label">Passport Number</label> */}
//                 <input
//                   className="form-input"
//                   placeholder="Passport Number"
//                   value={p.passportNumber}
//                   onChange={(e) =>
//                     handleChange(i, "passportNumber", e.target.value)
//                   }
//                 />
//                 {errors[`${i}.passportNumber`] && (
//                   <p className="error-message">
//                     {errors[`${i}.passportNumber`][0]}
//                   </p>
//                 )}
//               </div>
//             </div>
//           ))}

//           <button
//             type="submit"
//             disabled={loading}
//             className="form-btn"
//           >
//             {loading ? "Processing..." : "Continue to Payment"}
//           </button>
//         </form>
//       </div>
//       {/* LEFT: Instructions / Manual */}
//     <div className="p-6 rounded-lg shadow-sm space-y-4 h-max sticky top-6">
//       <h2 className="text-4xl text-charcoal font-semi-bold mb-4 font-tech">How to Fill Passenger Details</h2>
//       <p className="text-charcoal-100 text-sm">
//         Please provide each passenger's information carefully to ensure smooth check-in.
//       </p>

//       <div className="space-y-3">
//         <div>
//           <h3 className="text-charcoal font-semibold">Full Name</h3>
//           <p className="text-charcoal-100 text-sm">
//             Enter the passenger's full legal name as shown on their passport. 
//             Include first name, middle name (if any), and last name. 
//             Only letters and spaces are allowed.
//           </p>
//         </div>

//         <div>
//           <h3 className="text-charcoal font-semibold">Passport Number</h3>
//           <p className="text-charcoal-100 text-sm">
//             Enter the passport number exactly as printed on the passport.
//             Only letters and numbers are allowed. No spaces or special characters.
//           </p>
//         </div>

//         <div>
//           <h3 className="text-charcoal font-semibold">Multiple Passengers</h3>
//           <p className="text-charcoal-100 text-sm">
//             If you are booking for multiple passengers, fill in the details for each passenger in the form on the right. 
//             Make sure each passenger’s full name and passport number are correct.
//           </p>
//         </div>

//         <div>
//           <h3 className="text-charcoal font-semibold">Tips</h3>
//           <ul className="list-disc list-inside text-charcoal-100 text-sm space-y-1">
//             <li>Double-check spelling of names and passport numbers.</li>
//             <li>Ensure the passport is valid for at least 6 months.</li>
//             <li>Do not use special characters or spaces in passport number.</li>
//           </ul>
//         </div>
//       </div>
//     </div>

//       </div>
//     </div>
//   );
// };

// export default Booking;
