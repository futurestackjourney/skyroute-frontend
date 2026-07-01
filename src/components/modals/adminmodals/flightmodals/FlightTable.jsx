import { useState, useRef, useEffect } from "react";
import { ChevronsUpDown, MoreVertical, Pencil, Armchair } from "lucide-react";
import FlightStatusBadge from "./FlightStatusBadge";
import { Plane } from "lucide-react";

const fmt = {
  date: (d) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
  time: (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  price: (n) => n != null ? `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—",
};

const COLS = ["Flight", "Route", "Base Price", "Departure", "Arrival", "Status", ""];

const ActionMenu = ({ flight, onEdit, onSeats, onClose }) => {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-4 top-1 mt-1 z-40 bg-white border border-slate-200 rounded-xl shadow-xl py-1 min-w-40
        animate-in fade-in slide-in-from-top-1 duration-150"
    >
      <button
        onClick={() => { onEdit(flight); onClose(); }}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
      >
        <Pencil size={13} className="text-slate-400" /> Edit Flight
      </button>
      <button
        onClick={() => { onSeats(flight); onClose(); }}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
      >
        <Armchair size={13} className="text-slate-400" /> Manage Seats
      </button>
    </div>
  );
};

const FlightTable = ({ flights, onEdit, onManageSeats }) => {
  const [activeMenu, setActiveMenu] = useState(null);

  if (!flights.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
        <Plane size={36} className="opacity-30" />
        <p className="text-sm font-medium">No flights found</p>
        <p className="text-xs">Try a different search query</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto" onClick={() => setActiveMenu(null)}>
      <table className="w-full text-left table-auto min-w-205">
        <thead>
          <tr className="border-y border-slate-100">
            {COLS.map((col) => (
              <th key={col} className="px-5 py-3 bg-slate-50/80 hover:bg-slate-100 transition-colors">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {col}
                  {col && col !== "" && <ChevronsUpDown size={12} className="opacity-40" />}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {flights.map((f) => (
            <tr key={f.flightId} className="group hover:bg-blue-50/30 transition-colors">
              {/* Flight */}
              <td className="px-5 py-3.5">
                <p className="text-sm font-bold text-slate-800">{f.flightNumber}</p>
                <p className="text-xs text-slate-400 mt-0.5">{f.aircraftModel}</p>
                {f.airlineName && <p className="text-xs text-slate-400">{f.airlineName}</p>}
              </td>

              {/* Route */}
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <span>{f.origin}</span>
                  <span className="text-slate-300">→</span>
                  <span>{f.destination}</span>
                </div>
              </td>

              {/* Base Price */}
              <td className="px-5 py-3.5">
                <span className="text-sm font-semibold text-slate-800">{fmt.price(f.basePrice)}</span>
                <p className="text-xs text-slate-400 mt-0.5">base fare</p>
              </td>

              {/* Departure */}
              <td className="px-5 py-3.5">
                <p className="text-sm text-slate-700">{fmt.date(f.departureTime)}</p>
                <p className="text-xs text-slate-400 tabular-nums">{fmt.time(f.departureTime)}</p>
              </td>

              {/* Arrival */}
              <td className="px-5 py-3.5">
                <p className="text-sm text-slate-700">{fmt.date(f.arrivalTime)}</p>
                <p className="text-xs text-slate-400 tabular-nums">{fmt.time(f.arrivalTime)}</p>
              </td>

              {/* Status */}
              <td className="px-5 py-3.5">
                <FlightStatusBadge status={f.status} />
              </td>

              {/* Actions */}
              <td className="px-5 py-3.5 relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setActiveMenu((prev) => (prev === f.flightId ? null : f.flightId))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300
                    hover:text-slate-600 hover:bg-slate-100 transition-colors group-hover:text-slate-500"
                >
                  <MoreVertical size={16} />
                </button>

                {activeMenu === f.flightId && (
                  <ActionMenu
                    flight={f}
                    onEdit={onEdit}
                    onSeats={onManageSeats}
                    onClose={() => setActiveMenu(null)}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FlightTable;