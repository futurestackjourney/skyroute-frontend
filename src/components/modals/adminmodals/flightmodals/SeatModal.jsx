import { useState } from "react";
import ModalShell from "./ModalShell";
import { updateSeats } from "../../../../api/adminFlights";
import { showError, showSuccess } from "../../../../utils/toast";
import { Trash2, Plus } from "lucide-react";

const CLASS_OPTIONS = ["Economy", "Business", "First"];

const inputCls = "h-9 px-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all";

const SeatModal = ({ flight, initialSeats, onClose }) => {
  const [seats,   setSeats]   = useState(
    initialSeats.map((s) => ({ ...s, features: s.features ?? [] }))
  );
  const [saving,  setSaving]  = useState(false);

  // ── seat mutations ─────────────────────────────────────────────────
  const updateSeat = (seatId, field, value) =>
    setSeats((prev) =>
      prev.map((s) =>
        s.seatId !== seatId ? s
          : { ...s, [field]: field === "price" ? Number(value) : value }
      )
    );

  const removeSeat = (seatId) =>
    setSeats((prev) => prev.filter((s) => s.seatId !== seatId));

  const addSeat = () =>
    setSeats((prev) => [
      ...prev,
      { seatId: `new_${Date.now()}`, seatNumber: "", class: "Economy", price: 0, isLocked: false, isBooked: false, features: [] },
    ]);

  // ── feature mutations ──────────────────────────────────────────────
  const updateFeature = (seatId, fIdx, field, value) =>
    setSeats((prev) =>
      prev.map((s) =>
        s.seatId !== seatId ? s : {
          ...s,
          features: s.features.map((f, i) =>
            i !== fIdx ? f : { ...f, [field]: field === "priceModifier" ? Number(value) : value }
          ),
        }
      )
    );

  const addFeature = (seatId) =>
    setSeats((prev) =>
      prev.map((s) =>
        s.seatId !== seatId ? s : {
          ...s,
          features: [...s.features, { seatFeatureId: `new_${Date.now()}`, name: "", priceModifier: 0 }],
        }
      )
    );

  const removeFeature = (seatId, fIdx) =>
    setSeats((prev) =>
      prev.map((s) =>
        s.seatId !== seatId ? s : { ...s, features: s.features.filter((_, i) => i !== fIdx) }
      )
    );

  // ── save ALL seats at once (BUG FIX: was "save per row" confusion) ──
  const handleSave = async () => {
    // Validate
    for (const s of seats) {
      if (!s.seatNumber.trim()) { showError("Every seat needs a seat number"); return; }
      if (s.price < 0)          { showError(`Negative price on seat ${s.seatNumber}`); return; }
      for (const f of s.features) {
        if (!f.name.trim()) { showError(`Feature on seat ${s.seatNumber} needs a name`); return; }
      }
    }

    try {
      setSaving(true);
      const dto = seats.map((s) => ({
        seatId:     typeof s.seatId === "string" && s.seatId.startsWith("new_") ? 0 : s.seatId,
        seatNumber: s.seatNumber,
        class:      s.class,
        price:      s.price,
        features:   s.features.map((f) => ({
          seatFeatureId: typeof f.seatFeatureId === "string" && f.seatFeatureId.startsWith("new_") ? 0 : f.seatFeatureId,
          name:          f.name,
          priceModifier: f.priceModifier,
        })),
      }));
      await updateSeats(flight.flightId, dto);
      showSuccess(`Seats for ${flight.flightNumber} saved`);
      onClose();
    } catch (err) {
      showError("Failed to save seats");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      title="Manage Seats"
      subtitle={`${flight.flightNumber} · ${seats.length} seat${seats.length !== 1 ? "s" : ""}`}
      onClose={onClose}
      maxWidth="max-w-4xl"
    >
      <div className="px-6 py-4">
        {seats.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-slate-400 gap-2">
            <span className="text-4xl">💺</span>
            <p className="text-sm">No seats yet. Add one below.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Column headers */}
            <div className="grid grid-cols-[90px_130px_110px_1fr_36px] gap-3 px-3">
              {["Seat #", "Class", "Price ($)", "Features", ""].map((h) => (
                <span key={h} className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</span>
              ))}
            </div>

            {seats.map((seat) => (
              <div key={seat.seatId} className="grid grid-cols-[90px_130px_110px_1fr_36px] gap-3 items-start bg-slate-50 rounded-xl p-3 border border-slate-100">
                {/* Seat number */}
                <input
                  value={seat.seatNumber}
                  onChange={(e) => updateSeat(seat.seatId, "seatNumber", e.target.value)}
                  placeholder="1A"
                  className={`${inputCls} w-full`}
                />

                {/* Class */}
                <select
                  value={seat.class}
                  onChange={(e) => updateSeat(seat.seatId, "class", e.target.value)}
                  className={`${inputCls} w-full`}
                >
                  {CLASS_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>

                {/* Price */}
                <input
                  type="number"
                  min="0"
                  value={seat.price}
                  onChange={(e) => updateSeat(seat.seatId, "price", e.target.value)}
                  className={`${inputCls} w-full`}
                />

                {/* Features */}
                <div className="space-y-1.5">
                  {seat.features.map((f, fIdx) => (
                    <div key={f.seatFeatureId} className="flex items-center gap-1.5">
                      <input
                        value={f.name}
                        onChange={(e) => updateFeature(seat.seatId, fIdx, "name", e.target.value)}
                        placeholder="Feature name"
                        className={`${inputCls} flex-1 min-w-0`}
                      />
                      <span className="text-xs text-slate-400 flex-shrink-0">+$</span>
                      <input
                        type="number"
                        min="0"
                        value={f.priceModifier}
                        onChange={(e) => updateFeature(seat.seatId, fIdx, "priceModifier", e.target.value)}
                        className={`${inputCls} w-16`}
                      />
                      <button
                        onClick={() => removeFeature(seat.seatId, fIdx)}
                        className="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0"
                        title="Remove feature"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addFeature(seat.seatId)}
                    className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
                  >
                    <Plus size={12} /> Add feature
                  </button>
                </div>

                {/* Remove seat */}
                <button
                  onClick={() => removeSeat(seat.seatId)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors mt-0.5"
                  title="Remove seat"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/80 rounded-b-2xl flex-shrink-0">
        <button
          onClick={addSeat}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Plus size={15} /> Add Seat
        </button>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-slate-800 rounded-lg
              hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {saving ? "Saving…" : "Save All Seats"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default SeatModal;