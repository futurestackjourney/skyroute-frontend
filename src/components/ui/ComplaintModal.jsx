import { useState, useEffect } from "react";

const ComplaintModal = ({ complaint, onClose, onSave }) => {
  const [status, setStatus] = useState("");
  const [reply, setReply] = useState("");

  useEffect(() => {
    if (complaint) {
      setStatus(complaint.status);
      setReply(complaint.adminReply || "");
    }
  }, [complaint]);

  if (!complaint) return null;

  const handleSubmit = () => {
    onSave({
      status: status,
      adminReply: reply,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-max max-w-105  space-y-3">
        <h2 className="text-xl font-semibold mb-4">Update Complaint</h2>

        <p className="mb-3 text-charcoal-100">{complaint.description}</p>

        <select
          className="form-input w-full"
          value={status}
          onChange={(e) => setStatus(Number(e.target.value))}
        >
          <option value={0}>Pending</option>
          <option value={1}>Working</option>
          <option value={2}>Solved</option>
        </select>
        <textarea
          placeholder="Admin reply..."
          className="form-input w-full"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
        />

        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-charcoal text-white rounded"
            onClick={handleSubmit}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintModal;
