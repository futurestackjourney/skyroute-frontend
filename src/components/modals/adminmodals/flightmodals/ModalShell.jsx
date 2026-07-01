import { useEffect } from "react";
import { X } from "lucide-react";

/**
 * ModalShell – backdrop + card wrapper used by all modals.
 * Locks body scroll, closes on Escape key and backdrop click.
 */
const ModalShell = ({ title, subtitle, onClose, children, maxWidth = "max-w-2xl" }) => {
  // Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${maxWidth} bg-white rounded-2xl shadow-2xl
          flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h2>
            {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="ml-4 w-8 h-8 flex items-center justify-center rounded-full text-slate-400
              hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalShell;