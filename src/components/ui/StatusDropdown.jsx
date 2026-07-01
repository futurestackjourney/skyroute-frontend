import { useState } from "react";
import { ChevronDown } from "lucide-react";

const StatusDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);

  const statuses = [
    "Scheduled",
    "Boarding",
    "Departed",
    "Delayed",
    "Cancelled",
    "Completed",
  ];

  return (
    <div className="relative w-full">
      {/* Trigger */}
      <div
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center px-4 py-2 border rounded-lg bg-white cursor-pointer hover:border-indigo-500 transition"
      >
        <span className={value ? "text-gray-800" : "text-gray-400"}>
          {value || "Select Status"}
        </span>

        <ChevronDown
          size={18}
          className={`transition ${open ? "rotate-180" : ""}`}
        />
      </div>

      {/* Menu */}
      {open && (
        <div className="absolute w-full mt-2 bg-white border rounded-lg shadow">
          {statuses.map((status) => (
            <div
              key={status}
              onClick={() => {
                onChange(status);
                setOpen(false);
              }}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition"
            >
              {status}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusDropdown;