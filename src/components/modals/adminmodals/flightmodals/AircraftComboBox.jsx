import { useState, useEffect, useRef } from "react";
import { ChevronDown, X } from "lucide-react";

/**
 * Reusable searchable aircraft selector.
 * Props:
 *   aircraftList  – full list of { aircraftId, model, airlineName }
 *   value         – selected aircraft object or null
 *   onChange      – (aircraft | null) => void
 *   placeholder   – string
 *   hasError      – boolean
 */
const AircraftCombobox = ({
  aircraftList = [],
  value,
  onChange,
  placeholder = "Search aircraft…",
  hasError = false,
}) => {
  const [query, setQuery] = useState("");
  const [open, setOpen]   = useState(false);
  const ref               = useRef(null);

  // Sync display text when value changes from parent (e.g. modal opens with prefilled)
  useEffect(() => {
    if (value) setQuery(`${value.model} (${value.airlineName})`);
    else       setQuery("");
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const down = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", down);
    return () => document.removeEventListener("mousedown", down);
  }, []);

  const filtered = query.trim()
    ? aircraftList.filter((a) =>
        `${a.model} ${a.airlineName}`.toLowerCase().includes(query.toLowerCase())
      )
    : aircraftList;

  const handleInput = (e) => {
    setQuery(e.target.value);
    setOpen(true);
    if (value) onChange(null); // clear selection when user types
  };

  const select = (a) => {
    onChange(a);
    setOpen(false);
  };

  const clear = (e) => {
    e.stopPropagation();
    onChange(null);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={`w-full h-10 pl-3 pr-8 text-sm border rounded-lg bg-white text-slate-800
            placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all
            ${hasError
              ? "border-red-400 focus:ring-red-200"
              : "border-slate-200 focus:ring-blue-100 focus:border-blue-400"
            }`}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          {value ? (
            <button onMouseDown={clear} className="pointer-events-auto hover:text-slate-600">
              <X size={14} />
            </button>
          ) : (
            <ChevronDown size={14} />
          )}
        </span>
      </div>

      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 overflow-y-auto divide-y divide-slate-50">
          {filtered.map((a) => (
            <li
              key={a.aircraftId}
              onMouseDown={() => select(a)}
              className={`flex items-center justify-between px-3 py-2.5 cursor-pointer text-sm
                hover:bg-slate-50 transition-colors
                ${value?.aircraftId === a.aircraftId ? "bg-blue-50 text-blue-700" : "text-slate-700"}`}
            >
              <span className="font-medium">{a.model}</span>
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {a.airlineName}
              </span>
            </li>
          ))}
        </ul>
      )}

      {open && filtered.length === 0 && query.trim() && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl px-4 py-3 text-sm text-slate-400">
          No aircraft found for "{query}"
        </div>
      )}
    </div>
  );
};

export default AircraftCombobox;