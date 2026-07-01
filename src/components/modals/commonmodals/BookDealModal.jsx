import { useState } from "react";
import { X, Plus, Trash2, User, Plane, Hotel, Tag } from "lucide-react";
import { bookDeal, getAllActiveDeals } from "../../../api/deals";
import { showError, showSuccess } from "../../../utils/toast";
import { parseApiError } from "../../../utils/apiError";

const IMAGE_BASE_URL = "https://localhost:7042";

const emptyPassenger = () => ({
  firstName: "",
  lastName: "",
  gender: "Male",
  dateOfBirth: "",
  passportNumber: "",
  nationality: "",
});

export default function BookDealModal({ deal, onClose, onBooked }) {
  const [passengers, setPassengers] = useState([emptyPassenger()]);
  const [loading, setLoading] = useState(false);

  const updatePassenger = (i, key, val) => {
    const next = [...passengers];
    next[i][key] = val;
    setPassengers(next);
  };

  const addPassenger = () => {
    if (passengers.length >= deal.maxGuests) return;
    setPassengers([...passengers, emptyPassenger()]);
  };

  const removePassenger = (i) => {
    if (passengers.length === 1) return;
    setPassengers(passengers.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    // Basic validation
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.firstName || !p.lastName || !p.passportNumber || !p.nationality || !p.dateOfBirth) {
        showError(`Please fill all fields for Passenger ${i + 1}`);
        return;
      }
    }
    try {
      setLoading(true);
      const res = await bookDeal({
        travelDealId: deal.id,
        passengers,
      });
      showSuccess(`Booking confirmed! #${res.bookingNumber}`);
      onBooked?.(res);
      onClose();
    } catch (err) {
      showError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between rounded-t-3xl">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-pumpkin mb-0.5">
              Book Deal
            </p>
            <h2 className="text-xl font-black text-charcoal leading-tight">
              {deal.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* ── Deal Summary ── */}
          <div className="rounded-2xl bg-charcoal/4 border border-charcoal/6 p-5 grid grid-cols-2 gap-4">
            {/* Hotel */}
            <div className="flex items-start gap-3">
              {deal.hotelImageUrl && (
                <img
                  src={`${IMAGE_BASE_URL}${deal.hotelImageUrl}`}
                  alt={deal.hotelName}
                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                />
              )}
              <div>
                <p className="text-[.7rem] uppercase tracking-widest text-gray-400 font-semibold flex items-center gap-1">
                  <Hotel size={10} /> Hotel
                </p>
                <p className="text-sm font-bold text-charcoal">{deal.hotelName}</p>
                <p className="text-xs text-gray-400">
                  {deal.hotelCity}, {deal.hotelCountry}
                </p>
                <p className="text-xs text-gray-400">
                  {deal.roomType} · {deal.nights} nights
                </p>
              </div>
            </div>

            {/* Flight */}
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-charcoal flex items-center justify-center shrink-0">
                <Plane size={18} className="text-white" />
              </div>
              <div>
                <p className="text-[.7rem] uppercase tracking-widest text-gray-400 font-semibold flex items-center gap-1">
                  <Plane size={10} /> Flight
                </p>
                <p className="text-sm font-bold text-charcoal">{deal.airlineName}</p>
                <p className="text-xs text-gray-400">
                  {deal.origin} → {deal.destination}
                </p>
                <p className="text-xs text-gray-400">
                  Max {deal.maxGuests} guests
                </p>
              </div>
            </div>

            {/* Pricing */}
            <div className="col-span-2 pt-3 border-t border-charcoal/6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag size={13} className="text-pumpkin" />
                <span className="text-xs text-gray-400 line-through">
                  USD {deal.originalPrice?.toLocaleString()}
                </span>
                <span className="text-lg font-black text-charcoal">
                  USD {deal.dealPrice?.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-white bg-pumpkin rounded-full px-2 py-0.5">
                  {deal.discountPercentage}% OFF
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {passengers.length} / {deal.maxGuests} guests
              </span>
            </div>
          </div>

          {/* ── Passengers ── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-charcoal text-base flex items-center gap-2">
                <User size={15} /> Passengers
              </h3>
              {passengers.length < deal.maxGuests && (
                <button
                  onClick={addPassenger}
                  className="flex items-center gap-1.5 text-xs font-bold text-pumpkin hover:text-pumpkin/80 transition-colors"
                >
                  <Plus size={13} /> Add Passenger
                </button>
              )}
            </div>

            {passengers.map((p, i) => (
              <div
                key={i}
                className="border border-gray-100 rounded-2xl p-5 space-y-3 bg-gray-50/50"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Passenger {i + 1}
                  </p>
                  {passengers.length > 1 && (
                    <button
                      onClick={() => removePassenger(i)}
                      className="text-red-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">First Name</label>
                    <input
                      className="form-input w-full"
                      placeholder="First Name"
                      value={p.firstName}
                      onChange={(e) => updatePassenger(i, "firstName", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label">Last Name</label>
                    <input
                      className="form-input w-full"
                      placeholder="Last Name"
                      value={p.lastName}
                      onChange={(e) => updatePassenger(i, "lastName", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Gender</label>
                    <select
                      className="form-input w-full"
                      value={p.gender}
                      onChange={(e) => updatePassenger(i, "gender", e.target.value)}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      className="form-input w-full"
                      value={p.dateOfBirth}
                      onChange={(e) => updatePassenger(i, "dateOfBirth", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Passport Number</label>
                    <input
                      className="form-input w-full"
                      placeholder="AA-1234567"
                      value={p.passportNumber}
                      onChange={(e) => updatePassenger(i, "passportNumber", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label">Nationality</label>
                    <input
                      className="form-input w-full"
                      placeholder="e.g. Pakistani"
                      value={p.nationality}
                      onChange={(e) => updatePassenger(i, "nationality", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-8 py-5 flex items-center justify-between rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-gray-100 text-charcoal text-sm font-semibold hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-7 py-2.5 rounded-full bg-charcoal text-white text-sm font-bold hover:bg-pumpkin transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Booking…" : `Confirm Booking — USD ${deal.dealPrice?.toLocaleString()}`}
          </button>
        </div>
      </div>
    </div>
  );
}