import { useState } from "react";
import { ChevronDown } from "lucide-react";

const CustomSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Select option",
  className = "",
}) => {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`relative w-full ${className}`}>
      {/* Trigger */}
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between px-4 py-4 text-sm bg-white border rounded-md cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-charcoal focus:border-charcoal
        "
      >
        <span className={selectedOption ? "text-gray-800" : "text-gray-400"}>
          {selectedOption?.label || placeholder}
        </span>

        <ChevronDown
          size={18}
          className={`transition ${open ? "rotate-180" : ""}`}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute w-full mt-2 bg-white border rounded-lg shadow z-50">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`px-4 py-2 cursor-pointer transition hover:bg-gray-100 ${
                option.value === value ? "bg-gray-50 font-medium" : ""
              }`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
