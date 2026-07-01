import { useState, useEffect } from "react";
import { getFlights, searchCities } from "./../../api/flight";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { MoveRight, MoveLeft } from "lucide-react";

// Colors for seat classes
const classColors = {
  First: "#FFD700",
  Business: "#87CEEB",
  Economy: "#90EE90",
};

const CreateBooking = () => {
      const navigate = useNavigate();
    
      /* ------------------ State ------------------ */
    
      const [query, setQuery] = useState({
        origin: "",
        destination: "",
        date: "",
        page: 1,
        pageSize: 5,
      });
    
      const [flights, setFlights] = useState([]);
      const [totalCount, setTotalCount] = useState(0);
      const [searchParams] = useSearchParams();
    
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);
    
      // Autocomplete
      const [originSuggestions, setOriginSuggestions] = useState([]);
      const [destinationSuggestions, setDestinationSuggestions] = useState([]);
    
      /* ------------------ Handlers ------------------ */
    
      const handleChange = (e) => {
        const { name, value } = e.target;
    
        setQuery((prev) => ({
          ...prev,
          [name]: value,
        }));
    
        if (name === "origin") fetchOriginCities(value);
        if (name === "destination") fetchDestinationCities(value);
      };
    
      /* ------------------ Autocomplete ------------------ */
    
      const fetchOriginCities = async (value) => {
        if (value.length < 1) {
          setOriginSuggestions([]);
          return;
        }
    
        try {
          const data = await searchCities(value, "origin");
          setOriginSuggestions(data);
        } catch {
          setOriginSuggestions([]);
        }
      };
    
      const fetchDestinationCities = async (value) => {
        if (value.length < 1) {
          setDestinationSuggestions([]);
          return;
        }
    
        try {
          const data = await searchCities(value, "destination");
          setDestinationSuggestions(data);
        } catch {
          setDestinationSuggestions([]);
        }
      };
    
      const selectOrigin = (city) => {
        setQuery((prev) => ({
          ...prev,
          origin: city,
        }));
    
        setOriginSuggestions([]);
      };
    
      const selectDestination = (city) => {
        setQuery((prev) => ({
          ...prev,
          destination: city,
        }));
    
        setDestinationSuggestions([]);
      };
    
      /* ------------------ Fetch Flights ------------------ */
    
      useEffect(() => {
        const origin = searchParams.get("origin");
        const destination = searchParams.get("destination");
        const date = searchParams.get("date");
    
        if (origin && destination && date) {
          setQuery((prev) => ({
            ...prev,
            origin,
            destination,
            date,
            page: 1,
          }));
        }
      }, []);
    
      const fetchFlights = async () => {
        setLoading(true);
        setError(null);
    
        try {
          const data = await getFlights(query);
    
          setFlights(Array.isArray(data?.data) ? data.data : []);
          setTotalCount(data?.totalCount || 0);
        } catch {
          setError("Unable to fetch flights");
          setFlights([]);
        } finally {
          setLoading(false);
        }
      };
    
      /* ------------------ Search Submit ------------------ */
    
      const handleSearch = (e) => {
        e.preventDefault();
    
        setQuery((prev) => ({
          ...prev,
          page: 1,
        }));
      };
    
      /* ------------------ Auto Fetch ------------------ */
    
      useEffect(() => {
        if (query.origin && query.destination && query.date) {
          fetchFlights();
        }
      }, [query.page, query.origin, query.destination, query.date]);
    
      /* ------------------ Pagination ------------------ */
    
      const totalPages = Math.ceil(totalCount / query.pageSize);
    
      /* ------------------ UI ------------------ */
  return (
    <>
       <div className="px-4 sm:px-6  max-w-7xl mx-auto ">
        <div className="min-h-screen 2xl:bg-white p-6 rounded-4xl">
          <h1 className="text-3xl font-semibold mb-4 text-primary ">
            Search Flights
          </h1>

          <div className="flex gap-4 my-2">
            <button className="bg-pumpkin text-white p-2 sm:p-3 rounded-full text-sm font-semibold hover:bg-pumpkin-100 cursor-pointer">
              One Way
            </button>
            <button className="bg-pumpkin text-white p-2 sm:p-3 rounded-full text-sm font-semibold hover:bg-pumpkin-100 cursor-pointer">
              Rounded
            </button>
            <button className="bg-pumpkin text-white p-2 sm:p-3 rounded-full text-sm font-semibold hover:bg-pumpkin-100 cursor-pointer">
              Multi City
            </button>
          </div>
          {/* Form */}
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 relative"
          >
            {/* Origin */}
            <div className="relative">
              <input
                type="text"
                name="origin"
                placeholder="Origin"
                value={query.origin}
                onChange={handleChange}
                className="search-input "
                required
              />

              {originSuggestions.length > 0 && (
                <ul className="absolute z-10 bg-white  w-full mt-1 rounded shadow-md ">
                  {originSuggestions.map((c) => (
                    <li
                      key={c}
                      onClick={() => selectOrigin(c)}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Destination */}
            <div className="relative">
              <input
                type="text"
                name="destination"
                placeholder="Destination"
                value={query.destination}
                onChange={handleChange}
                className="search-input"
                required
              />

              {destinationSuggestions.length > 0 && (
                <ul className="absolute z-10 bg-white  w-full mt-1 rounded shadow-md ">
                  {destinationSuggestions.map((c) => (
                    <li
                      key={c}
                      onClick={() => selectDestination(c)}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Date */}
            <input
              type="date"
              name="date"
              value={query.date}
              onChange={handleChange}
              className="search-input"
              required
            />
          </form>

          {/* States */}
          {loading && <p className="text-primary">Loading flights...</p>}

          {error && <p className="text-red-600">{error}</p>}

          {!loading && flights.length === 0 && !error && (
            <p className="text-primary">No flights found</p>
          )}

          {/* Results */}
          <div className="space-y-4">
            {flights.map((flight) => (
              <div
                key={flight.flightId}
                className="bg-white  shadow-md rounded-lg p-4 flex justify-between"
              >
                <div>
                  <p className="text-charcoal sm:text-lg font-semibold flex flex-col">
                    <span className="text-charcoal flex items-center">
                      Origin <MoveRight className="mx-2"/>
                      <span className="text-pumpkin">{flight.origin}</span>
                    </span>
                    <span className="text-charcoal flex items-center">
                      Destination <MoveRight className="mx-2"/>
                      <span className="text-pumpkin">{flight.destination}</span>
                    </span>
                    {/* {flight.origin} → {flight.destination} */}
                  </p>

                  <p className="text-charcoal sm:text-lg">
                    <span className="pe-2 font-semibold">Flight:</span>
                    {flight.flightNumber}
                  </p>

                  <p className="text-charcoal sm:text-lg">
                    {/* Departure: {new Date(flight.departureTime).toLocaleString()} */}
                    <span className="pe-2 font-semibold">Departure:</span>
                    {query.date &&
                      new Date(flight.departureTime).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                  </p>

                  <p className="text-charcoal sm:text-lg">
                    {/* Arrival: {new Date(flight.arrivalTime).toLocaleString()} */}
                    <span className="pe-2 font-semibold">Arrival:</span>
                    {query.date &&
                      new Date(flight.arrivalTime).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-charcoal-100 sm:text-lg">
                    <span className="font-semibold pe-2">Total Seats:</span>
                    {flight.totalSeats}
                  </p>

                  <ul className="text-charcoal-100 sm:text-lg">
                    <li> <span className="font-semibold pe-2">First:</span>{flight.availableSeats.First || 0}</li>
                    <li> <span className="font-semibold pe-2">Business:</span>{flight.availableSeats.Business || 0}</li>
                    <li> <span className="font-semibold pe-2">Economy:</span>{flight.availableSeats.Economy || 0}</li>
                  </ul>

                  <button
                    onClick={() =>
                      navigate(`/flights/${flight.flightId}/seats`)
                    }
                    className="mt-2 bg-charcoal text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-charcoal-700 transition font-semibold"
                  >
                    Select Seats
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-6">
              <button
                disabled={query.page === 1}
                onClick={() => setQuery((p) => ({ ...p, page: p.page - 1 }))}
                className="border px-3 py-1 rounded"
              >
                Prev
              </button>

              <span>
                Page {query.page} of {totalPages}
              </span>

              <button
                disabled={query.page === totalPages}
                onClick={() => setQuery((p) => ({ ...p, page: p.page + 1 }))}
                className="border px-3 py-1 rounded"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default CreateBooking
