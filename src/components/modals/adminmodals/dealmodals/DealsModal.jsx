const DealsModal = ({ title, form, setForm, onClose, onSubmit }) => {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg space-y-3 w-full max-w-135 max-h-[85vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-bold text-xl text-charcoal">{title}</h2>

        {/* Title */}
        <div className="relative p-2">
          <label className="form-label">Deal Title</label>
          <input
            placeholder="Deal Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="form-input w-full"
          />
        </div>

        {/* Description */}
        <div className="relative p-2">
          <label className="form-label">Description</label>
          <textarea
            rows={3}
            placeholder="Deal Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="form-input w-full"
          />
        </div>

        {/* Flight / Hotel / Room IDs */}
        <div className="grid grid-cols-3 gap-2">
          <div className="relative p-2">
            <label className="form-label">Flight ID</label>
            <input
              type="number"
              placeholder="Flight ID"
              value={form.flightId}
              onChange={(e) => setForm({ ...form, flightId: e.target.value })}
              className="form-input w-full"
            />
          </div>
          <div className="relative p-2">
            <label className="form-label">Hotel ID</label>
            <input
              type="number"
              placeholder="Hotel ID"
              value={form.hotelId}
              onChange={(e) => setForm({ ...form, hotelId: e.target.value })}
              className="form-input w-full"
            />
          </div>
          <div className="relative p-2">
            <label className="form-label">Room ID</label>
            <input
              type="number"
              placeholder="Room ID"
              value={form.roomId}
              onChange={(e) => setForm({ ...form, roomId: e.target.value })}
              className="form-input w-full"
            />
          </div>
        </div>

        {/* Nights / Max Guests / Discount */}
        <div className="grid grid-cols-3 gap-2">
          <div className="relative p-2">
            <label className="form-label">Nights</label>
            <input
              type="number"
              placeholder="Nights"
              value={form.nights}
              onChange={(e) => setForm({ ...form, nights: e.target.value })}
              className="form-input w-full"
            />
          </div>
          <div className="relative p-2">
            <label className="form-label">Max Guests</label>
            <input
              type="number"
              placeholder="Max Guests"
              value={form.maxGuests}
              onChange={(e) => setForm({ ...form, maxGuests: e.target.value })}
              className="form-input w-full"
            />
          </div>
          <div className="relative p-2">
            <label className="form-label">Discount %</label>
            <input
              type="number"
              placeholder="Discount %"
              value={form.discountPercentage}
              onChange={(e) =>
                setForm({ ...form, discountPercentage: e.target.value })
              }
              className="form-input w-full"
            />
          </div>
        </div>

        {/* Valid From / Valid To */}
        <div className="grid grid-cols-2 gap-2">
          <div className="relative p-2">
            <label className="form-label">Valid From</label>
            <input
              type="datetime-local"
              value={form.validFrom ? form.validFrom.slice(0, 16) : ""}
              onChange={(e) =>
                setForm({ ...form, validFrom: new Date(e.target.value).toISOString() })
              }
              className="form-input w-full"
            />
          </div>
          <div className="relative p-2">
            <label className="form-label">Valid To</label>
            <input
              type="datetime-local"
              value={form.validTo ? form.validTo.slice(0, 16) : ""}
              onChange={(e) =>
                setForm({ ...form, validTo: new Date(e.target.value).toISOString() })
              }
              className="form-input w-full"
            />
          </div>
        </div>

        {/* isActive toggle — shown only on edit (form has id) */}
        {form.id && (
          <div className="relative p-2 flex items-center gap-3">
            <label className="form-label mb-0">Active</label>
            <input
              type="checkbox"
              checked={form.isActive ?? true}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 accent-charcoal"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-2">
          <button
            onClick={onClose}
            className="px-3 py-2 bg-gray-300 text-charcoal rounded"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-3 py-2 bg-charcoal text-white rounded"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default DealsModal;