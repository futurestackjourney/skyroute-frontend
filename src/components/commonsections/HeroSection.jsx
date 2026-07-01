import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { Search, ArrowRight, Star } from "lucide-react";
import { searchCities } from "../../api/flight";

// ─── Constants ────────────────────────────────────────────────────────────────
const TRIP_TYPES = ["One Way", "Round Trip", "Multi City"];

const AVATAR_URLS = [
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60",
];

// ─── SVG Clip Paths (defined once, outside render) ───────────────────────────
const HeroClipDefs = () => (
  <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute", pointerEvents: "none" }}>
    <defs>
      {/* Background hero shape */}
      <clipPath id="heroShape" clipPathUnits="objectBoundingBox">
        <path d="M 0 0 H 1 V 0.5 V 1 H 0.88 C 0.79 1 0.83 0.9 0.75 0.9 H 0.25 C 0.17 0.9 0.21 1 0.13 1 H 0 M 0 0.5 V 0 V 0.5 H 0 V 1 Z" />
      </clipPath>
      {/* Review card shape */}
      <clipPath id="reviewShape" clipPathUnits="objectBoundingBox">
        <path d="M 0 0 V 1 H 0.567 Q 0.7 1 0.7 0.8 V 0.75 Q 0.7 0.55 0.833 0.55 L 0.867 0.55 Q 1 0.55 1 0.35 V 0 H 0 Z" />
      </clipPath>
      {/* Donut gradient */}
      <linearGradient id="donutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fd802e" />
        <stop offset="100%" stopColor="#233d4c" />
      </linearGradient>
      <path id="circlePath" d="M100,20 a80,80 0 1,1 0,160 a80,80 0 1,1 0,-160" />
    </defs>
  </svg>
);

// ─── Autocomplete hook ────────────────────────────────────────────────────────
const useCityAutocomplete = (cities, value) => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!value || value.length < 2) {
      setSuggestions([]);
      return;
    }
    const lower = value.toLowerCase();
    setSuggestions(cities.filter((c) => c.toLowerCase().startsWith(lower)).slice(0, 6));
  }, [value, cities]);

  return [suggestions, setSuggestions];
};

// ─── CityInput ────────────────────────────────────────────────────────────────
const CityInput = ({ label, placeholder, value, onChange, suggestions, onSelect }) => (
  <div className="bg-charcoal-100 border border-zinc-100 p-2 rounded-2xl relative">
    <h4 className="text-creame text-sm mb-1">{label}</h4>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete="off"
      className="book-input p-2 rounded-xl text-charcoal w-full"
    />
    {suggestions.length > 0 && (
      <ul
        role="listbox"
        className="absolute scrollable-element z-20 bg-white w-full left-0 rounded-xl mt-2 max-h-40 overflow-auto shadow-lg"
      >
        {suggestions.map((item) => (
          <li
            key={item.code}
            role="option"
            onClick={() => onSelect(item)}
            className="p-2 hover:bg-gray-100 cursor-pointer text-charcoal text-sm flex justify-between"
          >
            <span>{item.city}</span>
            <span className="text-gray-400">{item.code}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);


// ─── BookingForm ──────────────────────────────────────────────────────────────
const BookingForm = ({ formRef, onSearch }) => {
  const [tripType, setTripType] = useState("One Way");

  const [originInput, setOriginInput]           = useState("");
  const [destinationInput, setDestinationInput] = useState("");
  const [date, setDate]                         = useState("");

  const [selectedOrigin,      setSelectedOrigin]      = useState(null); // { city, code }
  const [selectedDestination, setSelectedDestination] = useState(null);

  const [originSuggestions,      setOriginSuggestions]      = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);

  // Fetch suggestions from the real API
  const fetchOriginSuggestions = useCallback(async (value) => {
    if (value.length < 1) { setOriginSuggestions([]); return; }
    try {
      const data = await searchCities(value);          // ← same call as FlightSearch
      setOriginSuggestions(data);
    } catch { setOriginSuggestions([]); }
  }, []);

  const fetchDestinationSuggestions = useCallback(async (value) => {
    if (value.length < 1) { setDestinationSuggestions([]); return; }
    try {
      const data = await searchCities(value, "destination");
      setDestinationSuggestions(data);
    } catch { setDestinationSuggestions([]); }
  }, []);

  const handleOriginChange = (e) => {
    setSelectedOrigin(null);          // reset on new typing
    setOriginInput(e.target.value);
    fetchOriginSuggestions(e.target.value);
  };

  const handleDestinationChange = (e) => {
    setSelectedDestination(null);
    setDestinationInput(e.target.value);
    fetchDestinationSuggestions(e.target.value);
  };

  const selectOrigin = (item) => {
    setSelectedOrigin(item);
    setOriginInput(`${item.city} (${item.code})`);
    setOriginSuggestions([]);
  };

  const selectDestination = (item) => {
    setSelectedDestination(item);
    setDestinationInput(`${item.city} (${item.code})`);
    setDestinationSuggestions([]);
  };

const handleSearch = useCallback(() => {
  if (!selectedOrigin || !selectedDestination || !date) return;
  onSearch?.({
    origin:          selectedOrigin.code,
    destination:     selectedDestination.code,
    originCity:      selectedOrigin.city,
    destinationCity: selectedDestination.city,
    date,
  });
}, [selectedOrigin, selectedDestination, date, onSearch]);

  const canSearch = selectedOrigin && selectedDestination && date;

  return (
    <div
      ref={formRef}
      className="bg-charcoal/30 rounded-4xl p-4 flex flex-col items-start justify-center shadow-lg shadow-black/50 md:w-xs 2xl:w-lg"
      style={{ willChange: "transform, opacity" }}
    >
      {/* Trip type selector */}
      <div className="flex items-center gap-2 mb-4">
        {TRIP_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setTripType(type)}
            className={`rounded-full p-2 text-charcoal text-[0.7rem] transition-colors
              ${tripType === type ? "bg-pumpkin text-white" : "bg-white hover:bg-zinc-200"}`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="flex flex-col gap-4 w-full">
        <div className="flex gap-2">
          <CityInput
            label="Leaving from"
            placeholder="Karachi, Pakistan"
            value={originInput}
            onChange={handleOriginChange}
            suggestions={originSuggestions}
            onSelect={selectOrigin}
          />
          <CityInput
            label="Going to"
            placeholder="Dubai, UAE"
            value={destinationInput}
            onChange={handleDestinationChange}
            suggestions={destinationSuggestions}
            onSelect={selectDestination}
          />
        </div>

        <div className="flex gap-2">
          <div className="bg-charcoal-100 border border-zinc-100 p-2 rounded-2xl flex-1">
            <h4 className="text-creame text-sm mb-1">Departing</h4>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="book-input p-2 rounded-xl text-charcoal w-full"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={!canSearch}
            className="bg-charcoal-100 hover:bg-charcoal-50 disabled:opacity-50 border border-zinc-100 p-2 rounded-2xl px-6 transition-colors"
            aria-label="Search flights"
          >
            <Search className="text-white size-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── ReviewCard ───────────────────────────────────────────────────────────────
const ReviewCard = ({ reviewRef, btnRef }) => (
  <div ref={reviewRef} className="relative hidden md:block md:w-sm 2xl:w-md" style={{ willChange: "transform, opacity" }}>
    <div
      className="bg-charcoal/30 rounded-4xl p-4 h-full min-h-50 min-w-50"
      style={{ clipPath: "url(#reviewShape)", WebkitClipPath: "url(#reviewShape)" }}
    >
      <h3 className="text-charcoal font-bold text-xl sm:text-2xl">1.2M+</h3>
      <p className="text-charcoal-100 text-sm sm:text-lg">Active Passengers Worldwide</p>

      <div className="flex flex-col gap-4 relative h-20">
        {/* Stacked avatars */}
        <div className="flex -space-x-4 mt-4">
          {AVATAR_URLS.map((url, i) => (
            <div
              key={i}
              className="rounded-full border-creame border-2 w-12 h-12 overflow-hidden"
              style={{ zIndex: AVATAR_URLS.length - i }}
            >
              <img src={url} alt={`Passenger ${i + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
            </div>
          ))}
        </div>

        {/* Stars */}
        <div className="flex items-center gap-1 mt-2 ms-6">
          <Star className="size-8 fill-charcoal text-charcoal" />
          <p className="text-creame font-semibold text-base">
            <span className="font-bold text-3xl text-charcoal">5</span> Stars
          </p>
        </div>
      </div>
    </div>

    <button
      ref={btnRef}
      className="px-8 py-3 bg-charcoal text-creame rounded-3xl absolute bottom-5 right-2 hover:bg-charcoal-50 transition-colors"
      aria-label="View more"
    >
      <ArrowRight className="size-8" />
    </button>
  </div>
);

// ─── DonutRing ────────────────────────────────────────────────────────────────
const DonutRing = ({ donutRef }) => (
  <div ref={donutRef} className="hidden md:block mt-4 ms-4" style={{ willChange: "transform, opacity" }}>
    <svg width="120" height="120" viewBox="-20 -20 240 240" aria-hidden="true">
      <circle cx="100" cy="100" r="80" stroke="url(#donutGrad)" strokeWidth="60" fill="none" />
      <text fill="white" fontSize="24" fontWeight="700" letterSpacing="5" dominantBaseline="middle">
        <textPath href="#circlePath" startOffset="5%">COMFORT</textPath>
        <textPath href="#circlePath" startOffset="40%">ENCE FEE</textPath>
        <textPath href="#circlePath" startOffset="75%">EXPERT</textPath>
      </text>
    </svg>
  </div>
);

// ─── HeroSection (main) ───────────────────────────────────────────────────────
const HeroSection = ({ cities = [], onSearch }) => {
  const navigate = useNavigate();

  // Refs
  const containerRef  = useRef(null);
  const bgRef         = useRef(null);
  const planeRef      = useRef(null);
  const titleRef      = useRef(null);
  const textRef       = useRef(null);
  const leftFormRef   = useRef(null);
  const rightFormRef  = useRef(null);
  const btnRef        = useRef(null);
  const donutRef      = useRef(null);

  const handleSearch = useCallback(
    (params) => {
      if (onSearch) {
        onSearch(params);
      } else {
       navigate(`/search?origin=${params.origin}&destination=${params.destination}&date=${params.date}&originCity=${params.originCity}&destinationCity=${params.destinationCity}`);
      }
    },
    [onSearch, navigate]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // ── Master timeline — runs once on mount ──────────────────────────────
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // 1. Background fades in
      tl.from(bgRef.current, { opacity: 0, duration: 1 })

      // 2. Title: clip-path text wipe
        .from(titleRef.current, {
          clipPath: "inset(0 100% 0 0)",
          opacity: 0,
          duration: 1.1,
          ease: "power4.out",
        }, "-=0.4")

      // 3. Plane flies in from right
        .from(planeRef.current, {
          y: 200,
          opacity: 0,
          duration: 1.2,
          ease: "power2.out",
        }, "-=0.8")

      // 4. Left text block
        .from(textRef.current, {
          y: 40,
          opacity: 0,
          duration: 0.7,
        }, "-=0.6")

      // 5. Booking form rises
        .from(leftFormRef.current, {
          y: 50,
          opacity: 0,
          duration: 0.7,
        }, "-=0.4")

      // 6. Right card + donut slide in from right
        .from([rightFormRef.current, donutRef.current], {
          x: 60,
          opacity: 0,
          duration: 0.7,
          stagger: 0.15,
        }, "-=0.5");

      // ── Plane idle float loop ─────────────────────────────────────────────
      // gsap.to(planeRef.current, {
      //   y: -14,
      //   duration: 2.8,
      //   ease: "sine.inOut",
      //   yoyo: true,
      //   repeat: -1,
      // });

      // ── Donut slow spin ───────────────────────────────────────────────────
      gsap.to(donutRef.current, {
        rotation: 360,
        duration: 18,
        ease: "none",
        repeat: -1,
        transformOrigin: "50% 50%",
      });

      // ── Arrow button pulse ────────────────────────────────────────────────
      gsap.to(btnRef.current, {
        scale: 1.08,
        duration: 1,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="max-w-full mx-auto h-[150vh] md:h-[110vh] relative">
      {/* All clip-paths & gradients defined once */}
      <HeroClipDefs />

      {/* ── Clipped background ─────────────────────────────────────────────── */}
      <div
        ref={bgRef}
        className="bg-[url(https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg)] bg-cover bg-center bg-no-repeat bg-fixed h-full flex items-center justify-center relative"
        style={{
          clipPath: "url(#heroShape)",
          WebkitClipPath: "url(#heroShape)",
          willChange: "opacity",
        }}
      >
        {/* Plane */}
        <img
          ref={planeRef}
          src="/images/aircraft.png"
          className="z-0 md:z-10 absolute w-md md:w-lg 2xl:w-4xl pointer-events-none"
          alt="Aircraft"
          draggable={false}
          style={{ willChange: "transform" }}
        />

        {/* Hero title */}
        <div className="max-w-3xl text-center absolute top-30 px-4">
          <h1
            ref={titleRef}
            className="text-6xl md:text-7xl 2xl:text-9xl font-bold uppercase masked-text leading-tight"
          >
            Fly in Style,<br />Arrive in Comfort
          </h1>
        </div>

        {/* Bottom overlay row */}
        <div className="w-full padding-x">

          {/* ── Left: text + booking form ───────────────────────────────────── */}
          <div className="absolute bottom-24 md:bottom-18 2xl:bottom-25 left-10 max-w-sm">
            <div ref={textRef} className="mb-4 w-xs" style={{ willChange: "transform, opacity" }}>
              <h2 className="text-charcoal text-2xl sm:text-3xl font-bold tracking-tighter">
                Plan your trip
              </h2>
              <p className="text-charcoal-100 text-sm xl:text-base mt-1 mb-2">
                Discover the world with SkyRoute — your trusted partner for
                seamless travel experiences.
              </p>
            </div>

            <BookingForm
              formRef={leftFormRef}
              cities={cities}
              onSearch={handleSearch}
            />
          </div>

          {/* ── Right: review card + donut ──────────────────────────────────── */}
          <div className="absolute bottom-5 right-10">
            <div className="flex flex-col justify-end items-end">
              <ReviewCard reviewRef={rightFormRef} btnRef={btnRef} />
              <DonutRing donutRef={donutRef} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HeroSection;