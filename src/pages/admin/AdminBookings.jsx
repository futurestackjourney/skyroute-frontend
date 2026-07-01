import { useEffect, useState } from "react";
import {
  getBookings,
  updateBookingStatus,
  cancelBooking,
} from "../../api/adminBooking";
import { BookingStatus, BookingStatusLabel } from "../../utils/bookingStatus";
import { ChevronsUpDown } from "lucide-react";
import { showError, showSuccess } from "../../utils/toast";
import { parseApiError } from "../../utils/apiError";

const AdminBookings = () => {

  //FETCH ALL FLIGHTS
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeController, setActiveController] = useState(null);

  //PAGINATION PAGES & SIZES
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [total, setTotal] = useState(0);

  // EDIT FLIGHT
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: "",
  });
  // CANCLE FLIGT
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const res = await getBookings(page, size);

      setBookings(res.data);
      setTotal(res.totalCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page]);

  // ================= EDIT MODAL =================

  const handleUpdateSubmit = async () => {
    try {
      await updateBookingStatus(selectedBooking.bookingId, updateData.status);

      showSuccess("Updated successfully");
      setShowUpdate(false);
      //uodate locally
      setBookings((prev) =>
        prev.map((b) =>
          b.bookingId === selectedBooking.bookingId
            ? { ...b, status: updateData.status } // update status only
            : b,
        ),
      );
      setSelectedBooking(null);
      // fetchBookings();
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  useEffect(() => {
    if (selectedBooking) {
      setUpdateData({
        status: selectedBooking.status,
      });
    }
  }, [selectedBooking]);

  // ================= CANCLE MODAL =================

  const handleConfirmCancel = async () => {
    try {
      await cancelBooking(bookingToCancel.bookingId);
      showSuccess("Booking cancelled successfully");
      setShowCancelModal(false);
      setBookingToCancel(null);

      // update localy
      setBookings((prev) =>
        prev.map((b) =>
          b.bookingId === bookingToCancel.bookingId
            ? { ...b, status: "Cancelled" } // mark as cancelled
            : b,
        ),
      );
      // fetchBookings();
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  //SCROLL BODY LOCK WHEN MODAL IS OPRN
  useEffect(() => {
    const isModalOpen = showUpdate || showCancelModal;

    document.body.style.overflow = isModalOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showUpdate, showCancelModal]);

  return (
    <>
      <div
        className="px-4 sm:px-6 py-4 mx-auto w-full relative"
        onClick={() => setActiveController(null)}
      >
        <div className="mb-3">
          <h1 className="text-3xl font-semibold mb-1 text-charcoal ">
            Booking Management
          </h1>
          <p className="text-charcoal-100 mb-4">
            View and manage all Booking .
          </p>
          <input
            className="input-search mb-6 "
            type="text"
            placeholder="Search flights..."
          />
        </div>

        <div className="relative flex flex-col w-full h-full text-slate-700 bg-[#f1f1f1] shadow-md rounded-xl bg-clip-border">
          <div className="relative mx-4 mt-4 overflow-hidden text-slate-700 bg-[#f1f1f1] rounded-none bg-clip-border">
            {/* Add Buttons */}
            <div className="flex items-center justify-between ">
              <div>
                <h3 className="text-lg font-semibold ">
                  {/* {table === 1 ? (
                    <span>Today Flights List</span>
                  ) : (
                    <span>All Flights List</span>
                  )} */}
                </h3>
                <p className="text-charcoal-100">
                  Review each aircraft before edit
                </p>
              </div>
              <div className="flex flex-col gap-2 shrink-0 sm:flex-row">
                <button
                  onClick={() => setTable(1)}
                  className="rounded border border-slate-300 py-2.5 px-3 text-center text-xs font-semibold text-slate-600 transition-all hover:opacity-75 focus:ring focus:ring-slate-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                  type="button"
                >
                  Today Flight
                </button>
                <button
                  onClick={() => setTable(2)}
                  className="rounded border border-slate-300 py-2.5 px-3 text-center text-xs font-semibold text-slate-600 transition-all hover:opacity-75 focus:ring focus:ring-slate-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                  type="button"
                >
                  View All
                </button>
                <button
                  onClick={() => setShowCreate(true)}
                  className="flex select-none items-center gap-2 rounded bg-charcoal py-2.5 px-4 text-xs font-semibold text-white shadow-md transition-all hover:shadow-lg hover:bg-charcoal-100 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                  type="button"
                >
                  <img
                    src="/icons/add-user-left-6-white-svgrepo-com.svg"
                    width={20}
                    alt=""
                  />
                  Add Aircraft
                </button>
              </div>
            </div>

            <div className="p-0 overflow-scroll">
              <table className="w-full mt-4 text-left table-auto min-w-max">
                <thead>
                  <tr>
                    <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
                      <p className="flex items-center justify-between gap-2 font-sans text-sm font-normal leading-none text-slate-500">
                        Booking ID
                        <ChevronsUpDown className="size-4" />
                      </p>
                    </th>
                    <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
                      <p className="flex items-center justify-between gap-2 font-sans text-sm font-normal leading-none text-slate-500">
                        User Details
                        <ChevronsUpDown className="size-4" />
                      </p>
                    </th>
                    <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
                      <p className="flex items-center justify-between gap-2 font-sans text-sm  font-normal leading-none text-slate-500">
                        Flight Number
                        <ChevronsUpDown className="size-4" />
                      </p>
                    </th>
                    <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
                      <p className="flex items-center justify-between gap-2 font-sans text-sm  font-normal leading-none text-slate-500">
                        Ori/Des
                        <ChevronsUpDown className="size-4" />
                      </p>
                    </th>
                    <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
                      <p className="flex items-center justify-between gap-2 font-sans text-sm  font-normal leading-none text-slate-500">
                        Status
                        <ChevronsUpDown className="size-4" />
                      </p>
                    </th>
                    <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-slate-50 hover:bg-slate-100">
                      <p className="flex items-center justify-between gap-2 font-sans text-sm  font-normal leading-none text-slate-500">
                        Actions
                        <ChevronsUpDown className="size-4" />
                      </p>
                    </th>
                  </tr>
                </thead>
                <tbody className="" onClick={() => setActiveController(false)}>
                  {loading ? (
                    <tr>
                      <td colSpan="100%" className="p-4 text-2xl">
                        Loading...
                      </td>
                    </tr>
                  ) : (
                    bookings.map((b, key) => (
                      <tr key={key}>
                        <td className="p-4 border-b border-slate-200">
                          <p className="text-sm text-slate-500">
                            {b.bookingId}
                          </p>
                        </td>
                        <td className="p-4 border-b border-slate-200">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                              <p className="text-sm font-semibold text-slate-700 uppercase">
                                {b.fullName || "N/A"}
                              </p>
                              <p className="text-sm text-slate-500">
                                {b.userName || "N/A"}
                              </p>
                              <p className="text-sm text-slate-500"></p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 border-b border-slate-200">
                          <p className="text-sm text-slate-500">
                            {b.flightNumber}
                          </p>
                          <p>{b.airlineName}</p>
                        </td>
                        <td className="p-4 border-b border-slate-200">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                              <p className="text-sm text-slate-500">
                                {b.origin}
                              </p>
                              <p className="text-sm text-slate-500">
                                {b.destination}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 border-b border-slate-200">
                          <div className="w-max">
                            <div className="relative grid items-center text-xs font-bold  uppercase  select-none whitespace-nowrap ">
                              {b.status == 1 ? (
                                <span className="text-green-900 bg-green-500/20 px-2 py-1 rounded-md">
                                  Confirmed
                                </span>
                              ) : b.status == 2 ? (
                                <span className="text-red-900 bg-red-500/20 px-2 py-1 rounded-md">
                                  Cancelled
                                </span>
                              ) : b.status == 3 ? (
                                <span className="text-gray-700 bg-gray-200 px-2 py-1 rounded-md">
                                  Completed
                                </span>
                              ) : (
                                <span className="text-yellow-900 bg-yellow-500/20 px-2 py-1 rounded-md">
                                  Pending
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="relative p-4 border-b border-slate-200 ">
                          <div onClick={(e) => e.stopPropagation()}>
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveController(
                                  activeController === b.bookingId
                                    ? null
                                    : b.bookingId,
                                );
                              }}
                              className=" h-10 max-h-10 w-10 max-w-10 select-none rounded-lg text-center flex items-center font-sans text-xs font-medium uppercase text-slate-900 transition-all hover:bg-slate-900/10 active:bg-slate-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                              type="button"
                            >
                              <img
                                src="/icons/interface-ui-dots-menu-svgrepo-com.svg"
                                width="20px"
                                alt=""
                                className="mx-auto"
                              />
                              {activeController === b.bookingId && (
                                <div className="absolute p-3 bottom-2 right-5 bg-white rounded-lg space-y-2 w-max text-[12px]">
                                  <button
                                    // onClick={() => openEdit(b)}
                                    onClick={() => {
                                      setSelectedBooking(b);
                                      setShowUpdate(true);
                                    }}
                                    className="w-full text-left flex gap-2"
                                  >
                                    <img
                                      src="/icons/edit-svgrepo-com.svg"
                                      alt=""
                                      className="w-4"
                                    />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setBookingToCancel(b);
                                      setShowCancelModal(true);
                                    }}
                                    className="w-full text-left flex gap-2"
                                  >
                                    <img
                                      src="/icons/cancel-svgrepo-com.svg"
                                      alt=""
                                      className="w-4"
                                    />
                                    <span className="text-[#0036d6]">
                                      Cancel
                                    </span>
                                  </button>
                                  <button className="w-full text-left flex gap-2">
                                    <img
                                      src="/icons/delete-2-svgrepo-com.svg"
                                      alt=""
                                      className="w-4"
                                    />
                                    <span className="text-red-500">Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

         {/* ================= PAGINATION ================= */}
          <div className="flex items-center justify-between p-3">
            <p className="block text-sm text-slate-500">Page {page + 1} / {Math.ceil(total / size)}</p>
            <div className="flex gap-1">
              <button
                className="rounded border border-slate-300 py-2.5 px-3 text-center text-xs font-semibold text-slate-600 transition-all hover:opacity-75 focus:ring focus:ring-slate-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <button
                className="rounded border border-slate-300 py-2.5 px-3 text-center text-xs font-semibold text-slate-600 transition-all hover:opacity-75 focus:ring focus:ring-slate-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                type="button"
                disabled={(page + 1) * size >= total}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
      </div>

      {/* -- CREATE MODAL -- */}
      {/* {showCreate && (
          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={() => setShowCreate(false)}
          >
            <div
              className="bg-white p-6 rounded-lg w-max space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-bold text-xl">Create Flight</h2>

              <div className="flex space-x-3">
                <input
                  name="flightNumber"
                  placeholder="Flight Number"
                  value={createForm.flightNumber}
                  onChange={handleCreateChange}
                  className="form-input w-full"
                />

                <select
                  name="aircraftId"
                  value={createForm.aircraftId}
                  onChange={handleCreateChange}
                  className="form-input w-full"
                >
                  <option value="">Select Aircraft</option>
                  {aircraftList.map((a) => (
                    <option key={a.aircraftId} value={a.aircraftId}>
                      {a.model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3">
                <input
                  name="origin"
                  placeholder="Origin"
                  value={createForm.origin}
                  onChange={handleCreateChange}
                  className="form-input w-full"
                />
                <input
                  name="destination"
                  placeholder="Destination"
                  value={createForm.destination}
                  onChange={handleCreateChange}
                  className="form-input w-full"
                />
              </div>

              <div className="flex space-x-3">
                <input
                  type="datetime-local"
                  name="departureTime"
                  value={createForm.departureTime}
                  onChange={handleCreateChange}
                  className="form-input w-full"
                />
                <input
                  type="datetime-local"
                  name="arrivalTime"
                  value={createForm.arrivalTime}
                  onChange={handleCreateChange}
                  className="form-input w-full"
                />
              </div>

              <div className="relative p-2">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  value={createForm.status || ""}
                  onChange={handleCreateChange}
                  className="form-input w-full"
                >
                  <option value="">Select Status</option>
                  <option value={FlightStatus.Scheduled}>Scheduled</option>
                  <option value={FlightStatus.Boarding}>Boarding</option>
                  <option value={FlightStatus.Departed}>Departed</option>
                  <option value={FlightStatus.Delayed}>Delayed</option>
                  <option value={FlightStatus.Cancelled}>Cancelled</option>
                  <option value={FlightStatus.Completed}>Completed</option>
                </select>
              </div>

              <button
                disabled={creating}
                onClick={submitCreate}
                className="px-3 py-2 bg-green-600 text-white rounded"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        )} */}

      {/* -- EDIT MODAL -- */}
      {showUpdate && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 "
          onClick={() => setShowEdit(false)}
        >
          <div
            className="bg-white p-6 rounded-lg space-y-3 w-full max-w-133 max-h-[85vh] overflow-y-auto "
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-bold text-xl text-chatcoal">
              Edit Aircraft Details
            </h2>
            <div className=" text-base text-charcoal">
              <p>BookingID : 
                <span className="text-charcoal-100 text-sm ps-1">{selectedBooking.bookingId}</span>
              </p>
              <p>Full Name :
                <span className="text-charcoal-100 text-sm ps-1">{selectedBooking?.fullName}</span> 
                </p>
              <p>Email :
                <span className="text-charcoal-100 text-sm ps-1">{selectedBooking.email}</span>
              </p>
            </div>

            {/* Form Fields */}
            <select
              value={updateData.status}
              onChange={(e) =>
                setUpdateData({ ...updateData, status: e.target.value })
              }
              className="border rounded px-3 py-2 w-full"
            >
              <option value={BookingStatus.Pending}>Pending</option>
              <option value={BookingStatus.Confirmed}>Confirmed</option>
              <option value={BookingStatus.Cancelled}>Cancelled</option>
              <option value={BookingStatus.Completed}>Completed</option>
            </select>

            <div className="flex gap-2 justify-end">
              <button
                onClick={handleUpdateSubmit}
                className="px-3 py-2 bg-charcoal text-white rounded "
              >
                Save
              </button>

              <button
                onClick={() => setShowUpdate(false)}
                className="px-3 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
            </div>

            {/* <div className="flex justify-center">
                <button
                  disabled={updating}
                  onClick={submitUpdate}
                  className="px-3 py-2 bg-charcoal text-white rounded w-45"
                >
                  {updating ? "Updating..." : "Update"}
                </button>
              </div> */}
          </div>
        </div>
      )}

      {/* -- CANCLE MODAL -- */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg space-y-4 w-96">
            <h2 className="text-lg font-semibold">Confirm Cancellation</h2>
            <p>Are you sure you want to cancel this booking?</p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-3 py-2 bg-gray-400 text-white rounded"
              >
                No
              </button>

              <button
                onClick={handleConfirmCancel}
                className="px-3 py-2 bg-red-500 text-white rounded "
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default AdminBookings;
