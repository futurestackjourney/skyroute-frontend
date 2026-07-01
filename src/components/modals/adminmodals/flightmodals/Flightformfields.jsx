import AircraftCombobox from "./AircraftComboBox";
import { STATUS_OPTIONS } from "./FlightStatusBadge";

/**
 * FlightFormFields – shared layout for Create + Edit modals.
 * Props:
 *   form            – current form values object
 *   onChange        – (field, value) => void
 *   aircraftList    – for the combobox
 *   selectedAircraft – current aircraft object or null
 *   onAircraftChange – (aircraft | null) => void
 *   errors          – { [fieldName]: true } optional
 */
const Field = ({ label, required, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = (err) =>
  `h-10 w-full px-3 text-sm border rounded-lg bg-white text-slate-800
   placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all
   ${err ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-blue-100 focus:border-blue-400"}`;

const FlightFormFields = ({ form, onChange, aircraftList, selectedAircraft, onAircraftChange, errors = {} }) => {
  const set = (field) => (e) => onChange(field, e.target.value);

  return (
    <div className="px-6 py-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Flight Number" required>
          <input
            value={form.flightNumber}
            onChange={set("flightNumber")}
            placeholder="e.g. EK-202"
            className={inputCls(errors.flightNumber)}
          />
        </Field>
        <Field label="Aircraft" required>
          <AircraftCombobox
            aircraftList={aircraftList}
            value={selectedAircraft}
            onChange={onAircraftChange}
            hasError={errors.aircraftId}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Origin" required>
          <input
            value={form.origin}
            onChange={set("origin")}
            placeholder="e.g. Dubai (DXB)"
            className={inputCls(errors.origin)}
          />
        </Field>
        <Field label="Destination" required>
          <input
            value={form.destination}
            onChange={set("destination")}
            placeholder="e.g. London (LHR)"
            className={inputCls(errors.destination)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Departure Time" required>
          <input
            type="datetime-local"
            value={form.departureTime}
            onChange={set("departureTime")}
            className={inputCls(errors.departureTime)}
          />
        </Field>
        <Field label="Arrival Time" required>
          <input
            type="datetime-local"
            value={form.arrivalTime}
            onChange={set("arrivalTime")}
            className={inputCls(errors.arrivalTime)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Base Price ($)" required>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.basePrice ?? ""}
              onChange={(e) => onChange("basePrice", e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="0.00"
              className={`${inputCls(errors.basePrice)} pl-7`}
            />
          </div>
        </Field>

        <Field label="Status" required>
          <select
            value={form.status ?? ""}
            onChange={(e) => onChange("status", Number(e.target.value))}
            className={inputCls(errors.status)}
          >
            <option value="">Select status…</option>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>
      </div>
    </div>
  );
};

export default FlightFormFields;