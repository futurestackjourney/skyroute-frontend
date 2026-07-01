import { useEffect, useState } from "react";
import { getComplaints, updateComplaint } from "../../api/complaints";
import ComplaintModal from "../../components/ui/ComplaintModal";
import { ChevronsUpDown } from "lucide-react";

const AdminComplaints = () => {
  // ================= STATE =================

  // FETCH ALL COMPLAINTS
  const [complaints, setComplaints] = useState([]);
  const [activeController, setActiveController] = useState(null);

  //PAGINATION PAGE & SIZES
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [total, setTotal] = useState(0);


  //CHANGES STATUS BOOKING
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState(null);

  const fetchComplaints = async () => {
    const data = await getComplaints(page, size, statusFilter);
    setComplaints(data.data);
    setTotal(data.total);
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, statusFilter]);

  const handleUpdate = async (data) => {
    await updateComplaint(selected.id, data);
    setSelected(null);
    fetchComplaints();
  };

  // ENUM FOR STATUS
  const status = {
    Pending: 0,
    Working: 1,
    Solved: 2,
  };

  // TEXT SHRINK
  const shrinkText = (text, maxLength = 20) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  // ================= DATE/TIME FORMATTING =================
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const pages = Math.ceil(total / size);

  return (
    <>
      <div
        onClick={() => setActiveController(null)}
        className="px-4 sm:px-6 py-4 mx-auto w-full relative"
      >
        <div className="mb-3">
          <h1 className="text-3xl font-semibold mb-1 text-charcoal ">
            Complaint Management
          </h1>
          <p className="text-charcoal-100 mb-4">
            View and manage all app complaints.
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
              <div className="flex flex-col gap-2 shrink-0 sm:flex-row px-4">
                <select
                  className="gap-2 rounded bg-charcoal py-2.5 px-4 text-xs font-semibold text-white shadow-md transition-all hover:shadow-lg hover:bg-charcoal-100"
                  value={statusFilter}
                  onChange={(e) => {
                    setPage(0);
                    setStatusFilter(e.target.value);
                  }}
                >
                  <option value="">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Working">Progress</option>
                  <option value="Solved">Solved</option>
                </select>
                
              </div>
            </div>

            {/* TABLE */}

            <div className="p-0 overflow-scroll">
              <table className="w-full mt-4 text-left table-auto min-w-max">
                <thead>
                  <tr>
                    <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
                      <p className="flex items-center justify-between gap-2 font-sans text-sm font-normal leading-none text-slate-500">
                        User
                        <ChevronsUpDown className="size-4" />
                      </p>
                    </th>
                    <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
                      <p className="flex items-center justify-between gap-2 font-sans text-sm font-normal leading-none text-slate-500">
                        Complaint
                        <ChevronsUpDown className="size-4" />
                      </p>
                    </th>
                    <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
                      <p className="flex items-center justify-between gap-2 font-sans text-sm  font-normal leading-none text-slate-500">
                        Status
                        <ChevronsUpDown className="size-4" />
                      </p>
                    </th>
                    <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
                      <p className="flex items-center justify-between gap-2 font-sans text-sm  font-normal leading-none text-slate-500">
                        Date
                        <ChevronsUpDown className="size-4" />
                      </p>
                    </th>
                    <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
                      <p className="flex items-center justify-between gap-2 font-sans text-sm  font-normal leading-none text-slate-500">
                        Action
                        <ChevronsUpDown className="size-4" />
                      </p>
                    </th>
                  </tr>
                </thead>
                <tbody className="" onClick={() => setActiveController(false)}>
                  {complaints.map((c) => (
                    <tr key={c.id}>
                      <td className="p-4 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <p className="text-sm font-semibold text-slate-700">
                              {c.email}
                            </p>
                            <p className="text-sm text-slate-500">
                              {c.fullName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 border-b border-slate-200">
                        <p className="text-sm text-slate-500">
                          {shrinkText(c.description, 18)}
                        </p>
                      </td>
                      <td className="p-4 border-b border-slate-200">
                        <p className="text-sm text-slate-800">
                          {formatDate(c.createdDate)}
                          {/* {new Date(c.createdDate).toLocaleDateString()} */}
                        </p>
                        <p className="text-sm text-slate-500">
                          {formatTime(c.createdDate)}
                        </p>
                      </td>
                      <td className="p-4 border-b border-slate-200">
                        <div className="w-max">
                          <div className="relative grid items-center font-sans text-xs font-bold  uppercase  select-none whitespace-nowrap ">
                            {c.status == 1 ? (
                              <span className="text-blue-900 bg-blue-500/20 px-2 py-1 rounded-md">
                                Progress
                              </span>
                            ) : c.status == 2 ? (
                              <span className="text-green-900 bg-green-500/20 px-2 py-1 rounded-md">
                                Solved
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
                                activeController === c.id ? null : c.id,
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
                            {activeController === c.id && (
                              <div className="absolute p-3 bottom-2 right-5 bg-white rounded-lg space-y-2 w-max text-[12px]">
                                <button
                                  // onClick={() => openEdit(c)}
                                  onClick={() => setSelected(c)}
                                  className="w-full text-left flex gap-2"
                                >
                                  <img
                                    src="/icons/edit-svgrepo-com.svg"
                                    alt=""
                                    className="w-4"
                                  />
                                  <span>Update</span>
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ================= PAGINATION ================= */}
          <div className="flex items-center justify-between p-3 ">
            <p className="block text-sm text-slate-500">
              Page {page + 1} / {Math.ceil(total / size)}
            </p>
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
      </div>

     
        {/* EDIT MODAL */}
        <ComplaintModal
          complaint={selected}
          onClose={() => setSelected(null)}
          onSave={handleUpdate}
        />
    </>
  );
};

export default AdminComplaints;
