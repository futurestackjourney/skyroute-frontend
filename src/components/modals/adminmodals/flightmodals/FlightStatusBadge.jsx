// Single source of truth for all status config
export const STATUS_MAP = {
  0: { label: "Scheduled", color: "text-emerald-700 bg-emerald-50 ring-emerald-200"  },
  1: { label: "Boarding",  color: "text-blue-700   bg-blue-50   ring-blue-200"       },
  2: { label: "Departed",  color: "text-violet-700 bg-violet-50 ring-violet-200"     },
  3: { label: "Delayed",   color: "text-amber-700  bg-amber-50  ring-amber-200"      },
  4: { label: "Cancelled", color: "text-red-700    bg-red-50    ring-red-200"        },
  5: { label: "Completed", color: "text-slate-500  bg-slate-100 ring-slate-200"      },
};

export const STATUS_OPTIONS = Object.entries(STATUS_MAP).map(([v, { label }]) => ({
  value: Number(v),
  label,
}));

const FlightStatusBadge = ({ status }) => {
  const cfg = STATUS_MAP[status] ?? STATUS_MAP[0];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold tracking-wide ring-1 ${cfg.color}`}>
      {cfg.label}
    </span>
  );
};

export default FlightStatusBadge;