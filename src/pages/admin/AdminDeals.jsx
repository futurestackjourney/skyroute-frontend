import { useEffect, useState } from "react";
import {
  getAllDeals,
  createDeal,
  updateDeal,
  deleteDeal,
} from "../../api/adminDeals";
import { showError, showSuccess } from "../../utils/toast";
import { parseApiError } from "../../utils/apiError";
import DealsModal from "../../components/modals/adminmodals/dealmodals/DealsModal";
import { ChevronsUpDown, Plus } from "lucide-react";

const IMAGE_BASE_URL = "https://localhost:7042";

const initialForm = {
  title: "",
  description: "",
  flightId: "",
  hotelId: "",
  roomId: "",
  nights: "",
  maxGuests: "",
  discountPercentage: "",
  validFrom: "",
  validTo: "",
};

const AdminDeals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeController, setActiveController] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const filteredDeals = deals.filter(
    (d) =>
      d.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.hotelName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.airlineName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.origin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.destination?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [form, setForm] = useState(initialForm);

  // ================= FETCH =================
  const fetchDeals = async () => {
    try {
      setLoading(true);
      const data = await getAllDeals();
      setDeals(data);
    } catch (err) {
      showError("Failed to load deals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  // ================= CREATE =================
  const handleCreate = async () => {
    try {
      const payload = buildPayload(form);
      const res = await createDeal(payload);
      showSuccess("Deal created");
      setDeals((prev) => [...prev, res]);
      setForm(initialForm);
      setShowCreate(false);
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {
    try {
      const payload = buildPayload(form);
      const res = await updateDeal(selectedDeal.id, payload);
      showSuccess("Deal updated");
      setDeals((prev) => prev.map((d) => (d.id === selectedDeal.id ? res : d)));
      setForm(initialForm);
      setShowEdit(false);
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this deal?")) return;
    try {
      await deleteDeal(id);
      showSuccess("Deal deleted");
      setDeals((prev) => prev.filter((d) => d.id !== id));
      setActiveController(null);
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  // ================= HELPERS =================
  const buildPayload = (f) => ({
    title: f.title,
    description: f.description,
    flightId: Number(f.flightId),
    hotelId: Number(f.hotelId),
    roomId: Number(f.roomId),
    nights: Number(f.nights),
    maxGuests: Number(f.maxGuests),
    discountPercentage: Number(f.discountPercentage),
    validFrom: f.validFrom,
    validTo: f.validTo,
    ...(f.id ? { isActive: f.isActive ?? true } : {}),
  });

  const openEdit = (deal) => {
    setSelectedDeal(deal);
    setForm({
      id: deal.id,
      title: deal.title,
      description: deal.description,
      flightId: deal.flightId,
      hotelId: deal.hotelId,
      roomId: deal.roomId,
      nights: deal.nights,
      maxGuests: deal.maxGuests,
      discountPercentage: deal.discountPercentage,
      validFrom: deal.validFrom,
      validTo: deal.validTo,
      isActive: deal.isActive ?? true,
    });
    setShowEdit(true);
    setActiveController(null);
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const shrinkText = (text, maxLength = 25) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  // ================= UI =================
  return (
    <>
      <div className="px-4 sm:px-6 py-4 mx-auto w-full relative">
        <div className="mb-3">
          <h1 className="text-3xl font-semibold mb-1 text-charcoal">
            Deal Management
          </h1>
          <p className="text-charcoal-100 mb-4">View and manage all travel deals.</p>
          <input
            className="input-search mb-6"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
            placeholder="Search deals by title, hotel, airline..."
          />
        </div>

        <div className="relative flex flex-col w-full h-full text-slate-700 bg-[#f1f1f1] shadow-md rounded-xl bg-clip-border">
          <div className="relative mx-4 mt-4 overflow-hidden text-slate-700 bg-[#f1f1f1] rounded-none bg-clip-border">

            {/* ===== Header ===== */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Total</h3>
                <p className="text-charcoal-100">Review each deal before editing</p>
              </div>
              <div className="flex flex-col gap-2 shrink-0 sm:flex-row px-4">
                <button
                  onClick={() => {
                    setForm(initialForm);
                    setShowCreate(true);
                  }}
                  className="flex select-none items-center gap-2 rounded bg-charcoal py-2.5 px-4 text-xs font-semibold text-white shadow-md transition-all hover:shadow-lg hover:bg-charcoal-100 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                  type="button"
                >
                  <Plus size={14} />
                  Add Deal
                </button>
              </div>
            </div>

            {/* ====== TABLE ===== */}
            <div className="p-0 overflow-scroll">
              <table className="w-full mt-4 text-left table-auto min-w-max">
                <thead>
                  <tr>
                    {[
                      "Deal Info",
                      "Flight",
                      "Hotel / Room",
                      "Pricing",
                      "Validity",
                      "Action",
                    ].map((col) => (
                      <th
                        key={col}
                        className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100"
                      >
                        <p className="flex items-center justify-between gap-2 font-sans text-sm font-normal leading-none text-slate-500">
                          {col}
                          <ChevronsUpDown className="size-4" />
                        </p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody onClick={() => setActiveController(null)}>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center p-6 text-slate-400">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredDeals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-6 text-slate-400">
                        No deals found.
                      </td>
                    </tr>
                  ) : (
                    filteredDeals.map((d) => (
                      <tr key={d.id}>
                        {/* Deal Info */}
                        <td className="p-4 border-b border-slate-200">
                          <p className="text-sm font-semibold text-slate-700">
                            {d.title}
                          </p>
                          <p className="text-sm text-slate-500">
                            {shrinkText(d.description)}
                          </p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${
                              d.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-500"
                            }`}
                          >
                            {d.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* Flight */}
                        <td className="p-4 border-b border-slate-200">
                          <p className="text-sm font-semibold text-slate-700">
                            {d.airlineName}
                          </p>
                          <p className="text-sm text-slate-500">
                            {d.origin} → {d.destination}
                          </p>
                          <p className="text-xs text-slate-400">
                            {d.departureTime
                              ? formatDate(d.departureTime)
                              : "—"}
                          </p>
                        </td>

                        {/* Hotel / Room */}
                        <td className="p-4 border-b border-slate-200">
                          <div className="flex items-center gap-2">
                            {d.hotelImageUrl && (
                              <img
                                src={`${IMAGE_BASE_URL}${d.hotelImageUrl}`}
                                alt={d.hotelName}
                                className="w-12 h-12 object-cover rounded text-[.6rem]"
                              />
                            )}
                            <div>
                              <p className="text-sm font-semibold text-slate-700">
                                {d.hotelName}
                              </p>
                              <p className="text-xs text-slate-500">
                                {d.hotelCity}, {d.hotelCountry}
                              </p>
                              <p className="text-xs text-slate-400">
                                {d.roomType} · Cap: {d.roomCapacity}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Pricing */}
                        <td className="p-4 border-b border-slate-200">
                          <p className="text-sm text-slate-400 line-through">
                            USD {d.originalPrice?.toLocaleString()}
                          </p>
                          <p className="text-sm font-semibold text-slate-700">
                            USD {d.dealPrice?.toLocaleString()}
                          </p>
                          <span className="text-xs text-pumpkin font-medium">
                            {d.discountPercentage}% OFF
                          </span>
                          <p className="text-xs text-slate-400 mt-1">
                            {d.nights} nights · {d.maxGuests} guests
                          </p>
                        </td>

                        {/* Validity */}
                        <td className="p-4 border-b border-slate-200">
                          <p className="text-xs text-slate-500">
                            From:{" "}
                            <span className="text-slate-700 font-medium">
                              {formatDate(d.validFrom)}
                            </span>
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            To:{" "}
                            <span className="text-slate-700 font-medium">
                              {formatDate(d.validTo)}
                            </span>
                          </p>
                        </td>

                        {/* Action */}
                        <td className="relative p-4 border-b border-slate-200">
                          <div onClick={(e) => e.stopPropagation()}>
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveController(
                                  activeController === d.id ? null : d.id,
                                );
                              }}
                              className="h-10 max-h-10 w-10 max-w-10 select-none rounded-lg text-center flex items-center font-sans text-xs font-medium uppercase text-slate-900 transition-all hover:bg-slate-900/10 active:bg-slate-900/20 cursor-pointer"
                            >
                              <img
                                src="/icons/interface-ui-dots-menu-svgrepo-com.svg"
                                width="20px"
                                alt=""
                                className="mx-auto"
                              />
                              {activeController === d.id && (
                                <div className="absolute p-3 bottom-2 right-5 bg-white rounded-lg shadow-lg space-y-2 w-max text-[12px] z-10">
                                  <button
                                    onClick={() => openEdit(d)}
                                    className="w-full text-left flex gap-2"
                                  >
                                    <img
                                      src="/icons/edit-svgrepo-com.svg"
                                      alt=""
                                      className="w-4"
                                    />
                                    <span>Update</span>
                                  </button>
                                  <button
                                    onClick={() => handleDelete(d.id)}
                                    className="w-full text-left flex gap-2"
                                  >
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

        {/* CREATE MODAL */}
        {showCreate && (
          <DealsModal
            title="Create Deal"
            form={form}
            setForm={setForm}
            onClose={() => setShowCreate(false)}
            onSubmit={handleCreate}
          />
        )}

        {/* EDIT MODAL */}
        {showEdit && (
          <DealsModal
            title="Edit Deal"
            form={form}
            setForm={setForm}
            onClose={() => setShowEdit(false)}
            onSubmit={handleUpdate}
          />
        )}
      </div>
    </>
  );
};

export default AdminDeals;