import { useState, useEffect } from "react";
import {
  getAllAircraft,
  createAircraft,
  updateAircraft,
} from "../../api/aircraftApi";
import { showSuccess, showError } from "../../utils/toast";
import { parseApiError } from "../../utils/apiError";

const Aircraft = () => {
  // ================= STATE =================
  const [aircraft, setAircraft] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [loading, setLoading] = useState(false);
  const [activeController, setActiveController] = useState(null);

  // create modal
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  // edit modal
  const [showEdit, setShowEdit] = useState(false);
  const [editingAircraft, setEditingAircraft] = useState(null);
  const [updating, setUpdating] = useState(false);

  const [form, setForm] = useState({
    model: "",
    airlineName: "",
    totalSeats: "",
  });

  // ================= FETCH =================
  const fetchAircraft = async () => {
    try {
      setLoading(true);
      const data = await getAllAircraft(page, size);
      setAircraft(data);
    } catch (err) {
      console.error(err);
      showError("Failed to load aircraft");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAircraft();
  }, [page]);

  // ================= FORM =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ================= CREATE =================
  const submitCreate = async () => {
    try {
      if (!form.model || !form.airlineName || !form.totalSeats)
        return showError("Missing required fields");

      setCreating(true);

      const newAircraft = await createAircraft(form);

      setAircraft((prev) => [newAircraft, ...prev]);
      showSuccess("Aircraft created successfully");

      setForm({ model: "", airlineName: "", totalSeats: "" });
      setShowCreate(false);

      fetchAircraft();
    } catch (err) {
      showError(parseApiError(err));
    } finally {
      setCreating(false);
    }
  };

  // ================= EDIT =================
  const openEdit = (a) => {
    setEditingAircraft({
      aircraftId: a.aircraftId,
      model: a.model,
      airlineName: a.airlineName,
      totalSeats: a.totalSeats,
    });
    setShowEdit(true);
  };

  const submitUpdate = async () => {
    try {
      if (
        !editingAircraft.model ||
        !editingAircraft.airlineName ||
        !editingAircraft.totalSeats
      )
        return showError("Missing required fields");

      setUpdating(true);

      const updated = await updateAircraft(
        editingAircraft.aircraftId,
        editingAircraft,
      );

      setAircraft((prev) =>
        prev.map((a) => (a.aircraftId === updated.aircraftId ? updated : a)),
      );

      showSuccess("Aircraft updated successfully");

      setShowEdit(false);
      setEditingAircraft(null);
      fetchAircraft();
    } catch (err) {
      showError(parseApiError(err));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <div className="px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold mb-1 text-charcoal ">
            Aircraft Management
          </h1>
          <p className="text-charcoal-100 mb-4">
            View and manage all app users.
          </p>
          <input
            className="input-search mb-6 "
            type="text"
            placeholder="Search users..."
          />
        </div>

        <div className="relative flex flex-col w-full h-full text-slate-700 bg-[#f1f1f1] shadow-md rounded-xl bg-clip-border">
          <div className="relative mx-4 mt-4 overflow-hidden text-slate-700 bg-[#f1f1f1] rounded-none bg-clip-border">
            <div className="flex items-center justify-between ">
              <div>
                <h3 className="text-lg font-semibold ">Aircraft List</h3>
                <p className="text-charcoal-100">
                  Review each aircraft before edit
                </p>
              </div>
              <div className="flex flex-col gap-2 shrink-0 sm:flex-row">
                <button
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    strokeWidth="2"
                    className="w-4 h-4"
                  >
                    <path d="M6.25 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM3.25 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM19.75 7.5a.75.75 0 00-1.5 0v2.25H16a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25H22a.75.75 0 000-1.5h-2.25V7.5z"></path>
                  </svg>
                  Add Aircraft
                </button>
              </div>
            </div>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="p-0 overflow-scroll">
              <table className="w-full mt-4 text-left table-auto min-w-max">
                <thead>
                  <tr>
                    <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
                      <p className="flex items-center justify-between gap-2 font-sans text-sm font-normal leading-none text-slate-500">
                        Model Name
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          aria-hidden="true"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                          ></path>
                        </svg>
                      </p>
                    </th>
                    <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
                      <p className="flex items-center justify-between gap-2 font-sans text-sm font-normal leading-none text-slate-500">
                        AirLine Name
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          aria-hidden="true"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                          ></path>
                        </svg>
                      </p>
                    </th>
                    <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
                      <p className="flex items-center justify-between gap-2 font-sans text-sm  font-normal leading-none text-slate-500">
                        Status
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          aria-hidden="true"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                          ></path>
                        </svg>
                      </p>
                    </th>
                    <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
                      <p className="flex items-center justify-between gap-2 font-sans text-sm  font-normal leading-none text-slate-500">
                        Total of Seats
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          aria-hidden="true"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                          ></path>
                        </svg>
                      </p>
                    </th>
                    <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-slate-50 hover:bg-slate-100">
                      <p className="flex items-center justify-between gap-2 font-sans text-sm  font-normal leading-none text-slate-500"></p>
                    </th>
                  </tr>
                </thead>
                <tbody className="" onClick={() => setActiveController(null)}>
                  {aircraft.map((a) => (
                    <tr key={a.aircraftId}>
                      <td className="p-4 border-b border-slate-200">
                        <p className="text-sm font-semibold text-slate-700">
                          {a.model}
                        </p>
                      </td>
                      <td className="p-4 border-b border-slate-200">
                        <div className="flex flex-col">
                          <p className="text-sm font-semibold text-slate-700">
                            {a.airlineName}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 border-b border-slate-200">
                        <div className="w-max">
                          <div className="relative grid items-center font-sans text-xs font-bold  uppercase  select-none whitespace-nowrap ">
                            {a.isActive == true ? (
                              <span className="text-green-900 bg-green-500/20 px-2 py-1 rounded-md">
                                Active
                              </span>
                            ) : (
                              <span className="text-slate-500 bg-slate-300/20 px-2 py-1 rounded-md">
                                Offline
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 border-b border-slate-200">
                        <p className="text-sm text-slate-500">{a.totalSeats}</p>
                      </td>
                      <td className="relative p-4 border-b border-slate-200 ">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveController(
                                activeController === a.aircraftId
                                  ? null
                                  : a.aircraftId,
                              );
                            }}
                            className=" h-10 max-h-10 w-10 max-w-10 select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-slate-900 transition-all hover:bg-slate-900/10 active:bg-slate-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                            type="button"
                          >
                            <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2">
                              <svg
                                width={20}
                                viewBox="0 0 16 16"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="#a1a1a1"
                                className="bi bi-three-dots-vertical"
                              >
                                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                <g
                                  id="SVGRepo_tracerCarrier"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></g>
                                <g id="SVGRepo_iconCarrier">
                                  {" "}
                                  <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"></path>{" "}
                                </g>
                              </svg>
                            </span>
                            {activeController === a.aircraftId && (
                              <div className="absolute p-3 bottom-2 right-5 w-25 space-y-2 bg-white rounded-lg">
                                <button
                                  onClick={() => openEdit(a)}
                                  className="text-charcoal w-full flex gap-2"
                                >
                                  <svg
                                    width={15}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <g
                                      id="SVGRepo_bgCarrier"
                                      strokeWidth="0"
                                    ></g>
                                    <g
                                      id="SVGRepo_tracerCarrier"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></g>
                                    <g id="SVGRepo_iconCarrier">
                                      {" "}
                                      <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M20.8477 1.87868C19.6761 0.707109 17.7766 0.707105 16.605 1.87868L2.44744 16.0363C2.02864 16.4551 1.74317 16.9885 1.62702 17.5692L1.03995 20.5046C0.760062 21.904 1.9939 23.1379 3.39334 22.858L6.32868 22.2709C6.90945 22.1548 7.44285 21.8693 7.86165 21.4505L22.0192 7.29289C23.1908 6.12132 23.1908 4.22183 22.0192 3.05025L20.8477 1.87868ZM18.0192 3.29289C18.4098 2.90237 19.0429 2.90237 19.4335 3.29289L20.605 4.46447C20.9956 4.85499 20.9956 5.48815 20.605 5.87868L17.9334 8.55027L15.3477 5.96448L18.0192 3.29289ZM13.9334 7.3787L3.86165 17.4505C3.72205 17.5901 3.6269 17.7679 3.58818 17.9615L3.00111 20.8968L5.93645 20.3097C6.13004 20.271 6.30784 20.1759 6.44744 20.0363L16.5192 9.96448L13.9334 7.3787Z"
                                        fill="#0F0F0F"
                                      ></path>{" "}
                                    </g>
                                  </svg>
                                  Edit
                                </button>
                                <button className="text-red-500 w-full flex gap-2">
                                  <svg
                                    width={15}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <g
                                      id="SVGRepo_bgCarrier"
                                      strokeWidth="0"
                                    ></g>
                                    <g
                                      id="SVGRepo_tracerCarrier"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></g>
                                    <g id="SVGRepo_iconCarrier">
                                      {" "}
                                      <path
                                        d="M10 12V17"
                                        stroke="#fb2c36"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      ></path>{" "}
                                      <path
                                        d="M14 12V17"
                                        stroke="#fb2c36"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      ></path>{" "}
                                      <path
                                        d="M4 7H20"
                                        stroke="#fb2c36"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      ></path>{" "}
                                      <path
                                        d="M6 10V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V10"
                                        stroke="#fb2c36"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      ></path>{" "}
                                      <path
                                        d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z"
                                        stroke="#fb2c36"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      ></path>{" "}
                                    </g>
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            )}
                          </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGGINATION */}
          <div className="flex items-center justify-between p-3">
            <p className="block text-sm text-slate-500">Page 1 of 10</p>
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
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* CREATE NEW USER */}
        {showCreate && (
          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={() => setShowCreate(false)}
          >
            <div
              className="bg-white p-6 rounded-lg w-102 space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold">Create Aircraft</h3>

              <input
                name="model"
                placeholder="Aircraft Model"
                value={form.model}
                onChange={handleChange}
                className="form-input "
              />

              <input
                name="airlineName"
                placeholder="AirLine Name"
                value={form.airlineName}
                onChange={handleChange}
                className="form-input "
              />

              <input
                name="totalSeats"
                placeholder="Total of seats"
                value={form.totalSeats}
                onChange={handleChange}
                className="form-input "
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-3 py-2 border rounded"
                >
                  Cancel
                </button>

                <button
                  disabled={creating}
                  onClick={submitCreate}
                  className="px-3 py-2 bg-charcoal text-white rounded disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* UPDATE USER */}
        {showEdit && editingAircraft && (
          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={() => setShowEdit(false)}
          >
            <div
              className="bg-white p-6 rounded-lg w-105 space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-bold text-xl text-chatcoal">
                Edit Aircraft Details
              </h2>

              <div className="relative p-2">
                <label className="form-label">Aircraft Model</label>
                <input
                  value={editingAircraft.model}
              onChange={(e) =>
                setEditingAircraft((p) => ({
                  ...p,
                  model: e.target.value,
                }))
              }
                  className="form-input w-full"
                />
              </div>

              <div className="relative p-2">
                <label className="form-label">Airline Name</label>
                <input
                  value={editingAircraft.airlineName}
              onChange={(e) =>
                setEditingAircraft((p) => ({
                  ...p,
                  airlineName: e.target.value,
                }))
              }
                  className="form-input w-full"
                />
              </div>

              <div className="relative p-2">
                <label className="form-label">Total of Seats</label>
                <input
                  value={editingAircraft.totalSeats}
              onChange={(e) =>
                setEditingAircraft((p) => ({
                  ...p,
                  totalSeats: e.target.value,
                }))
              }
                  className="form-input w-full"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowEdit(false)}
                  className="px-3 py-2 border rounded"
                >
                  Cancel
                </button>

                <button
                  disabled={updating}
                  onClick={submitUpdate}
                  className="px-3 py-2 bg-charcoal text-white rounded"
                >
                  {updating ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Aircraft;
