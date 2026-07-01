import { useState, useEffect, useRef } from "react";
import { getFlights, searchCities } from "../../api/flight";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Plane, ArrowRight, Calendar, Search, ChevronLeft, ChevronRight,
  Clock, Users, Armchair, AlertCircle, Wind
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const TRIP_TYPES = ["One Way", "Round Trip", "Multi City"];

const CLASS_CFG = {
  First:    { color: "bg-amber-400",   label: "First"    },
  Business: { color: "bg-sky-400",     label: "Business" },
  Economy:  { color: "bg-emerald-400", label: "Economy"  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtTime = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const fmtDate = (d) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const duration = (dep, arr) => {
  const diff = (new Date(arr) - new Date(dep)) / 60000;
  const h = Math.floor(diff / 60), m = diff % 60;
  return `${h}h ${m}m`;
};

// ─── City autocomplete input ──────────────────────────────────────────────────
const CityInput = ({ label, name, icon: Icon, selected, suggestions, onChange, onSelect, placeholder }) => {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      <label className="block text-[10px] font-bold text-gray-100 uppercase tracking-widest mb-1.5 px-1">
        {label}
      </label>
      <div className={`flex items-center gap-2.5 bg-white border-2 rounded-2xl px-4 py-3 transition-all
        ${open ? "border-slate-800 shadow-lg" : "border-slate-200 hover:border-slate-300"}`}>
        <Icon size={15} className="text-slate-400 shrink-0" />
        <input
          type="text"
          name={name}
          placeholder={placeholder}
          value={selected ? `${selected.city} (${selected.code})` : undefined}
          onChange={(e) => { onChange(e); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="flex-1 text-sm font-semibold text-slate-800 placeholder:text-slate-400
            placeholder:font-normal focus:outline-none bg-transparent min-w-0"
          required
        />
        {selected && (
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
            {selected.code}
          </span>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 top-full mt-1.5 w-full bg-white border border-slate-200
          rounded-2xl shadow-2xl overflow-hidden divide-y divide-slate-50">
          {suggestions.map((item) => (
            <li
              key={item.code}
              onMouseDown={() => { onSelect(item); setOpen(false); }}
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">{item.city}</p>
                <p className="text-xs text-slate-400">{item.country ?? ""}</p>
              </div>
              <span className="text-sm font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                {item.code}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ─── Flight result card ───────────────────────────────────────────────────────
const FlightCard = ({ flight, onSelect }) => {
  const dep = fmtTime(flight.departureTime);
  const arr = fmtTime(flight.arrivalTime);
  const dur = duration(flight.departureTime, flight.arrivalTime);
  const totalAvail = (flight.availableSeats?.First || 0) +
                     (flight.availableSeats?.Business || 0) +
                     (flight.availableSeats?.Economy || 0);

  return (
    <div className="group bg-white border border-slate-200 rounded-3xl overflow-hidden
      hover:border-slate-300 hover:shadow-xl transition-all duration-300">

      {/* Top accent bar — color by available class */}
      <div className="h-1 bg-linear-to-r from-slate-800 via-slate-600 to-slate-400" />

      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">

          {/* ── Flight info ── */}
          <div className="flex-1">
            {/* Airline + flight number */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center shrink-0">
                <Plane size={14} className="text-white -rotate-45" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 leading-none">{flight.airlineName} </p>
                <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase mt-0.5">
                  {flight.flightNumber}
                </p>
              </div>
              <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50
                border border-emerald-200 px-2 py-0.5 rounded-full">
                {totalAvail} seats left
              </span>
            </div>

            {/* Route + time */}
            <div className="flex items-center gap-3">
              {/* Origin */}
              <div className="text-center">
                <p className="text-3xl font-black text-slate-900 leading-none tracking-tight">{dep}</p>
                <p className="text-xs font-bold text-slate-500 mt-1 tracking-wider">{flight.origin}</p>
                <p className="text-[10px] text-slate-400">{fmtDate(flight.departureTime)}</p>
              </div>

              {/* Duration */}
              <div className="flex-1 flex flex-col items-center gap-1 px-2">
                <p className="text-[10px] font-bold text-slate-400 tracking-widest">{dur}</p>
                <div className="w-full flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full border-2 border-slate-300 shrink-0" />
                  <div className="flex-1 h-px bg-slate-200 relative">
                    <Plane size={11} className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-slate-400 -rotate-45" />
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                </div>
                <p className="text-[10px] text-slate-400">Direct</p>
              </div>

              {/* Destination */}
              <div className="text-center">
                <p className="text-3xl font-black text-slate-900 leading-none tracking-tight">{arr}</p>
                <p className="text-xs font-bold text-slate-500 mt-1 tracking-wider">{flight.destination}</p>
                <p className="text-[10px] text-slate-400">{fmtDate(flight.arrivalTime)}</p>
              </div>
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="hidden sm:block w-px h-24 bg-slate-100" />

          {/* ── Right: price + seats ── */}
          <div className="sm:w-48 flex flex-col gap-3">
            {/* Base price */}
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">From</p>
              <p className="text-2xl font-black text-slate-900 leading-tight">
                ${flight.basePrice?.toLocaleString() ?? "—"} 
              </p>
            </div>

            {/* Seat classes */}
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(CLASS_CFG).map(([cls, cfg]) => {
                const count = flight.availableSeats?.[cls] ?? 0;
                if (count === 0) return null;
                return (
                  <div key={cls} className="flex items-center gap-1 bg-slate-50 border border-slate-200
                    rounded-lg px-2 py-1">
                    <div className={`w-2 h-2 rounded-full ${cfg.color}`} />
                    <span className="text-[10px] font-bold text-slate-600">{cfg.label}</span>
                    <span className="text-[10px] text-slate-400">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <button
              onClick={() => onSelect(flight)}
              className="w-full h-10 bg-slate-900 text-white text-xs font-bold rounded-xl
                hover:bg-slate-700 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
            >
              Select Seats <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const FlightSearch = () => {
  const navigate      = useNavigate();
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState({
    origin: "", originCity: "",
    destination: "", destinationCity: "",
    date: "", page: 1, pageSize: 5,
  });

  const [selectedOrigin,      setSelectedOrigin]      = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [originSuggestions,   setOriginSuggestions]   = useState([]);
  const [destSuggestions,     setDestSuggestions]      = useState([]);
  const [tripType,            setTripType]             = useState("One Way");
  const [flights,             setFlights]              = useState([]);
  const [totalCount,          setTotalCount]           = useState(0);
  const [loading,             setLoading]              = useState(false);
  const [error,               setError]                = useState(null);
  const [searched,            setSearched]             = useState(false);

  // ── URL param init ─────────────────────────────────────────────────
  useEffect(() => {
    const origin      = searchParams.get("origin");
    const destination = searchParams.get("destination");
    const date        = searchParams.get("date");
    const originCity  = searchParams.get("originCity");
    const destCity    = searchParams.get("destinationCity");

    if (origin && destination && date) {
      const incoming = { origin, destination, date, originCity, destinationCity: destCity, page: 1 };
      setQuery((p) => ({ ...p, ...incoming }));
      if (originCity) setSelectedOrigin({ city: originCity, code: origin });
      if (destCity)   setSelectedDestination({ city: destCity, code: destination });
      fetchFlights(incoming);
    }
  }, []);

  // ── Auto-fetch on page change ──────────────────────────────────────
  useEffect(() => {
    if (query.origin && query.destination && query.date) fetchFlights();
  }, [query.page]);

  // ── Fetch ──────────────────────────────────────────────────────────
  const fetchFlights = async (overrides = {}) => {
    const params = { ...query, ...overrides };
    if (!params.origin || !params.destination || !params.date) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const data = await getFlights(params);
      setFlights(Array.isArray(data?.data) ? data.data : []);
      setTotalCount(data?.totalCount || 0);
    } catch {
      setError("Unable to fetch flights. Please try again.");
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  // ── City autocomplete ──────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "origin") {
      setSelectedOrigin(null);
      if (value.length >= 1) searchCities(value).then(setOriginSuggestions).catch(() => setOriginSuggestions([]));
      else setOriginSuggestions([]);
    }
    if (name === "destination") {
      setSelectedDestination(null);
      if (value.length >= 1) searchCities(value, "destination").then(setDestSuggestions).catch(() => setDestSuggestions([]));
      else setDestSuggestions([]);
    }
    setQuery((p) => ({ ...p, [name]: value }));
  };

  const selectOrigin = (item) => {
    setSelectedOrigin(item);
    setOriginSuggestions([]);
    setQuery((p) => ({ ...p, origin: item.code, originCity: item.city }));
  };

  const selectDestination = (item) => {
    setSelectedDestination(item);
    setDestSuggestions([]);
    setQuery((p) => ({ ...p, destination: item.code, destinationCity: item.city }));
  };

  // ── Submit ─────────────────────────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault();
    if (!selectedOrigin || !selectedDestination) {
      setError("Please select cities from the dropdown suggestions.");
      return;
    }
    setQuery((p) => ({ ...p, page: 1 }));
    fetchFlights({ page: 1 });
  };

  const totalPages = Math.ceil(totalCount / query.pageSize);

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero search bar ── */}
      <div className="bg-[url('images/search-bg.png')] bg-cover bg-center  px-4 py-10 sm:py-14">
        <div className="max-w-5xl mx-auto">

          {/* Heading */}
          <div className="my-8 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-4">
              <Plane size={13} className="text-amber-400 -rotate-45" />
              <span className="text-xs font-bold text-white/70 tracking-widest uppercase">Flight Search</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Where are you flying?
            </h1>
            <p className="text-gray-300 text-sm mt-2">Search hundreds of routes and find the best price</p>
          </div>

          {/* Trip type */}
          <div className="flex justify-center gap-2 mb-6">
            {TRIP_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setTripType(t)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all
                  ${tripType === t
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-white/70 hover:text-white/90 hover:bg-white/10"}`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Search form */}
          <form onSubmit={handleSearch}>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row gap-3">

                {/* Origin */}
                <CityInput
                  label="From"
                  name="origin"
                  icon={Plane}
                  selected={selectedOrigin}
                  suggestions={originSuggestions}
                  onChange={handleChange}
                  onSelect={selectOrigin}
                  placeholder="City or airport"
                />

                {/* Swap arrow */}
                <div className="hidden md:flex items-end pb-3.5">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                    <ArrowRight size={14} className="text-white/60" />
                  </div>
                </div>

                {/* Destination */}
                <CityInput
                  label="To"
                  name="destination"
                  icon={Plane}
                  selected={selectedDestination}
                  suggestions={destSuggestions}
                  onChange={handleChange}
                  onSelect={selectDestination}
                  placeholder="City or airport"
                />

                {/* Date */}
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-bold text-gray-100 uppercase tracking-widest mb-1.5 px-1">
                    Date
                  </label>
                  <div className="flex items-center gap-2.5 bg-white border-2 border-slate-200
                    hover:border-slate-300 focus-within:border-slate-800 focus-within:shadow-lg
                    rounded-2xl px-4 py-3 transition-all">
                    <Calendar size={15} className="text-slate-400 shrink-0" />
                    <input
                      type="date"
                      name="date"
                      value={query.date}
                      onChange={handleChange}
                      required
                      className="flex-1 text-sm font-semibold text-slate-800 focus:outline-none bg-transparent"
                    />
                  </div>
                </div>

                {/* Search button */}
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full md:w-auto h-12.5 px-8 bg-pumpkin hover:bg-pumpkin-100
                      text-gray-100 font-black text-sm rounded-2xl transition-all
                      active:scale-[0.97] shadow-lg shadow-amber-900/30 flex items-center gap-2"
                  >
                    <Search size={15} />
                    Search
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* ── Results ── */}
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-6 text-sm text-red-700">
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <div className="w-12 h-12 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
              <Plane size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-600 -rotate-45" />
            </div>
            <p className="text-sm text-slate-500 font-medium">Searching flights…</p>
          </div>
        )}

        {/* Results header */}
        {!loading && searched && (
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {flights.length > 0
                  ? `${totalCount} flight${totalCount !== 1 ? "s" : ""} found`
                  : "No flights found"}
              </h2>
              {query.originCity && query.destinationCity && (
                <p className="text-sm text-slate-500 mt-0.5">
                  {query.originCity} → {query.destinationCity} · {query.date}
                </p>
              )}
            </div>
            {flights.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Clock size={12} />
                All times local
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!loading && searched && flights.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
              <Wind size={28} className="opacity-40" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-600">No flights found</p>
              <p className="text-sm mt-1">Try different dates or cities</p>
            </div>
          </div>
        )}

        {/* Pre-search state */}
        {!loading && !searched && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
              <Plane size={28} className="opacity-30 -rotate-45" />
            </div>
            <p className="text-sm text-slate-400">Enter your route and date above to search</p>
          </div>
        )}

        {/* Flight cards */}
        {!loading && flights.length > 0 && (
          <div className="space-y-4">
            {flights.map((flight) => (
              <FlightCard
                key={flight.flightId}
                flight={flight}
                onSelect={(f) => navigate(`/booking/flights/${f.flightId}/seats`)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              disabled={query.page === 1}
              onClick={() => setQuery((p) => ({ ...p, page: p.page - 1 }))}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200
                bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={15} />
            </button>

            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setQuery((prev) => ({ ...prev, page: p }))}
                  className={`w-9 h-9 rounded-xl text-sm font-bold transition-all
                    ${query.page === p
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              disabled={query.page === totalPages}
              onClick={() => setQuery((p) => ({ ...p, page: p.page + 1 }))}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200
                bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightSearch;









// import { useState, useEffect } from "react";
// import { getFlights, searchCities } from "../../api/flight";
// import { useNavigate } from "react-router-dom";
// import { useSearchParams } from "react-router-dom";
// import { MoveRight, MoveLeft } from "lucide-react";

// // Colors for seat classes
// const classColors = {
//   First: "#FFD700",
//   Business: "#87CEEB",
//   Economy: "#90EE90",
// };

// const FlightSearch = () => {
//   const navigate = useNavigate();

//   /* ------------------ State ------------------ */

//   // const [query, setQuery] = useState({
//   //   origin: "",
//   //   destination: "",
//   //   date: "",
//   //   page: 1,
//   //   pageSize: 5,
//   // });
//   const [query, setQuery] = useState({
//     origin: "", // code
//     originCity: "", // city
//     destination: "",
//     destinationCity: "",
//     date: "",
//     page: 1,
//     pageSize: 5,
//   });

//   const [selectedOrigin, setSelectedOrigin] = useState(null);
//   const [selectedDestination, setSelectedDestination] = useState(null);

//   const [flights, setFlights] = useState([]);
//   const [totalCount, setTotalCount] = useState(0);
//   const [searchParams] = useSearchParams();

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Autocomplete
//   const [originSuggestions, setOriginSuggestions] = useState([]);
//   const [destinationSuggestions, setDestinationSuggestions] = useState([]);

//   const [tripType, setTripType] = useState("One Way");

//   /* ------------------ Handlers ------------------ */

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     if (name === "origin") {
//       setSelectedOrigin(null); // reset selection
//       fetchOriginCities(value);
//     }

//     if (name === "destination") {
//       setSelectedDestination(null);
//       fetchDestinationCities(value);
//     }

//     setQuery((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   /* ------------------ Autocomplete ------------------ */

//   const fetchOriginCities = async (value) => {
//     if (value.length < 1) {
//       setOriginSuggestions([]);
//       return;
//     }

//     try {
//       const data = await searchCities(value);
//       setOriginSuggestions(data);
//     } catch {
//       setOriginSuggestions([]);
//     }
//   };

//   const fetchDestinationCities = async (value) => {
//     if (value.length < 1) {
//       setDestinationSuggestions([]);
//       return;
//     }

//     try {
//       const data = await searchCities(value, "destination");
//       setDestinationSuggestions(data);
//     } catch {
//       setDestinationSuggestions([]);
//     }
//   };

//   const selectOrigin = (item) => {
//     setSelectedOrigin(item);

//     setQuery((prev) => ({
//       ...prev,
//       origin: item.code,
//       originCity: item.city,
//     }));

//     setOriginSuggestions([]);
//   };

//   const selectDestination = (item) => {
//     setSelectedDestination(item);

//     setQuery((prev) => ({
//       ...prev,
//       destination: item.code,
//       destinationCity: item.city,
//     }));

//     setDestinationSuggestions([]);
//   };

//   /* ------------------ Fetch Flights ------------------ */
//   useEffect(() => {
//     const origin = searchParams.get("origin");
//     const destination = searchParams.get("destination");
//     const date = searchParams.get("date");
//     const originCity = searchParams.get("originCity");
//     const destinationCity = searchParams.get("destinationCity");

//     if (origin && destination && date) {
//       const incoming = {
//         origin,
//         destination,
//         date,
//         originCity,
//         destinationCity,
//         page: 1,
//       };
//       setQuery((prev) => ({ ...prev, ...incoming }));
//       fetchFlights(incoming);
//     }
//   }, []);

//   const fetchFlights = async (overrides = {}) => {
//     const params = { ...query, ...overrides };
//     if (!params.origin || !params.destination || !params.date) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const data = await getFlights(params);
//       setFlights(Array.isArray(data?.data) ? data.data : []);
//       setTotalCount(data?.totalCount || 0);
//     } catch {
//       setError("Unable to fetch flights");
//       setFlights([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // useEffect(() => {
//   //   const origin = searchParams.get("origin");
//   //   const destination = searchParams.get("destination");
//   //   const date = searchParams.get("date");

//   //   if (origin && destination && date) {
//   //     setQuery((prev) => ({
//   //       ...prev,
//   //       origin,
//   //       destination,
//   //       date,
//   //       page: 1,
//   //     }));
//   //   }
//   // }, []);

//   // const fetchFlights = async () => {
//   //   setLoading(true);
//   //   setError(null);

//   //   try {
//   //     const data = await getFlights(query);

//   //     setFlights(Array.isArray(data?.data) ? data.data : []);
//   //     setTotalCount(data?.totalCount || 0);
//   //   } catch {
//   //     setError("Unable to fetch flights");
//   //     setFlights([]);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   /* ------------------ Search Submit ------------------ */

//   const handleSearch = (e) => {
//     e.preventDefault();

//     if (!selectedOrigin || !selectedDestination) {
//       alert("Please select valid cities from dropdown");
//       return;
//     }

//     setQuery((prev) => ({
//       ...prev,
//       page: 1,
//     }));
//   };

//   /* ------------------ Auto Fetch ------------------ */

//   useEffect(() => {
//     if (query.origin && query.destination && query.date) {
//       fetchFlights();
//     }
//   }, [query.page, query.origin, query.destination, query.date]);

//   /* ------------------ Pagination ------------------ */

//   const totalPages = Math.ceil(totalCount / query.pageSize);

//   /* ------------------ UI ------------------ */

//   return (
//     <>
//       <div className="h-max padding-x py-12 sm:py-22 max-w7xl mx-auto  relative overflow-hidden">
//         <div className="absolute -top-20 -right-20 w-100 h-100 rounded-[50%] bg-[#f8e5d959]" />
//         <div className="absolute -bottom-30 -left-15 w-87.5 h-87.5 rounded-[50%] bg-[#fd802e0d]" />

//         <div className="min-h-screen 2xl:bg-white p-6 rounded-4xl relative z-20">
//           <h1 className="text-3xl font-semibold mb-4 text-primary ">
//             Search Flights
//           </h1>
//           <div className="hero-blob-l" />

//           <div className="flex gap-4 my-4">
//             <button 
//             className={`p-2 sm:p-3 rounded-full text-sm font-semibold cursor-pointer  text-charcoal shadow-md
//               ${tripType === "One Way" ? "bg-pumpkin text-white" : "bg-zinc-200 hover:bg-zinc-300 "}`}
//             onClick={() => setTripType("One Way")}
//             >
//               One Way
//             </button>
//             <button 
//             className={`p-2 sm:p-3 rounded-full text-sm font-semibold cursor-pointer  text-charcoal shadow-md
//               ${tripType === "Rounded" ? "bg-pumpkin text-white" : "bg-zinc-200 hover:bg-zinc-300"}`}
//             onClick={() => setTripType("Rounded")}
//             >
//               Rounded
//             </button>
//             <button 
//             className={`p-2 sm:p-3 rounded-full text-sm font-semibold cursor-pointer  text-charcoal shadow-md
//               ${tripType === "Multi City" ? "bg-pumpkin text-white" : "bg-zinc-200 hover:bg-zinc-300"}`}
//             onClick={() => setTripType("Multi City")}
//             >
//               Multi City
//             </button>
//           </div>
//           {/* Form */}
//           <form
//             onSubmit={handleSearch}
//             className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 relative"
//           >
//             {/* Origin */}
//             <div className="relative">
//               <input
//                 type="text"
//                 name="origin"
//                 placeholder="Origin"
//                 value={
//                   selectedOrigin
//                     ? `${selectedOrigin.city} (${selectedOrigin.code})`
//                     : query.origin
//                 }
//                 onChange={handleChange}
//                 className="search-input"
//                 required
//               />

//               {originSuggestions.length > 0 && (
//                 <ul className="absolute z-10 bg-white  w-full mt-1 rounded shadow-md ">
//                   {originSuggestions.map((item) => (
//                     <li
//                       key={item.code}
//                       onClick={() => selectOrigin(item)}
//                       className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex justify-between"
//                     >
//                       <span>{item.city}</span>
//                       <span className="text-gray-400">{item.code}</span>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>

//             {/* Destination */}
//             <div className="relative">
//               <input
//                 type="text"
//                 name="destination"
//                 placeholder="Destination"
//                 value={
//                   selectedDestination
//                     ? `${selectedDestination.city} (${selectedDestination.code})`
//                     : query.destination
//                 }
//                 onChange={handleChange}
//                 className="search-input"
//                 required
//               />

//               {destinationSuggestions.length > 0 && (
//                 <ul className="absolute z-10 bg-white  w-full mt-1 rounded shadow-md ">
//                   {destinationSuggestions.map((item) => (
//                     <li
//                       key={item.code}
//                       onClick={() => selectDestination(item)}
//                       className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex justify-between"
//                     >
//                       <span>{item.city}</span>
//                       <span className="text-gray-400">{item.code}</span>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>

//             {/* Date */}
//             <input
//               type="date"
//               name="date"
//               value={query.date}
//               onChange={handleChange}
//               className="search-input"
//               required
//             />
//           </form>

//           {/* States */}
//           {loading && <p className="text-primary">Loading flights...</p>}

//           {error && <p className="text-red-600">{error}</p>}

//           {!loading && flights.length === 0 && !error && (
//             <p className="text-primary">No flights found</p>
//           )}

//           {/* Results */}
//           <div className="space-y-4 z-50">
//             {flights.map((flight) => (
//               <div
//                 key={flight.flightId}
//                 className="bg-white  shadow-md rounded-lg p-4 flex justify-between"
//               >
//                 <div>
//                   <p className="text-charcoal sm:text-lg font-semibold flex flex-col">
//                     <span className="text-charcoal flex items-center">
//                       Origin <MoveRight className="mx-2" />
//                       <span className="text-pumpkin">{flight.origin}</span>
//                     </span>
//                     <span className="text-charcoal flex items-center">
//                       Destination <MoveRight className="mx-2" />
//                       <span className="text-pumpkin">{flight.destination}</span>
//                     </span>
//                     {/* {flight.origin} → {flight.destination} */}
//                   </p>

//                   <p className="text-charcoal sm:text-lg">
//                     <span className="pe-2 font-semibold">Flight:</span>
//                     {flight.flightNumber}
//                   </p>

//                   <p className="text-charcoal sm:text-lg">
//                     {/* Departure: {new Date(flight.departureTime).toLocaleString()} */}
//                     <span className="pe-2 font-semibold">Departure:</span>
//                     {query.date &&
//                       new Date(flight.departureTime).toLocaleString("en-GB", {
//                         day: "2-digit",
//                         month: "short",
//                         year: "numeric",
//                         hour: "2-digit",
//                         minute: "2-digit",
//                         hour12: true,
//                       })}
//                   </p>

//                   <p className="text-charcoal sm:text-lg">
//                     {/* Arrival: {new Date(flight.arrivalTime).toLocaleString()} */}
//                     <span className="pe-2 font-semibold">Arrival:</span>
//                     {query.date &&
//                       new Date(flight.arrivalTime).toLocaleString("en-GB", {
//                         day: "2-digit",
//                         month: "short",
//                         year: "numeric",
//                         hour: "2-digit",
//                         minute: "2-digit",
//                         hour12: true,
//                       })}
//                   </p>
//                 </div>

//                 <div className="text-right">
//                   <p className="text-charcoal-100 sm:text-lg">
//                     <span className="font-semibold pe-2">Total Seats:</span>
//                     {flight.totalSeats}
//                   </p>

//                   <ul className="text-charcoal-100 sm:text-lg">
//                     <li>
//                       {" "}
//                       <span className="font-semibold pe-2">First:</span>
//                       {flight.availableSeats.First || 0}
//                     </li>
//                     <li>
//                       {" "}
//                       <span className="font-semibold pe-2">Business:</span>
//                       {flight.availableSeats.Business || 0}
//                     </li>
//                     <li>
//                       {" "}
//                       <span className="font-semibold pe-2">Economy:</span>
//                       {flight.availableSeats.Economy || 0}
//                     </li>
//                   </ul>

//                   <button
//                     onClick={() =>
//                       navigate(`/booking/flights/${flight.flightId}/seats`)
//                     }
//                     className="mt-2 bg-charcoal text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-charcoal-700 transition font-semibold"
//                   >
//                     Select Seats
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Pagination */}
//           {totalPages > 1 && (
//             <div className="flex justify-center gap-4 mt-6">
//               <button
//                 disabled={query.page === 1}
//                 onClick={() => setQuery((p) => ({ ...p, page: p.page - 1 }))}
//                 className="border px-3 py-1 rounded"
//               >
//                 Prev
//               </button>

//               <span>
//                 Page {query.page} of {totalPages}
//               </span>

//               <button
//                 disabled={query.page === totalPages}
//                 onClick={() => setQuery((p) => ({ ...p, page: p.page + 1 }))}
//                 className="border px-3 py-1 rounded"
//               >
//                 Next
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default FlightSearch;
