import { useEffect, useState } from "react";
import api from "../../api/api";
import {
  getAllHotels,
  getHotelsByCity,
  getHotelsByCountry,
  createHotel,
  updateHotel,
} from "../../api/adminHotels";
import { showError, showSuccess } from "../../utils/toast";
import { parseApiError } from "../../utils/apiError";
import HotelsModal from "../../components/modals/adminmodals/hotelmodal/HotelsModal";
import { ChevronsUpDown, Plus } from "lucide-react";

const AdminHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeController, setActiveController] = useState(null);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("city");

  // SEARCH FILTER
  const [searchQuery, setSearchQuery] = useState("");
  const filteredHotels = hotels.filter(
    (hotel) =>
      hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.country.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const [selectedHotel, setSelectedHotel] = useState(null);

  const initialForm = {
    name: "",
    description: "",
    country: "",
    city: "",
    address: "",
    hotelTag: "",
    rating: 0,
    amenities: [""],
    rooms: [
      {
        roomType: "",
        capacity: "",
        pricePerNight: "",
        totalRooms: "",
      },
    ],
  };
  const [form, setForm] = useState(initialForm, {
    name: "",
    description: "",
    country: "",
    city: "",
    address: "",
    hotelTag: "",
    rating: 0,
    amenities: [""],
    rooms: [
      {
        roomType: "",
        capacity: "",
        pricePerNight: "",
        totalRooms: "",
      },
    ],
  });

  const IMAGE_BASE_URL = "https://localhost:7042";

  // ================= FETCH =================
  const fetchHotels = async () => {
    try {
      setLoading(true);
      const data = await getAllHotels();
      setHotels(data);
    } catch (err) {
      showError("Failed to load hotels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  // ================= SEARCH =================
  const handleSearch = async () => {
    try {
      setLoading(true);
      let data;

      if (type === "city") {
        data = await getHotelsByCity(search);
      } else {
        data = await getHotelsByCountry(search);
      }

      setHotels(data);
    } catch (err) {
      showError("Search failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= FORM HANDLERS =================
  const buildHotelFormData = (form) => {
    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("country", form.country);
    formData.append("city", form.city);
    formData.append("address", form.address);
    formData.append("hotelTag", form.hotelTag);
    formData.append("rating", form.rating);

    if (form.imageUrl instanceof File) {
      formData.append("imageUrl", form.imageUrl);
    }

    form.rooms.forEach((room, index) => {
      formData.append(`rooms[${index}].roomId`, room.roomId);

      formData.append(`rooms[${index}].roomType`, room.roomType);

      formData.append(`rooms[${index}].capacity`, room.capacity);

      formData.append(`rooms[${index}].pricePerNight`, room.pricePerNight);

      formData.append(`rooms[${index}].totalRooms`, room.totalRooms);
    });
    
    form.amenities.forEach((amenity, index) => {
      formData.append(`amenities[${index}]`, amenity);
    });

    return formData;
  };

  // ================= CREATE =================
  const handleCreate = async () => {
    try {
      const formData = buildHotelFormData(form);

      const res = await createHotel(formData);

      showSuccess("Hotel created");

      setHotels((prev) => [...prev, res]);

      setForm(initialForm);

      setShowCreate(false);
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  // ================= EDIT =================
  const handleUpdate = async () => {
    try {
      const formData = buildHotelFormData(form);

      const res = await updateHotel(selectedHotel.id, formData);

      showSuccess("Updated successfully");

      setHotels((prev) =>
        prev.map((h) => (h.id === selectedHotel.id ? res : h)),
      );

      setForm(initialForm);

      setShowEdit(false);
    } catch (err) {
      showError(parseApiError(err));
    }
  };

  const openEdit = (hotel) => {
    setSelectedHotel(hotel);
    setForm(hotel);
    setShowEdit(true);
  };

  // ======= TEXT SHRINK =======
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
  // ================= UI =================
  return (
    <>
      <div className="px-4 sm:px-6 py-4 mx-auto w-full relative">
        <div className="mb-3">
          <h1 className="text-3xl font-semibold mb-1 text-charcoal ">
            Hotel Management
          </h1>
          <p className="text-charcoal-100 mb-4">View and manage all hotels.</p>
          <input
            className="input-search mb-6 "
            // value={search}
            // onChange={(e) => setSearch(e.target.value)}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
            placeholder="Search hotels..."
          />
          {/* <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border p-2"
          >
            <option value="city">City</option>
            <option value="country">Country</option>
          </select>
          <button onClick={handleSearch} className="bg-black text-white px-4">
            Search
          </button> */}
        </div>
        <div className="relative flex flex-col w-full h-full text-slate-700 bg-[#f1f1f1] shadow-md rounded-xl bg-clip-border">
          <div className="relative mx-4 mt-4 overflow-hidden text-slate-700 bg-[#f1f1f1] rounded-none bg-clip-border">
            {/* ===== Add Buttons ===== */}
            <div className="flex items-center justify-between ">
              <div>
                <h3 className="text-lg font-semibold ">Total</h3>
                <p className="text-charcoal-100">
                  Review each aircraft before edit
                </p>
              </div>
              <div className="flex flex-col gap-2 shrink-0 sm:flex-row px-4">
                {/* <select
                  className="gap-2 rounded bg-charcoal py-2.5 px-4 text-xs font-semibold text-white shadow-md transition-all hover:shadow-lg hover:bg-charcoal-100"
                >
                  <option value="">All</option>
                  <option value="Today Booked">Today Booked</option>
                  <option value="Checked IN">Checked IN</option>
                  <option value="Check Out">Check Out</option>
                </select> */}

                <button
                  onClick={() => {
                    setForm(initialForm);
                    setShowCreate(true);
                  }}
                  className="flex select-none items-center gap-2 rounded bg-charcoal py-2.5 px-4 text-xs font-semibold text-white shadow-md transition-all hover:shadow-lg hover:bg-charcoal-100 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                  type="button"
                >
                  <Plus size={14} />
                  Add Hotel
                </button>
              </div>
            </div>

            {/* ====== TABLE ===== */}
            <div className="p-0 overflow-scroll">
              <table className="w-full mt-4 text-left table-auto min-w-max">
                <thead>
                  <tr>
                    <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
                      <p className="flex items-center justify-between gap-2 font-sans text-sm font-normal leading-none text-slate-500">
                        Hotel Name
                        <ChevronsUpDown className="size-4" />
                      </p>
                    </th>
                    <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
                      <p className="flex items-center justify-between gap-2 font-sans text-sm font-normal leading-none text-slate-500">
                        Location
                        <ChevronsUpDown className="size-4" />
                      </p>
                    </th>
                    <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
                      <p className="flex items-center justify-between gap-2 font-sans text-sm  font-normal leading-none text-slate-500">
                        Rooms
                        <ChevronsUpDown className="size-4" />
                      </p>
                    </th>
                    <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
                      <p className="flex items-center justify-between gap-2 font-sans text-sm  font-normal leading-none text-slate-500">
                        Available Today
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
                  {filteredHotels.map((h) => (
                    <tr key={h.id}>
                      <td className="p-4 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <div>
                              <img
                                src={`${IMAGE_BASE_URL}${h.imageUrl}`}
                                alt={h.name}
                                className="text-[.6rem] w-16 h-16 object-cover rounded"
                              />
                            </div>
                            <p className="text-sm font-semibold text-slate-700">
                              {h.name}
                            </p>
                            <p className="text-sm text-slate-500">
                              {h.description
                                ? shrinkText(h.description, 25)
                                : "No description"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 border-b border-slate-200">
                        <p className="text-sm text-slate-500">{h.address}</p>
                        <p className="text-sm text-slate-500">
                          {h.city}, {h.country}
                        </p>
                      </td>
                      <td className="p-4 border-b border-slate-200">
                        <p className="text-sm text-slate-500">
                          {/* {h.rooms.length} room types
                          {h.rooms
                            .map((r) => `${r.roomType} (${r.pricePerNight}$)`)
                            .join(", ")} */}
                          {h.rooms?.map((r, index) => (
                            <span
                              className="flex flex-col text-sm text-slate-500"
                              key={index}
                            >
                              <span className="text-slate-500">
                                Type: {r.roomType}
                              </span>
                              <span className="text-slate-500">
                                PPN: USD {r.pricePerNight}
                              </span>
                              {/* <span className="text-slate-500">
                                Cap: {r.capacity}
                              </span>
                              <span className="text-slate-500">
                                Total: {r.totalRooms}
                              </span> */}
                            </span>
                          ))}
                          {/* {h.rooms.map(
                                (r) => `${r.roomType} (${r.pricePerNight}$)`,
                            ) } */}
                        </p>
                      </td>
                      <td className="p-4 border-b border-slate-200">
                        <p className="text-sm text-slate-800">
                          {formatDate(h.createdDate)}
                          {/* {new Date(c.createdDate).toLocaleDateString()} */}
                        </p>
                        <p className="text-sm text-slate-500">
                          {formatTime(h.createdDate)}
                        </p>
                      </td>
                      <td className="relative p-4 border-b border-slate-200 ">
                        <div onClick={(e) => e.stopPropagation()}>
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveController(
                                activeController === h.id ? null : h.id,
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
                            {activeController === h.id && (
                              <div className="absolute p-3 bottom-2 right-5 bg-white rounded-lg space-y-2 w-max text-[12px]">
                                <button
                                  onClick={() => openEdit(h)}
                                  // onClick={() => setSelected(h)}
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
        </div>

        {/* CREATE MODAL */}
        {showCreate && (
          <HotelsModal
            title="Create Hotel"
            form={form}
            setForm={setForm}
            onClose={() => setShowCreate(false)}
            onSubmit={handleCreate}
          />
        )}

        {/* EDIT MODAL */}
        {showEdit && (
          <HotelsModal
            title="Edit Hotel"
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

export default AdminHotels;
