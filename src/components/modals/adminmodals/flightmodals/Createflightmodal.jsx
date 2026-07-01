import { useState } from "react";
import ModalShell from "./ModalShell";
import FlightFormFields from "./FlightFormFields";
import { createFlight } from "../../../../api/adminFlights";
import { showError, showSuccess } from "../../../../utils/toast";
import { parseApiError } from "../../../../utils/apiError";

const EMPTY = {
  flightNumber: "",
  origin: "",
  destination: "",
  departureTime: "",
  arrivalTime: "",
  basePrice: "",
  aircraftId: "",
  status: "",
};


const REQUIRED = ["flightNumber", "origin", "destination", "departureTime", "arrivalTime", "aircraftId", "basePrice"];

const CreateFlightModal = ({ aircraftList, onClose, onCreated }) => {
  const [form,             setForm]             = useState(EMPTY);
  const [selectedAircraft, setSelectedAircraft] = useState(null);
  const [errors,           setErrors]           = useState({});
  const [creating,         setCreating]         = useState(false);

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleAircraftChange = (aircraft) => {
    setSelectedAircraft(aircraft);
    setForm((prev) => ({ ...prev, aircraftId: aircraft?.aircraftId ?? "" }));
  };

  const validate = () => {
    const errs = {};
    REQUIRED.forEach((f) => { if (form[f] === "" || form[f] === null || form[f] === undefined) errs[f] = true; });
    if (form.basePrice !== "" && Number(form.basePrice) < 0) errs.basePrice = true;
    if (form.departureTime && form.arrivalTime && new Date(form.arrivalTime) <= new Date(form.departureTime))
      errs.arrivalTime = true;
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      showError(errs.arrivalTime && !errs.departureTime
        ? "Arrival must be after departure"
        : "Please fill all required fields");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setCreating(true);
      const payload = {
        ...form,
        aircraftId: Number(form.aircraftId),
        basePrice: Number(form.basePrice),
      };
      const created = await createFlight(payload);
      showSuccess("Flight created successfully");
      onCreated(created);
      onClose();
    } catch (err) {
      showError(parseApiError(err));
    } finally {
      setCreating(false);
    }
  };

  return (
    <ModalShell title="Create Flight" subtitle="Add a new flight to the schedule" onClose={onClose}>
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
          disabled={creating}
          onClick={handleSubmit}
          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-slate-800 rounded-lg
            hover:bg-slate-700 active:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {creating && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {creating ? "Creating…" : "Create Flight"}
        </button>
      </div>
    </ModalShell>
  );
};

export default CreateFlightModal;