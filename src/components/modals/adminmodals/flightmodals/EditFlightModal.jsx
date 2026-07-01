import { useState, useEffect } from "react";
import ModalShell from "./ModalShell";
import FlightFormFields from "./FlightFormFields";
import { updateFlight } from "../../../../api/adminFlights";
import { showError, showSuccess } from "../../../../utils/toast";
import { parseApiError } from "../../../../utils/apiError";


const REQUIRED = ["flightNumber", "origin", "destination", "departureTime", "arrivalTime", "aircraftId", "basePrice"];

const EditFlightModal = ({ flight, aircraftList, onClose, onUpdated }) => {
  const [form,             setForm]             = useState({
    ...flight,
    status: Number(flight.status), // BUG FIX: ensure numeric
  });
  const [selectedAircraft, setSelectedAircraft] = useState(null);
  const [errors,           setErrors]           = useState({});
  const [updating,         setUpdating]         = useState(false);

  // Pre-select aircraft when modal opens – BUG FIX: was a separate useEffect race condition
  useEffect(() => {
    const found = aircraftList.find((a) => a.aircraftId === flight.aircraftId);
    setSelectedAircraft(found ?? null);
  }, [flight.aircraftId, aircraftList]);

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleAircraftChange = (aircraft) => {
    setSelectedAircraft(aircraft);
    setForm((prev) => ({
      ...prev,
      aircraftId: aircraft?.aircraftId ?? "",
      aircraftModel: aircraft?.model ?? prev.aircraftModel,
    }));
  };

  const validate = () => {
    const errs = {};
    REQUIRED.forEach((f) => { if (!form[f] && form[f] !== 0) errs[f] = true; });
    if (form.status === "" || form.status === undefined) errs.status = true;
    if (form.departureTime && form.arrivalTime && new Date(form.arrivalTime) <= new Date(form.departureTime))
      errs.arrivalTime = true;
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      showError(errs.arrivalTime && !errs.departureTime
        ? "Arrival must be after departure"
        : "Please fill all required fields and select a valid aircraft");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setUpdating(true);
      const payload = { ...form, aircraftId: Number(form.aircraftId), basePrice: Number(form.basePrice) };
      const updated = await updateFlight(form.flightId, payload);
      showSuccess("Flight updated successfully");
      onUpdated(updated); // let parent update both lists
      onClose();
    } catch (err) {
      showError(parseApiError(err));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <ModalShell
      title="Edit Flight"
      subtitle={`Editing ${flight.flightNumber} · ${flight.origin} → ${flight.destination}`}
      onClose={onClose}
    >
      <FlightFormFields
        form={form}
        onChange={handleChange}
        aircraftList={aircraftList}
        selectedAircraft={selectedAircraft}
        onAircraftChange={handleAircraftChange}
        errors={errors}
      />

      <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/80 rounded-b-2xl shrink-0">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          disabled={updating}
          onClick={handleSubmit}
          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-slate-800 rounded-lg
            hover:bg-slate-700 active:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {updating && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {updating ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </ModalShell>
  );
};

export default EditFlightModal;