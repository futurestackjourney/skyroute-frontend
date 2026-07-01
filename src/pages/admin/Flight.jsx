import { useState, useEffect, useCallback } from "react";
import { PlusIcon, Search, CalendarDays, LayoutList, RefreshCw } from "lucide-react";
import {
  getTodayFlights,
  getAllFlights,
  getSeatsByFlight,
} from "../../api/adminFlights";
import { getAllAircrafts } from "../../api/aircraftApi";
import { showError } from "../../utils/toast";

import FlightTable      from "../../components/modals/adminmodals/flightmodals/FlightTable";
import CreateFlightModal from "../../components/modals/adminmodals/flightmodals/Createflightmodal";
import EditFlightModal  from "../../components/modals/adminmodals/flightmodals/Editflightmodal";
import SeatModal        from "../../components/modals/adminmodals/flightmodals/SeatModal";


const PAGE_SIZE = 10;
const FETCH_SIZE = PAGE_SIZE + 1; // fetch one extra to detect if a next page exists

// ─────────────────────────────────────────────────────────────────────────────

const Flight = () => {
  // ── data ────────────────────────────────────────────────────────────
  const [todayFlights, setTodayFlights] = useState([]);
  const [allFlights,   setAllFlights]   = useState([]);
  const [hasNextPage,  setHasNextPage]  = useState(false);
  const [aircraftList, setAircraftList] = useState([]);

  // ── ui ──────────────────────────────────────────────────────────────
  const [tab,         setTab]         = useState("all");   // "today" | "all"
  const [searchQuery, setSearchQuery] = useState("");
  const [page,        setPage]        = useState(0);

  // ── loading ─────────────────────────────────────────────────────────
  const [loadingToday, setLoadingToday] = useState(false); // BUG FIX: was never set
  const [loadingAll,   setLoadingAll]   = useState(false);
  const [loadingSeats, setLoadingSeats] = useState(false);

  // ── modals ──────────────────────────────────────────────────────────
  const [showCreate, setShowCreate] = useState(false);
  const [editFlight, setEditFlight] = useState(null);       // flight obj | null
  const [seatState,  setSeatState]  = useState(null);       // { flight, seats } | null

  // ── body scroll lock – BUG FIX: was `if ((showEdit, showCreate))` (comma op bug)
  useEffect(() => {
    const locked = showCreate || !!editFlight || !!seatState;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showCreate, editFlight, seatState]);

  // ── fetchers ─────────────────────────────────────────────────────────
  const fetchToday = useCallback(async () => {
    try {
      setLoadingToday(true);
      const data = await getTodayFlights();
      setTodayFlights(data ?? []);
    } catch {
      showError("Failed to load today's flights");
    } finally {
      setLoadingToday(false);
    }
  }, []);

  const fetchAll = useCallback(async (p) => {
    try {
      setLoadingAll(true);
      // When searching: fetch all records (no pagination), backend accepts any size
      const isSearching = searchQuery.trim().length > 0;
      const raw = await getAllFlights(isSearching ? 0 : p, isSearching ? 9999 : FETCH_SIZE);
      const arr = Array.isArray(raw) ? raw : (raw.items ?? raw.data ?? []);

      if (isSearching) {
        // Filter client-side across all records, no pagination needed
        setAllFlights(arr);
        setHasNextPage(false);
      } else {
        setHasNextPage(arr.length > PAGE_SIZE);
        setAllFlights(arr.slice(0, PAGE_SIZE));
      }
    } catch {
      showError("Failed to load flights");
    } finally {
      setLoadingAll(false);
    }
  }, [searchQuery]);

  const fetchAircraft = useCallback(async () => {
    try {
      const data = await getAllAircrafts();
      setAircraftList(data ?? []);
    } catch {
      showError("Failed to load aircraft list");
    }
  }, []);

  useEffect(() => {
    fetchAircraft();
    fetchToday();
    fetchAll(0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchAll(page);
  }, [page, fetchAll]);

  // When search query changes: reset to page 0 and re-fetch
  useEffect(() => {
    setPage(0);
    fetchAll(0);
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── derived ──────────────────────────────────────────────────────────
  const sourceFlights = tab === "today" ? todayFlights : allFlights;
  const filteredFlights = searchQuery.trim()
    ? sourceFlights.filter((f) => {
        const q = searchQuery.toLowerCase();
        return (
          f.flightNumber.toLowerCase().includes(q) ||
          f.origin.toLowerCase().includes(q) ||
          f.destination.toLowerCase().includes(q)
        );
      })
    : sourceFlights;

  const isLoading  = tab === "today" ? loadingToday : loadingAll;

  // ── handlers ─────────────────────────────────────────────────────────
  const handleCreated = (newFlight) => {
    // BUG FIX: optimistic add, then refetch – not refetch BEFORE create
    setTodayFlights((prev) => [newFlight, ...prev]);
    fetchAll(page);
  };

  const handleUpdated = (updated) => {
    const patch = (list) => list.map((f) => f.flightId === updated.flightId ? updated : f);
    setTodayFlights(patch);
    setAllFlights(patch);
  };

  const openSeatModal = async (flight) => {
    try {
      setLoadingSeats(true);
      const seats = await getSeatsByFlight(flight.flightId);
      setSeatState({ flight, seats: seats ?? [] });
    } catch {
      showError("Failed to load seats");
    } finally {
      setLoadingSeats(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="px-4 sm:px-6 py-6 w-full min-h-screen bg-slate-50">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Flight Management</h1>
          <p className="text-sm text-slate-400 mt-1">Schedule, update and configure all flights.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl
            hover:bg-slate-700 active:bg-slate-900 transition-colors shadow-sm self-start sm:self-auto"
        >
          <PlusIcon size={16} /> Add Flight
        </button>
      </div>

      {/* ── Card ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        {/* ── Toolbar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 self-start">
            {[
              { id: "all",   label: "All Flights", icon: LayoutList  },
              { id: "today", label: "Today",        icon: CalendarDays },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${tab === id
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"}`}
              >
                <Icon size={14} />
                {label}
                {id === "today" && todayFlights.length > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold
                    ${tab === "today" ? "bg-slate-100 text-slate-600" : "bg-slate-200/80 text-slate-500"}`}>
                    {todayFlights.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search + refresh */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search flights…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-8 pr-4 text-sm border border-slate-200 rounded-lg bg-white placeholder:text-slate-400
                  focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all w-52"
              />
            </div>
            <button
              onClick={() => { fetchToday(); fetchAll(page); }}
              disabled={isLoading}
              className="h-9 w-9 flex items-center justify-center border border-slate-200 rounded-lg text-slate-400
                hover:text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
            <span className="w-5 h-5 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
            <span className="text-sm">Loading flights…</span>
          </div>
        ) : (
          <FlightTable
            flights={filteredFlights}
            onEdit={setEditFlight}
            onManageSeats={openSeatModal}
          />
        )}

        {/* ── Pagination (all tab only, hidden when searching) ── */}
        {tab === "all" && !isLoading && !searchQuery.trim() && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/60">
            <span className="text-xs text-slate-500">
              Page <span className="font-semibold text-slate-700">{page + 1}</span>
              {!hasNextPage && allFlights.length < PAGE_SIZE && page === 0
                ? <span className="text-slate-400 ml-1.5">({allFlights.length} total)</span>
                : null}
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="px-3.5 py-1.5 text-xs font-medium border border-slate-200 rounded-lg text-slate-600 bg-white
                  hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              <button
                disabled={!hasNextPage}
                onClick={() => setPage((p) => p + 1)}
                className="px-3.5 py-1.5 text-xs font-medium border border-slate-200 rounded-lg text-slate-600 bg-white
                  hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Seat loading overlay ── */}
      {loadingSeats && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl px-8 py-6 shadow-2xl flex items-center gap-3">
            <span className="w-5 h-5 border-2 border-slate-200 border-t-slate-700 rounded-full animate-spin" />
            <span className="text-sm font-medium text-slate-700">Loading seats…</span>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {showCreate && (
        <CreateFlightModal
          aircraftList={aircraftList}
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}

      {editFlight && (
        <EditFlightModal
          flight={editFlight}
          aircraftList={aircraftList}
          onClose={() => setEditFlight(null)}
          onUpdated={handleUpdated}
        />
      )}

      {seatState && (
        <SeatModal
          flight={seatState.flight}
          initialSeats={seatState.seats}
          onClose={() => setSeatState(null)}
        />
      )}
    </div>
  );
};

export default Flight;




// import { useState, useEffect } from "react";
// import {
//   getTodayFlights,
//   updateFlight,
//   createFlight,
//   getAllFlights,
//   getSeatsByFlight,
//   updateSeats,
// } from "../../api/adminFlights";
// import { getAllAircraft } from "../../api/aircraftApi";
// import { showError, showSuccess } from "../../utils/toast";
// import { parseApiError } from "../../utils/apiError";
// import DataTable from "./../../components/ui/DataTable";
// import { ChevronsUpDown } from "lucide-react";
// import CustomSelect from "../../components/ui/CustomSelect";

// const Flight = () => {
//   // ================= STATE =================

//   // Fetch ALl FLights
//   const [allFlight, setAllFlight] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [activeController, setActiveController] = useState(null);

//   // Fetch Todays Flights
//   const [flight, setFlight] = useState([]);
//   const [table, setTable] = useState(2);

//   // PAGINATION PAGES & SIZES
//   // const totalPages = Math.ceil(totalItems / size);
//   const [totalItems, setTotalItems] = useState(0);
//   const [page, setPage] = useState(0);
//   const [size] = useState(10);
//   const [total, setTotal] = useState(0);

//   // SEARCH FILTER
//   const [searchQuery, setSearchQuery] = useState("");

//   const filteredFlights = (table === 1 ? flight : allFlight).filter(
//     (f) =>
//       f.flightNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       f.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       f.destination.toLowerCase().includes(searchQuery.toLowerCase()),
//   );

//   // CREATE FLIGHT
//   const [showCreate, setShowCreate] = useState(false);
//   const [creating, setCreating] = useState(false);
//   const [createForm, setCreateForm] = useState({
//     flightNumber: "",
//     origin: "",
//     destination: "",
//     departureTime: "",
//     arrivalTime: "",
//     aircraftId: "",
//     status: "",
//     // isActive: true,
//   });
//   // SEARCH FILTER
//   const [aircraftQuery, setAircraftQuery] = useState("");
//   const [filteredAircraft, setFilteredAircraft] = useState([]);
//   const [selectedAircraft, setSelectedAircraft] = useState(null);

//   // EDIT FLIGHT
//   const [showEdit, setShowEdit] = useState(false);
//   const [editingFlight, setEditingFlight] = useState(null);
//   const [updating, setUpdating] = useState(false);
//   const [aircraftList, setAircraftList] = useState([]);
//   const [editAircraftQuery, setEditAircraftQuery] = useState("");
//   const [editFilteredAircraft, setEditFilteredAircraft] = useState([]);
//   const [selectedEditAircraft, setSelectedEditAircraft] = useState(null);

//   // EDIT SEAT FEATURES
//   const [seatModalOpen, setSeatModalOpen] = useState(false);
//   const [seatFlight, setSeatFlight] = useState(null); // the flight being edited
//   const [seats, setSeats] = useState([]); // array of seat objects
//   const [seatLoading, setSeatLoading] = useState(false);

//   // ENUM FOR STATUS
//   const FlightStatus = {
//     Scheduled: 0,
//     Boarding: 1,
//     Departed: 2,
//     Delayed: 3,
//     Cancelled: 4,
//     Completed: 5,
//   };

//   // ================= FETCH ALL FLIGHTS =================
//   // const fetchAllFlights = async () => {
//   //   try {
//   //     setLoading(true);
//   //     const data = await getAllFlights(page, size); // your new endpoint
//   //     setAllFlight(data);
//   //     setTotal(data);
//   //   } catch (err) {
//   //     console.error(err);
//   //     showError("Failed to load all flights");
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };
//   const [loadingAll, setLoadingAll] = useState(false);
//   const [loadingToday, setLoadingToday] = useState(false);

//   const fetchAllFlights = async () => {
//     try {
//       setLoadingAll(true);
//       const data = await getAllFlights(page, size);
//       setAllFlight(data);
//     } finally {
//       setLoadingAll(false);
//     }
//   };

//   // ================= FETCH TODAY FLIGHT =================
//   const fetchFlight = async () => {
//     try {
//       setLoading(true);
//       const data = await getTodayFlights();
//       setFlight(data);
//     } catch (err) {
//       console.error(err);
//       showError("Failed to load today flights");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchAircraft = async () => {
//     try {
//       const data = await getAllAircraft();
//       setAircraftList(data);
//     } catch (err) {
//       console.error(err);
//       showError("Failed to load aircraft list");
//     }
//   };

//   useEffect(() => {
//     fetchAircraft();
//     fetchFlight();
//   }, []);

//   useEffect(() => {
//     fetchAllFlights();
//   }, [page]);

//   // ================= CREATE MODAL =================
//   const handleCreateChange = (e) => {
//     const { name, value, type, checked } = e.target;

//     // setCreateForm((prev) => ({
//     //   ...prev,
//     //   [name]: type === "checkbox" ? checked : value,
//     // }));
//     setCreateForm((prev) => ({
//       ...prev,
//       [name]: name === "status" ? Number(value) : value,
//     }));
//   };

//   const submitCreate = async () => {
//     try {
//       if (
//         !createForm.flightNumber ||
//         !createForm.origin ||
//         !createForm.destination ||
//         !createForm.departureTime ||
//         !createForm.arrivalTime ||
//         !createForm.aircraftId
//       ) {
//         return showError("Please fill all required fields");
//       }

//       // setCreating(true);
//       await fetchFlight();
//       await fetchAllFlights();

//       const payload = {
//         ...createForm,
//         aircraftId: Number(createForm.aircraftId),
//       };

//       const created = await createFlight(payload);

//       // Add new flight to list instantly
//       setFlight((prev) => [...prev, created]);

//       showSuccess("Flight created successfully");

//       setShowCreate(false);

//       // Reset form
//       setCreateForm({
//         flightNumber: "",
//         origin: "",
//         destination: "",
//         departureTime: "",
//         arrivalTime: "",
//         aircraftId: "",
//         status: "",
//         // isActive: true,
//       });
//     } catch (err) {
//       showError(parseApiError(err));
//     } finally {
//       setCreating(false);
//     }
//   };

//   // ==================== Handles Changes ====================
//   const handleAircraftChange = (e) => {
//     const value = e.target.value;
//     setAircraftQuery(value);

//     const filtered = aircraftList.filter((a) =>
//       `${a.model} ${a.airlineName}`.toLowerCase().includes(value.toLowerCase()),
//     );

//     setFilteredAircraft(filtered);
//   };
//   const selectAircraft = (aircraft) => {
//     setSelectedAircraft(aircraft);
//     setAircraftQuery(`${aircraft.model} (${aircraft.airlineName})`);
//     setFilteredAircraft([]);

//     // IMPORTANT: update your form state
//     setCreateForm((prev) => ({
//       ...prev,
//       aircraftId: aircraft.aircraftId,
//     }));
//   };

//   // ================= EDIT MODAL =================
//   // const openEdit = (f) => {
//   //   setEditingFlight({
//   //     flightId: f.flightId,
//   //     flightNumber: f.flightNumber,
//   //     origin: f.origin,
//   //     destination: f.destination,
//   //     departureTime: f.departureTime,
//   //     arrivalTime: f.arrivalTime,
//   //     aircraftId: f.aircraftId,
//   //     aircraftModel: f.aircraftModel,
//   //     status: Number(f.status),
//   //   });

//   //   setShowEdit(true);
//   // };
//   const openEdit = (f) => {
//     setEditingFlight({
//       ...f,
//       status: Number(f.status),
//       aircraftId: f.aircraftId,
//     });

//     // Pre-fill aircraft input
//     const foundAircraft = aircraftList.find(
//       (a) => a.aircraftId === f.aircraftId,
//     );
//     setEditAircraftQuery(
//       foundAircraft
//         ? `${foundAircraft.model} (${foundAircraft.airlineName})`
//         : "",
//     );
//     setSelectedEditAircraft(foundAircraft || null);

//     setShowEdit(true);
//   };

//   useEffect(() => {
//     if (editingFlight?.aircraftId && aircraftList.length > 0) {
//       const found = aircraftList.find(
//         (a) => a.aircraftId === editingFlight.aircraftId,
//       );
//       if (found) {
//         setEditAircraftQuery(`${found.model} (${found.airlineName})`);
//         setSelectedEditAircraft(null); // reset selected so input is editable
//       }
//     }
//   }, [editingFlight, aircraftList]);

//   const handleEditAircraftChange = (e) => {
//     const value = e.target.value;
//     setEditAircraftQuery(value);
//     setSelectedEditAircraft(null); // clear selection if user types manually

//     const filtered = aircraftList.filter((a) =>
//       `${a.model} ${a.airlineName}`.toLowerCase().includes(value.toLowerCase()),
//     );
//     setEditFilteredAircraft(filtered);
//   };
//   const selectEditAircraft = (aircraft) => {
//     setSelectedEditAircraft(aircraft);
//     setEditAircraftQuery(`${aircraft.model} (${aircraft.airlineName})`);
//     setEditFilteredAircraft([]);

//     setEditingFlight((prev) => ({
//       ...prev,
//       aircraftId: aircraft.aircraftId,
//       aircraftModel: aircraft.model,
//     }));
//   };
//   // const submitUpdate = async () => {
//   //   console.log("editingFlight", editingFlight);
//   //   try {
//   //     // Basic Validation
//   //     if (
//   //       !editingFlight.flightNumber ||
//   //       !editingFlight.origin ||
//   //       !editingFlight.destination ||
//   //       !editingFlight.departureTime ||
//   //       !editingFlight.arrivalTime ||
//   //       editingFlight.status === undefined ||
//   //       !editingFlight.aircraftId ||
//   //       editingFlight.aircraftId <= 0
//   //     )
//   //       return showError(
//   //         "Please fill all required fields and select a valid aircraft",
//   //       );

//   //     setUpdating(true);

//   //     // Prepare payload
//   //     const updatedPayload = {
//   //       flightNumber: editingFlight.flightNumber,
//   //       origin: editingFlight.origin,
//   //       destination: editingFlight.destination,
//   //       departureTime: editingFlight.departureTime,
//   //       arrivalTime: editingFlight.arrivalTime,
//   //       aircraftId: editingFlight.aircraftId,
//   //       status: editingFlight.status,
//   //       // isActive: editingFlight.isActive,
//   //     };

//   //     // Call backend
//   //     const updated = await updateFlight(
//   //       editingFlight.flightId,
//   //       updatedPayload,
//   //     );

//   //     // Update frontend list
//   //     setFlight((prev) =>
//   //       prev.map((f) => (f.flightId === updated.flightId ? updated : f)),
//   //     );

//   //     showSuccess("Flight updated successfully");

//   //     // Close modal
//   //     setShowEdit(false);
//   //     setEditingFlight(null);
//   //   } catch (err) {
//   //     showError(parseApiError(err));
//   //   } finally {
//   //     setUpdating(false);
//   //   }
//   // };
//   const submitUpdate = async () => {
//     if (
//       !editingFlight.flightNumber ||
//       !editingFlight.origin ||
//       !editingFlight.destination ||
//       !editingFlight.departureTime ||
//       !editingFlight.arrivalTime ||
//       editingFlight.status === undefined ||
//       !editingFlight.aircraftId
//     ) {
//       return showError(
//         "Please fill all required fields and select a valid aircraft",
//       );
//     }

//     const payload = {
//       ...editingFlight,
//       aircraftId: Number(editingFlight.aircraftId),
//     };

//     const updated = await updateFlight(editingFlight.flightId, payload);
//     setFlight((prev) =>
//       prev.map((f) => (f.flightId === updated.flightId ? updated : f)),
//     );
//     showSuccess("Flight updated successfully");
//     setShowEdit(false);
//     setEditingFlight(null);
//   };

//   // ===== OPEN EDIT MODAL FOR SEAT FEATURES =====
//  // Open seat modal for a flight
// const openSeatModal = async (flight) => {
//   try {
//     setSeatFlight(flight);
//     setSeatLoading(true);

//     // Fetch seats from backend
//     const data = await getSeatsByFlight(flight.flightId);
//     setSeats(data || []);

//     setSeatModalOpen(true);
//   } catch (err) {
//     showError("Failed to load seats");
//     console.error(err);
//   } finally {
//     setSeatLoading(false);
//   }
// };

// // Handle seat field change (number, class, price)
// const handleSeatChange = (seatId, field, value) => {
//   setSeats((prev) =>
//     prev.map((s) =>
//       s.seatId === seatId
//         ? { ...s, [field]: field === "price" ? Number(value) : value }
//         : s
//     )
//   );
// };

// // Handle feature change
// const handleFeatureChange = (seatIdx, featureIdx, key, value) => {
//   setSeats((prev) =>
//     prev.map((s, idx) =>
//       idx === seatIdx
//         ? {
//             ...s,
//             features: s.features.map((f, fI) =>
//               fI === featureIdx ? { ...f, [key]: value } : f
//             ),
//           }
//         : s
//     )
//   );
// };

// // Add a feature to a seat
// const addFeature = (seatIdx) => {
//   setSeats((prev) =>
//     prev.map((s, idx) =>
//       idx === seatIdx
//         ? {
//             ...s,
//             features: [
//               ...s.features,
//               { seatFeatureId: Date.now(), name: "", priceModifier: 0 },
//             ],
//           }
//         : s
//     )
//   );
// };

// // Remove a feature from a seat
// const removeFeature = (seatIdx, featureIdx) => {
//   setSeats((prev) =>
//     prev.map((s, idx) =>
//       idx === seatIdx
//         ? { ...s, features: s.features.filter((_, fI) => fI !== featureIdx) }
//         : s
//     )
//   );
// };

// // Add a new seat
// const addNewSeat = () => {
//   setSeats((prev) => [
//     ...prev,
//     {
//       seatId: Date.now(),
//       seatNumber: "",
//       class: "Economy",
//       price: 0,
//       isLocked: false,
//       isBooked: false,
//       features: [],
//     },
//   ]);
// };

// // Submit updated seats to backend
// const submitSeats = async () => {
//   try {
//     setSeatLoading(true);

//     // Basic validation
//     for (let s of seats) {
//       if (!s.seatNumber || !s.class || s.price === null) {
//         return showError("Please fill all seat details correctly");
//       }
//     }

//     // Map frontend fields to backend DTO
//     const seatDtos = seats.map((s) => ({
//       seatId: s.seatId,
//       seatNumber: s.seatNumber,
//       class: s.class,
//       price: s.price,
//       features: s.features.map((f) => ({
//         seatFeatureId: f.seatFeatureId,
//       })),
//     }));

//     await updateSeats(seatFlight.flightId, seatDtos);

//     showSuccess("Seats updated successfully");
//     setSeatModalOpen(false);
//     setSeats([]);
//     setSeatFlight(null);
//   } catch (err) {
//     showError("Failed to update seats");
//     console.error(err);
//   } finally {
//     setSeatLoading(false);
//   }
// };
//   // ===== SCROLL BODY LOCK WHEN MODAL IS OPEN =====
//   useEffect(() => {
//     if ((showEdit, showCreate)) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "auto";
//     }

//     return () => {
//       document.body.style.overflow = "auto";
//     };
//   }, [showEdit, showCreate]);

//   // FOR STATUS DROPDOWN
//   const statusOptions = [
//     { value: 0, label: "Scheduled" },
//     { value: 1, label: "Boarding" },
//     { value: 2, label: "Departed" },
//     { value: 3, label: "Delayed" },
//     { value: 4, label: "Cancelled" },
//     { value: 5, label: "Completed" },
//   ];

//   // ================= DATE/TIME FORMATTING =================
//   const formatDate = (date) =>
//     new Date(date).toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });

//   const formatTime = (date) =>
//     new Date(date).toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit",
//     });

//   return (
//     <>
//       <div
//         className="px-4 sm:px-6 py-4 mx-auto w-full relative"
//         onClick={() => setActiveController(null)}
//       >
//         <div className="mb-3">
//           <h1 className="text-3xl font-semibold mb-1 text-charcoal ">
//             Flight Management
//           </h1>
//           <p className="text-charcoal-100 mb-4">
//             View and manage all app users.
//           </p>
//           <input
//             className="input-search mb-6 "
//             type="text"
//             placeholder="Search flights..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//         </div>

//         <div className="relative flex flex-col w-full h-full text-slate-700 bg-[#f1f1f1] shadow-md rounded-xl bg-clip-border">
//           <div className="relative mx-4 mt-4 overflow-hidden text-slate-700 bg-[#f1f1f1] rounded-none bg-clip-border">
//             {/* Add Buttons */}
//             <div className="flex items-center justify-between ">
//               <div>
//                 <h3 className="text-lg font-semibold ">
//                   {table === 1 ? (
//                     <span>Today Flights List</span>
//                   ) : (
//                     <span>All Flights List</span>
//                   )}
//                 </h3>
//                 <p className="text-charcoal-100">
//                   Review each aircraft before edit
//                 </p>
//               </div>
//               <div className="flex flex-col gap-2 shrink-0 sm:flex-row">
//                 <button
//                   onClick={() => setTable(1)}
//                   className="rounded border border-slate-300 py-2.5 px-3 text-center text-xs font-semibold text-slate-600 transition-all hover:opacity-75 focus:ring focus:ring-slate-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
//                   type="button"
//                 >
//                   Today Flight
//                 </button>
//                 <button
//                   onClick={() => setTable(2)}
//                   className="rounded border border-slate-300 py-2.5 px-3 text-center text-xs font-semibold text-slate-600 transition-all hover:opacity-75 focus:ring focus:ring-slate-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
//                   type="button"
//                 >
//                   View All
//                 </button>
//                 <button
//                   onClick={() => setShowCreate(true)}
//                   className="flex select-none items-center gap-2 rounded bg-charcoal py-2.5 px-4 text-xs font-semibold text-white shadow-md transition-all hover:shadow-lg hover:bg-charcoal-100 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
//                   type="button"
//                 >
//                   <img
//                     src="/icons/add-user-left-6-white-svgrepo-com.svg"
//                     width={20}
//                     alt=""
//                   />
//                   Add Aircraft
//                 </button>
//               </div>
//             </div>
//           </div>
//           {loadingToday || loadingAll ? (
//             <p className="p-4 text-2xl">Loading...</p>
//           ) : table === 1 ? (
//             // TODAY FLIGHTS
//             <div className="p-0 overflow-scroll">
//               <table className="w-full mt-4 text-left table-auto min-w-max">
//                 <thead>
//                   <tr>
//                     <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
//                       <p className="flex items-center justify-between gap-2 font-sans text-sm font-normal leading-none text-slate-500">
//                         Flight Number
//                         <ChevronsUpDown className="size-4" />
//                       </p>
//                     </th>
//                     <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
//                       <p className="flex items-center justify-between gap-2 font-sans text-sm font-normal leading-none text-slate-500">
//                         Origin
//                         <ChevronsUpDown className="size-4" />
//                       </p>
//                     </th>
//                     <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
//                       <p className="flex items-center justify-between gap-2 font-sans text-sm  font-normal leading-none text-slate-500">
//                         Destination
//                         <ChevronsUpDown className="size-4" />
//                       </p>
//                     </th>
//                     <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
//                       <p className="flex items-center justify-between gap-2 font-sans text-sm  font-normal leading-none text-slate-500">
//                         Departure
//                         <ChevronsUpDown className="size-4" />
//                       </p>
//                     </th>
//                     <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
//                       <p className="flex items-center justify-between gap-2 font-sans text-sm  font-normal leading-none text-slate-500">
//                         Arrival
//                         <ChevronsUpDown className="size-4" />
//                       </p>
//                     </th>
//                     <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
//                       <p className="flex items-center justify-between gap-2 font-sans text-sm  font-normal leading-none text-slate-500">
//                         Status
//                         <ChevronsUpDown className="size-4" />
//                       </p>
//                     </th>
//                     <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-slate-50 hover:bg-slate-100">
//                       <p className="flex items-center justify-between gap-2 font-sans text-sm  font-normal leading-none text-slate-500">
//                         Actions
//                         <ChevronsUpDown className="size-4" />
//                       </p>
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="" onClick={() => setActiveController(false)}>
//                   {filteredFlights.map((f) => (
//                     <tr key={f.flightId}>
//                       <td className="p-4 border-b border-slate-200">
//                         <div className="flex items-center gap-3">
//                           <div className="flex flex-col">
//                             <p className="text-sm font-semibold text-slate-700">
//                               {f.flightNumber}
//                             </p>
//                             <p className="text-sm text-slate-500">
//                               {f.aircraftModel}
//                             </p>
//                             <p className="text-sm text-slate-500">
//                               {f.airlineName || "Emirates"}
//                             </p>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="p-4 border-b border-slate-200">
//                         <p className="text-sm text-slate-500">{f.origin}</p>
//                       </td>
//                       <td className="p-4 border-b border-slate-200">
//                         <p className="text-sm text-slate-500">
//                           {f.destination}
//                         </p>
//                       </td>
//                       <td className="p-4 border-b border-slate-200">
//                         <p className="text-sm text-slate-800">
//                           {formatDate(f.departureTime)}
//                         </p>
//                         <p className="text-sm text-slate-500">
//                           {formatTime(f.departureTime)}
//                         </p>
//                       </td>
//                       <td className="p-4 border-b border-slate-200">
//                         <p className="text-sm text-slate-800">
//                           {formatDate(f.arrivalTime)}
//                         </p>
//                         <p className="text-sm text-slate-500">
//                           {formatTime(f.arrivalTime)}
//                         </p>
//                       </td>
//                       <td className="p-4 border-b border-slate-200">
//                         <div className="w-max">
//                           <div className="relative grid items-center font-sans text-xs font-bold  uppercase  select-none whitespace-nowrap ">
//                             {f.status == 1 ? (
//                               <span className="text-blue-900 bg-blue-500/20 px-2 py-1 rounded-md">
//                                 Boarding
//                               </span>
//                             ) : f.status == 2 ? (
//                               <span className="text-indigo-900 bg-indigo-500/20 px-2 py-1 rounded-md">
//                                 Departed
//                               </span>
//                             ) : f.status == 3 ? (
//                               <span className="text-yellow-900 bg-yellow-500/20 px-2 py-1 rounded-md">
//                                 Delayed
//                               </span>
//                             ) : f.status == 4 ? (
//                               <span className="text-red-900 bg-red-500/20 px-2 py-1 rounded-md">
//                                 Cancelled
//                               </span>
//                             ) : f.status == 5 ? (
//                               <span className="text-gray-700 bg-gray-200 px-2 py-1 rounded-md">
//                                 Completed
//                               </span>
//                             ) : (
//                               <span className="text-green-900 bg-green-500/20 px-2 py-1 rounded-md">
//                                 Scheduled
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="relative p-4 border-b border-slate-200 ">
//                         <div onClick={(e) => e.stopPropagation()}>
//                           <div
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               setActiveController(
//                                 activeController === f.flightId
//                                   ? null
//                                   : f.flightId,
//                               );
//                             }}
//                             className=" h-10 max-h-10 w-10 max-w-10 select-none rounded-lg text-center flex items-center font-sans text-xs font-medium uppercase text-slate-900 transition-all hover:bg-slate-900/10 active:bg-slate-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
//                             type="button"
//                           >
//                             <img
//                               src="/icons/interface-ui-dots-menu-svgrepo-com.svg"
//                               width="20px"
//                               alt=""
//                               className="mx-auto"
//                             />
//                             {activeController === f.flightId && (
//                               <div className="absolute p-3 bottom-2 right-5 bg-white rounded-lg space-y-2 w-max text-[12px]">
//                                 <button
//                                   onClick={() => openEdit(f)}
//                                   className="w-full text-left flex gap-2"
//                                 >
//                                   <img
//                                     src="/icons/edit-svgrepo-com.svg"
//                                     alt=""
//                                     className="w-4"
//                                   />
//                                   <span>Edit</span>
//                                 </button>
//                                 <button
//                                   onClick={() => openSeatModal(f)}
//                                   className="w-full text-left flex gap-2"
//                                 >
//                                   <img
//                                     src="/icons/delete-2-svgrepo-com.svg"
//                                     alt=""
//                                     className="w-4"
//                                   />
//                                   <span className="text-red-500">Delete</span>
//                                 </button>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           ) : table === 2 ? (
//             // All FLIGHTS
//             <div className="p-0 overflow-scroll">
//               <table className="w-full mt-4 text-left table-auto min-w-max">
//                 <thead>
//                   <tr>
//                     <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
//                       <p className="flex items-center justify-between gap-2 font-sans text-sm font-normal leading-none text-slate-500">
//                         Flight Number
//                         <ChevronsUpDown className="size-4" />
//                       </p>
//                     </th>
//                     <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
//                       <p className="flex items-center justify-between gap-2 font-sans text-sm font-normal leading-none text-slate-500">
//                         Origin
//                         <ChevronsUpDown className="size-4" />
//                       </p>
//                     </th>
//                     <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
//                       <p className="flex items-center justify-between gap-2 font-sans text-sm  font-normal leading-none text-slate-500">
//                         Destination
//                         <ChevronsUpDown className="size-4" />
//                       </p>
//                     </th>
//                     <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
//                       <p className="flex items-center justify-between gap-2 font-sans text-sm  font-normal leading-none text-slate-500">
//                         Departure
//                         <ChevronsUpDown className="size-4" />
//                       </p>
//                     </th>
//                     <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
//                       <p className="flex items-center justify-between gap-2 font-sans text-sm  font-normal leading-none text-slate-500">
//                         Arrival
//                         <ChevronsUpDown className="size-4" />
//                       </p>
//                     </th>
//                     <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
//                       <p className="flex items-center justify-between gap-2 font-sans text-sm  font-normal leading-none text-slate-500">
//                         Status
//                         <ChevronsUpDown className="size-4" />
//                       </p>
//                     </th>
//                     <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-slate-50 hover:bg-slate-100">
//                       <p className="flex items-center justify-between gap-2 font-sans text-sm  font-normal leading-none text-slate-500">
//                         Actions
//                         <ChevronsUpDown className="size-4" />
//                       </p>
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="" onClick={() => setActiveController(false)}>
//                   {filteredFlights.map((f) => (
//                     <tr key={f.flightId}>
//                       <td className="p-4 border-b border-slate-200">
//                         <div className="flex items-center gap-3">
//                           <div className="flex flex-col">
//                             <p className="text-sm font-semibold text-slate-700">
//                               {f.flightNumber}
//                             </p>
//                             <p className="text-sm text-slate-500">
//                               {f.aircraftModel}
//                             </p>
//                             <p className="text-sm text-slate-500">
//                               {f.airlineName || "Emirates"}
//                             </p>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="p-4 border-b border-slate-200">
//                         <p className="text-sm text-slate-500">{f.origin}</p>
//                       </td>
//                       <td className="p-4 border-b border-slate-200">
//                         <p className="text-sm text-slate-500">
//                           {f.destination}
//                         </p>
//                       </td>
//                       <td className="p-4 border-b border-slate-200">
//                         <p className="text-sm text-slate-800">
//                           {formatDate(f.departureTime)}
//                         </p>
//                         <p className="text-sm text-slate-500">
//                           {formatTime(f.departureTime)}
//                         </p>
//                       </td>
//                       <td className="p-4 border-b border-slate-200">
//                         <p className="text-sm text-slate-800">
//                           {formatDate(f.arrivalTime)}
//                         </p>
//                         <p className="text-sm text-slate-500">
//                           {formatTime(f.arrivalTime)}
//                         </p>
//                       </td>
//                       <td className="p-4 border-b border-slate-200">
//                         <div className="w-max">
//                           <div className="relative grid items-center text-xs font-bold  uppercase  select-none whitespace-nowrap ">
//                             {f.status == 1 ? (
//                               <span className="text-blue-900 bg-blue-500/20 px-2 py-1 rounded-md">
//                                 Boarding
//                               </span>
//                             ) : f.status == 2 ? (
//                               <span className="text-indigo-900 bg-indigo-500/20 px-2 py-1 rounded-md">
//                                 Departed
//                               </span>
//                             ) : f.status == 3 ? (
//                               <span className="text-yellow-900 bg-yellow-500/20 px-2 py-1 rounded-md">
//                                 Delayed
//                               </span>
//                             ) : f.status == 4 ? (
//                               <span className="text-red-900 bg-red-500/20 px-2 py-1 rounded-md">
//                                 Cancelled
//                               </span>
//                             ) : f.status == 5 ? (
//                               <span className="text-gray-700 bg-gray-200 px-2 py-1 rounded-md">
//                                 Completed
//                               </span>
//                             ) : (
//                               <span className="text-green-900 bg-green-500/20 px-2 py-1 rounded-md">
//                                 Scheduled
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="relative p-4 border-b border-slate-200 ">
//                         <div onClick={(e) => e.stopPropagation()}>
//                           <div
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               setActiveController(
//                                 activeController === f.flightId
//                                   ? null
//                                   : f.flightId,
//                               );
//                             }}
//                             className=" h-10 max-h-10 w-10 max-w-10 select-none rounded-lg text-center flex align-center font-sans text-xs font-medium uppercase text-slate-900 transition-all hover:bg-slate-900/10 active:bg-slate-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
//                             type="button"
//                           >
//                             <img
//                               src="/icons/interface-ui-dots-menu-svgrepo-com.svg"
//                               width="20px"
//                               alt=""
//                               className="mx-auto"
//                             />
//                             {activeController === f.flightId && (
//                               <div className="absolute p-3 bottom-2 right-5 bg-white rounded-lg space-y-2 w-max text-[12px]">
//                                 <button
//                                   onClick={() => openEdit(f)}
//                                   className="w-full text-left flex gap-2"
//                                 >
//                                   <img
//                                     src="/icons/edit-svgrepo-com.svg"
//                                     alt=""
//                                     className="w-4"
//                                   />
//                                   <span>Edit</span>
//                                 </button>
//                                 <button
//                                   onClick={() => openSeatModal(f)}
//                                   className="w-full text-left flex gap-2"
//                                 >
//                                   <img
//                                     src="/icons/delete-2-svgrepo-com.svg"
//                                     alt=""
//                                     className="w-4"
//                                   />
//                                   <span className="text-red-500">Delete</span>
//                                 </button>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           ) : null}

//           {/* ================= PAGINATION ================= */}
//           <div className="flex items-center justify-between p-3">
//             <p className="block text-sm text-slate-500">
//               Page {page + 1} / {Math.ceil(total / size)}
//             </p>
//             <div className="flex gap-1">
//               <button
//                 className="rounded border border-slate-300 py-2.5 px-3 text-center text-xs font-semibold text-slate-600 transition-all hover:opacity-75 focus:ring focus:ring-slate-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
//                 type="button"
//                 disabled={page === 0}
//                 onClick={() => setPage((p) => p - 1)}
//               >
//                 Previous
//               </button>
//               <button
//                 className="rounded border border-slate-300 py-2.5 px-3 text-center text-xs font-semibold text-slate-600 transition-all hover:opacity-75 focus:ring focus:ring-slate-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
//                 type="button"
//                 // disabled={(page + 1) * size >= total}
//                 onClick={() => setPage((p) => p + 1)}
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* -- CREATE MODAL -- */}
//         {showCreate && (
//           <div
//             className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
//             onClick={() => setShowCreate(false)}
//           >
//             <div
//               className="bg-white p-6 rounded-lg w-max space-y-3"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <h2 className="font-bold text-xl">Create Flight</h2>

//               <div className="grid grid-cols-2">
//                 <div className="relative p-2">
//                   <label className="form-label">Flight Number</label>
//                   <input
//                     name="flightNumber"
//                     placeholder="Flight Number"
//                     value={createForm.flightNumber}
//                     onChange={handleCreateChange}
//                     className="form-input w-full"
//                   />
//                 </div>

//                 <div className="relative p-2">
//                   <label className="form-label">Aircarft</label>
//                   <input
//                     type="text"
//                     placeholder="Select Aircraft"
//                     value={
//                       selectedAircraft
//                         ? `${selectedAircraft.model} (${selectedAircraft.airlineName})`
//                         : aircraftQuery
//                     }
//                     onChange={handleAircraftChange}
//                     className="form-input w-full"
//                   />

//                   {filteredAircraft.length > 0 && (
//                     <ul className="absolute z-10 bg-white w-full mt-1 rounded shadow-md max-h-60 overflow-y-auto">
//                       {filteredAircraft.map((a) => (
//                         <li
//                           key={a.aircraftId}
//                           onClick={() => selectAircraft(a)}
//                           className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex justify-between text-sm"
//                         >
//                           <span>{a.model}</span>
//                           <span className="text-gray-400">{a.airlineName}</span>
//                         </li>
//                       ))}
//                     </ul>
//                   )}
//                   {/* <select
//                   name="aircraftId"
//                   value={createForm.aircraftId}
//                   onChange={handleCreateChange}
//                   className="form-input w-full"
//                 >
//                   <option value="">Select Aircraft</option>
//                   {aircraftList.map((a) => (
//                     <option key={a.aircraftId} value={a.aircraftId}>
//                       {a.model} -- {a.airlineName}
//                     </option>
//                   ))}
//                 </select> */}
//                 </div>
//               </div>

//               <div className="grid grid-cols-2">
//                 <div className="relative p-2">
//                   <label className="form-label">Origin</label>
//                   <input
//                     name="origin"
//                     placeholder="Origin"
//                     value={createForm.origin}
//                     onChange={handleCreateChange}
//                     className="form-input w-full"
//                   />
//                 </div>
//                 <div className="relative p-2">
//                   <label className="form-label">Destination</label>
//                   <input
//                     name="destination"
//                     placeholder="Destination"
//                     value={createForm.destination}
//                     onChange={handleCreateChange}
//                     className="form-input w-full"
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-2">
//                 <div className="relative p-2">
//                   <label className="form-label">Departure Time</label>
//                   <input
//                     type="datetime-local"
//                     name="departureTime"
//                     value={createForm.departureTime}
//                     onChange={handleCreateChange}
//                     className="form-input w-full"
//                   />
//                 </div>
//                 <div className="relative p-2">
//                   <label className="form-label">Arrival Time</label>
//                   <input
//                     type="datetime-local"
//                     name="arrivalTime"
//                     value={createForm.arrivalTime}
//                     onChange={handleCreateChange}
//                     className="form-input w-full"
//                   />
//                 </div>
//               </div>

//               <div className="relative p-2">
//                 <label className="form-label">Status</label>
//                 <select
//                   name="status"
//                   value={createForm.status || ""}
//                   onChange={handleCreateChange}
//                   className="form-input w-full"
//                 >
//                   <option value="">Select Status</option>
//                   <option value={FlightStatus.Scheduled}>Scheduled</option>
//                   <option value={FlightStatus.Boarding}>Boarding</option>
//                   <option value={FlightStatus.Departed}>Departed</option>
//                   <option value={FlightStatus.Delayed}>Delayed</option>
//                   <option value={FlightStatus.Cancelled}>Cancelled</option>
//                   <option value={FlightStatus.Completed}>Completed</option>
//                 </select>
//               </div>

//               <div className="flex justify-end gap-4">
//                 <button
//                   onClick={() => setShowCreate(false)}
//                   className="px-3 py-2 bg-gray-300 text-charcoal rounded"
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   disabled={creating}
//                   onClick={submitCreate}
//                   className="px-3 py-2 bg-charcoal text-white rounded"
//                 >
//                   {creating ? "Creating..." : "Create"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* -- EDIT MODAL -- */}
//         {showEdit && editingFlight && (
//           <div
//             className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 "
//             onClick={() => setShowEdit(false)}
//           >
//             <div
//               className="bg-white p-6 rounded-lg space-y-3 w-full max-w-135 max-h-[85vh] overflow-y-auto "
//               onClick={(e) => e.stopPropagation()}
//             >
//               <h2 className="font-bold text-xl text-chatcoal">
//                 Edit Aircraft Details
//               </h2>

//               {/* Form Fields */}
//               <div className="grid grid-cols-2">
//                 <div className="relative p-2">
//                   <label className="form-label">Flight Number</label>
//                   <input
//                     value={editingFlight.flightNumber}
//                     onChange={(e) =>
//                       setEditingFlight((p) => ({
//                         ...p,
//                         flightNumber: e.target.value,
//                       }))
//                     }
//                     className="form-input w-full"
//                   />
//                 </div>
//                 <div className="relative p-2 ">
//                   <label className="form-label">Aircraft</label>
//                   <input
//                     type="text"
//                     placeholder="Select Aircraft"
//                     // value={
//                     //   selectedEditAircraft
//                     //     ? `${selectedEditAircraft.model} (${selectedEditAircraft.airlineName})`
//                     //     : editAircraftQuery
//                     // }
//                     value={editAircraftQuery}
//                     onChange={handleEditAircraftChange}
//                     className="form-input w-full"
//                   />

//                   {editFilteredAircraft.length > 0 && (
//                     <ul className="absolute z-10 bg-white w-full mt-1 rounded shadow-md max-h-60 overflow-y-auto">
//                       {editFilteredAircraft.map((a) => (
//                         <li
//                           key={a.aircraftId}
//                           onClick={() => selectEditAircraft(a)}
//                           className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex justify-between"
//                         >
//                           <span>{a.model}</span>
//                           <span className="text-gray-400">{a.airlineName}</span>
//                         </li>
//                       ))}
//                     </ul>
//                   )}
//                   {/* <select
//                     value={editingFlight.aircraftId || ""}
//                     onChange={(e) =>
//                       setEditingFlight((p) => ({
//                         ...p,
//                         aircraftId: parseInt(e.target.value),
//                         aircraftModel: aircraftList.find(
//                           (a) => a.aircraftId === parseInt(e.target.value),
//                         )?.model,
//                       }))
//                     }
//                     className="form-input w-full"
//                   >
//                     <option value="">Select Aircraft</option>
//                     {aircraftList.map((a) => (
//                       <option key={a.aircraftId} value={a.aircraftId}>
//                         {a.model} -- {a.airlineName}
//                       </option>
//                     ))}
//                   </select> */}
//                 </div>
//               </div>
//               <div className="relative p-2">
//                 <label className="form-label">Origin</label>
//                 <input
//                   value={editingFlight.origin}
//                   onChange={(e) =>
//                     setEditingFlight((p) => ({
//                       ...p,
//                       origin: e.target.value,
//                     }))
//                   }
//                   className="form-input w-full"
//                 />
//               </div>
//               <div className="relative p-2">
//                 <label className="form-label">Destination</label>
//                 <input
//                   value={editingFlight.destination}
//                   onChange={(e) =>
//                     setEditingFlight((p) => ({
//                       ...p,
//                       destination: e.target.value,
//                     }))
//                   }
//                   className="form-input w-full"
//                 />
//               </div>
//               <div className="grid grid-cols-2">
//                 <div className="relative p-2">
//                   <label className="form-label">Departure</label>
//                   <input
//                     type="datetime-local"
//                     value={editingFlight.departureTime}
//                     onChange={(e) =>
//                       setEditingFlight((p) => ({
//                         ...p,
//                         departureTime: e.target.value,
//                       }))
//                     }
//                     className="form-input w-full"
//                   />
//                 </div>
//                 <div className="relative p-2 ">
//                   <label className="form-label">Arrival</label>
//                   <input
//                     type="datetime-local"
//                     className="form-input w-full"
//                     value={editingFlight.arrivalTime}
//                     onChange={(e) =>
//                       setEditingFlight((p) => ({
//                         ...p,
//                         arrivalTime: e.target.value,
//                       }))
//                     }
//                   />
//                 </div>
//               </div>

//               <div className="relative p-2">
//                 <label className="form-label z-20">Status</label>
//                 <select
//                   name="status"
//                   value={editingFlight.status ?? ""}
//                   onChange={(e) =>
//                     setEditingFlight((prev) => ({
//                       ...prev,
//                       status: Number(e.target.value),
//                     }))
//                   }
//                   className="form-input w-full"
//                 >
//                   <option value="">Select Status</option>
//                   <option value={FlightStatus.Scheduled}>Scheduled</option>
//                   <option value={FlightStatus.Boarding}>Boarding</option>
//                   <option value={FlightStatus.Departed}>Departed</option>
//                   <option value={FlightStatus.Delayed}>Delayed</option>
//                   <option value={FlightStatus.Cancelled}>Cancelled</option>
//                   <option value={FlightStatus.Completed}>Completed</option>
//                 </select>
//               </div>

//               <div className="flex justify-end gap-4">
//                 <button
//                   onClick={() => setShowEdit(false)}
//                   className="px-3 py-2 bg-gray-300 text-charcoal rounded"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   disabled={updating}
//                   onClick={submitUpdate}
//                   className="px-3 py-2 bg-charcoal text-white rounded"
//                 >
//                   {updating ? "Updating..." : "Update"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* EDIT FEATURE SEATS MODAL */}
//         {seatModalOpen && (
//           <div
//             onClick={() => setSeatModalOpen(false)}
//             className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
//           >
//             <div
//               onClick={(e) => e.stopPropagation()}
//               className="bg-white p-6 rounded-lg w-full max-w-3xl overflow-auto max-h-[80vh]"
//             >
//               <table className="min-w-full border">
//   <thead>
//     <tr>
//       <th>Seat Number</th>
//       <th>Class</th>
//       <th>Price</th>
//       <th>Features</th>
//       <th>Actions</th>
//     </tr>
//   </thead>
//   <tbody>
//     {seats.map((seat, idx) => (
//       <tr key={seat.seatId}>
//         <td>
//           <input
//             value={seat.seatNumber}
//             onChange={e => handleSeatChange(seat.seatId, "seatNumber", e.target.value)}
//             className="border p-1"
//           />
//         </td>
//         <td>
//           <select
//             value={seat.class}
//             onChange={e => handleSeatChange(seat.seatId, "class", e.target.value)}
//             className="border p-1"
//           >
//             <option value="First">First</option>
//             <option value="Business">Business</option>
//             <option value="Economy">Economy</option>
//           </select>
//         </td>
//         <td>
//           <input
//             type="number"
//             value={seat.price}
//             onChange={e => handleSeatChange(seat.seatId, "price", e.target.value)}
//             className="border p-1 w-20"
//           />
//         </td>
//         <td>
//           {seat.features.map((feature, fIdx) => (
//             <div key={feature.seatFeatureId} className="flex items-center gap-1">
//               <input
//                 value={feature.name}
//                 onChange={e => handleFeatureChange(idx, fIdx, "name", e.target.value)}
//                 className="border p-1 w-24"
//               />
//               <input
//                 type="number"
//                 value={feature.priceModifier}
//                 onChange={e => handleFeatureChange(idx, fIdx, "priceModifier", Number(e.target.value))}
//                 className="border p-1 w-16"
//               />
//               <button
//                 type="button"
//                 onClick={() => removeFeature(idx, fIdx)}
//                 className="text-red-500"
//               >
//                 ✕
//               </button>
//             </div>
//           ))}
//           <button type="button" onClick={() => addFeature(idx)} className="text-blue-500 mt-1">
//             + Add Feature
//           </button>
//         </td>
//         <td>
//           <button
//             onClick={() => submitSeats(seat)}
//             className="bg-blue-500 text-white px-2 py-1 rounded"
//           >
//             Save
//           </button>
//         </td>
//       </tr>
//     ))}
//   </tbody>
// </table>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default Flight;
