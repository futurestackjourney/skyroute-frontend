// =============================
// 1. API USAGE (Already done)
// =============================
// You already have axios instance with interceptors 👍

// =============================
// 2. REUSABLE DATA TABLE
// =============================
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function DataTable({
  columns,
  fetchData,
  onEdit,
  onDelete,
  pageSize = 10,
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchData(page, pageSize);

      // adjust depending on backend structure
      setData(res.data || res);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page]);

  return (
    <div className="space-y-4">
      {/* TABLE */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="p-3 text-left">
                  {col.label}
                </th>
              ))}
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-center p-4">
                  No Data
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={index} className="border-t">
                  {columns.map((col) => (
                    <td key={col.key} className="p-3">
                      {col.render
                        ? col.render(row[col.key], row)
                        : row[col.key]}
                    </td>
                  ))}

                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => onEdit(row)}
                      className="px-2 py-1 bg-blue-500 text-white rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => onDelete(row)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center">
        <button
          disabled={page === 0}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span>
          Page {page + 1} / {totalPages}
        </span>

        <button
          disabled={page + 1 >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// =============================
// 3. REUSABLE MODAL
// =============================
export function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg min-w-[300px]"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// =============================
// 4. BOOKINGS PAGE EXAMPLE
// =============================
import {
  getBookings,
  updateBookingStatus,
  cancelBooking,
} from "../../api/adminBooking";

export function BookingPage() {
  const [selected, setSelected] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const columns = [
    { key: "bookingId", label: "ID" },
    { key: "userName", label: "User" },
    { key: "flightNumber", label: "Flight" },
    { key: "origin", label: "From" },
    { key: "destination", label: "To" },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <span className="px-2 py-1 bg-gray-200 rounded">
          {val === 0 ? "Pending" : val === 1 ? "Confirmed" : "Cancelled"}
        </span>
      ),
    },
  ];

  const handleEdit = (row) => {
    setSelected(row);
    setShowEdit(true);
  };

  const handleDelete = (row) => {
    setSelected(row);
    setShowDelete(true);
  };

  const updateStatus = async (status) => {
    try {
      await updateBookingStatus(selected.bookingId, status);
      toast.success("Updated successfully");
      setShowEdit(false);
    } catch {
      toast.error("Update failed");
    }
  };

  const deleteBooking = async () => {
    try {
      await cancelBooking(selected.bookingId);
      toast.success("Deleted successfully");
      setShowDelete(false);
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Bookings</h1>

      <DataTable
        columns={columns}
        fetchData={getBookings}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* EDIT MODAL */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)}>
        <h2 className="text-lg font-bold mb-3">Update Status</h2>

        <div className="space-x-2">
          <button onClick={() => updateStatus(1)}>Confirm</button>
          <button onClick={() => updateStatus(2)}>Cancel</button>
        </div>
      </Modal>

      {/* DELETE MODAL */}
      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)}>
        <h2 className="mb-3">Are you sure?</h2>

        <button
          onClick={deleteBooking}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Yes Delete
        </button>
      </Modal>
    </div>
  );
}

// =============================
// HOW TO REUSE FOR OTHER MODULES
// =============================
/*
1. Create API functions (same as bookings)
   ex: getComplaints, getUsers, getFlights

2. Define columns
   const columns = [
     { key: "id", label: "ID" },
     { key: "name", label: "Name" }
   ];

3. Pass into DataTable
   <DataTable
     columns={columns}
     fetchData={getComplaints}
     onEdit={handleEdit}
     onDelete={handleDelete}
   />

4. Customize modals based on feature
   - complaints → reply
   - flights → edit flight
   - users → change role

5. IMPORTANT BACKEND FORMAT
   Your API should return:
   {
     data: [],
     totalPages: number
   }

6. If your API is different:
   change this line:
   setData(res.data || res);
*/
