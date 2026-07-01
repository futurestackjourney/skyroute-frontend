import { Link, Outlet } from "react-router-dom";
import { useState, useRef, useEffect, useContext } from "react";
import LogoutButton from "../components/ui/LogoutButton";
import { AuthContext } from "../context/AuthContext";

import {
  Plane,
  LayoutGrid,
  ChartColumnDecreasing,
  Settings,
  TicketsPlane,
  ArrowDown,
  Plus,
  Minus,
  Pencil,
  Trash,
  FilePlusCorner,
  ArrowRightLeft,
  PanelLeftOpen,
  PanelLeftClose,
  ArrowLeft,
  User,
  Bell,
  FileExclamationPoint,
  UserRound,
  CalendarCheck,
  Info,
  Mail,
  Hotel,
  List,
  BadgePercent,
} from "lucide-react";

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [aircraftOpen, setAircraftOpen] = useState(false);
  const [flightsOpen, setFlightsOpen] = useState(false);
  const [hotelsOpen, setHotelsOpen] = useState(false);
  const [dashboard, setDashboard] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <>
      <div className="relative min-h-screen flex bg-[#f1f1f1]">
        {/* Sidebar */}
        <aside
          className={`h-screen sticky  top-0 left-0 shadow-sm overflow-hidden z-10 bg-[#f1f1f1] text-charcoal font-semibold font-lg transition-all duration-300 text-sm 
        ${collapsed ? "w-20" : "w-64"}`}
        >

          <div className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full overflow-hidden object-fill">
                {user.image ? (
                  <img
                    src={user.image}
                    alt="profile"
                    className="h-full w-full"
                  />
                ) : (
                  <div className="h-full w-full bg-[#d9d9d9]"></div>
                )}
              </div>
              <div className="">
                {!collapsed && <h3>{user.fullName}</h3>}
                {!collapsed && (
                  <p className="text-charcoal-100 text-sm">{user.email}</p>
                )}
              </div>
            </div>
          </div>
          <div className="p-4 flex justify-between items-center">
            {!collapsed && <img src="/images/logo.png" width={80} alt="" />}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`text-pumpkin-50 transition ${collapsed ? "rotate-180" : "rotate-0"}`}
            >
              <ArrowLeft />
            </button>
          </div>

          <nav className="px-2 space-y-2">
            <Link
              to=""
              className="flex gap-2 p-2 rounded hover:bg-charcoal-100 hover:text-creame"
            >
              <LayoutGrid className="text-pumpkin" /> {!collapsed && "Home"}
            </Link>
            
            <Link
              to="users"
              className="flex gap-2 p-2 rounded hover:bg-charcoal-100 hover:text-creame"
            >
              <UserRound className="text-pumpkin" /> {!collapsed && "Users"}
            </Link>
            
            {/* Flights Dropdown */}
            <div>
              {/* Main Button */}
              <button
                onClick={() => setFlightsOpen(!flightsOpen)}
                className="flex items-center justify-between w-full gap-2 p-2 rounded hover:bg-charcoal-100 hover:text-creame"
              >
                <Link to="flights" className="flex items-center gap-2">
                  <TicketsPlane className="text-pumpkin" />
                  {!collapsed && "Flights"}
                </Link>

                {/* Arrow */}
                {!collapsed && (
                  <span
                    className={`transition-transform duration-200 ease-in-out ${
                      flightsOpen ? "rotate-180" : ""
                    }`}
                  >
                    {flightsOpen ? (
                      <Minus className="size-5" />
                    ) : (
                      <Plus className="size-5" />
                    )}
                  </span>
                )}
              </button>

              {/* Dropdown Items */}
              <div
                className={`
                            overflow-hidden transition-all duration-300 ease-in-out
                            ${flightsOpen && !collapsed ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}
                          `}
              >
                <div className="bg-white rounded mt-1">
                  <Link
                    to="createflight"
                    className="flex gap-2 p-2 rounded hover:bg-charcoal-100 hover:text-creame text-sm"
                  >
                    <FilePlusCorner className="size-4" /> Create Flight
                  </Link>

                  <Link
                    to="flights"
                    className="flex gap-2 p-2 rounded hover:bg-charcoal-100 hover:text-creame text-sm"
                  >
                    <Pencil className="size-4" /> Edit Flight
                  </Link>

                  <Link
                    to="flights/delete"
                    className="flex gap-2 p-2 rounded hover:bg-charcoal-100 hover:text-creame text-sm"
                  >
                    <Trash className="size-4" /> Delete Flight
                  </Link>
                </div>
              </div>
            </div>

            {/* Aircraft Dropdown */}
            <div>
              {/* Main Button */}
              <button
                onClick={() => setAircraftOpen(!aircraftOpen)}
                className="flex items-center justify-between w-full gap-2 p-2 rounded hover:bg-charcoal-100 hover:text-creame"
              >
                <Link to="aircraft" className="flex items-center gap-2">
                  <Plane className="text-pumpkin" />
                  {!collapsed && "Aircraft"}
                </Link>

                {/* Arrow */}
                {!collapsed && (
                  <span
                    className={`transition-transform ease-linear ${
                      aircraftOpen ? "rotate-180" : ""
                    }`}
                  >
                    {aircraftOpen ? (
                      <Minus className="size-5" />
                    ) : (
                      <Plus className="size-5" />
                    )}
                  </span>
                )}
              </button>

              {/* Dropdown Items */}
              <div
                className={`
                            overflow-hidden transition-all duration-300 ease-in-out
                            ${aircraftOpen && !collapsed ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}
                          `}
              >
                <div className="bg-white rounded mt-1">
                  <Link
                    to="aircrafts/create"
                    className="flex gap-2 p-2 rounded hover:bg-charcoal-100 hover:text-creame text-sm"
                  >
                    <FilePlusCorner className="size-4" /> Create Aircraft
                  </Link>

                  <Link
                    to="aircrafts/:id/edit"
                    className="flex gap-2 p-2 rounded hover:bg-charcoal-100 hover:text-creame text-sm"
                  >
                    <Pencil className="size-4" /> Edit Aircraft
                  </Link>

                  <Link
                    to="aircrafts/delete"
                    className="flex gap-2 p-2 rounded hover:bg-charcoal-100 hover:text-creame text-sm"
                  >
                    <Trash className="size-4" /> Delete Aircraft
                  </Link>
                </div>
              </div>
            </div>

            {/* Hotels Booking */}
            <div>
              {/* Main Button */}
              <button
                onClick={() => setHotelsOpen(!hotelsOpen)}
                className="flex items-center justify-between w-full gap-2 p-2 rounded hover:bg-charcoal-100 hover:text-creame"
              >
                <Link to="hotels" className="flex items-center gap-2">
                  <Hotel className="text-pumpkin" />
                  {!collapsed && "Hotels"}
                </Link>

                {/* Arrow */}
                {!collapsed && (
                  <span
                    className={`transition-transform ease-linear ${
                      hotelsOpen ? "rotate-180" : ""
                    }`}
                  >
                    {hotelsOpen ? (
                      <Minus className="size-5" />
                    ) : (
                      <Plus className="size-5" />
                    )}
                  </span>
                )}
              </button>
              {/* Dropdown Items */}
              <div
                className={`
                            overflow-hidden transition-all duration-300 ease-in-out
                            ${hotelsOpen && !collapsed ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}
                          `}
              >
                <div className="bg-white rounded mt-1">
                  <Link
                    to="hotelsbooking"
                    className="flex gap-2 p-2 rounded hover:bg-charcoal-100 hover:text-creame text-sm"
                  >
                    <List className="size-4" /> Hotels Booking
                  </Link>
                </div>
              </div>
            </div>

            <Link
              to="bookings"
              className="flex gap-2 p-2 rounded hover:bg-charcoal-100 hover:text-creame"
            >
              <CalendarCheck className="text-pumpkin" />{" "}
              {!collapsed && "Bookings"}
            </Link>

            <Link
              to="complaints"
              className="flex gap-2 p-2 rounded hover:bg-charcoal-100 hover:text-creame"
            >
              <FileExclamationPoint className="text-pumpkin" />{" "}
              {!collapsed && "Complaints"}
            </Link>

            <Link
              to="deals"
              className="flex gap-2 p-2 rounded hover:bg-charcoal-100 hover:text-creame"
            >
              <BadgePercent className="text-pumpkin" />{" "}
              {!collapsed && "Deals"}
            </Link>

            <div className="bg-[#f1f1f1] z-20 absolute bottom-0 py-4 w-full border-t border-[#d9d9d9]">
              <Link
                to="help"
                className="flex gap-2 p-2 rounded hover:bg-charcoal-100 hover:text-creame transition"
              >
                <Info className="text-pumpkin " /> {!collapsed && "Help"}
              </Link>
              <Link
                to="settings"
                className="flex gap-2 p-2 rounded hover:bg-charcoal-100 hover:text-creame transition"
              >
                <Settings className="text-pumpkin " />{" "}
                {!collapsed && "Settings"}
              </Link>
            </div>
          </nav>
        </aside>
        <div className="min-h-screen flex-1 flex flex-col w-full">
          <header>
            {/* Top Navbar */}
            <div className="bg-charcoal-50 text-creame p-4 md:pe-10 flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold">Dashboard</h1>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <button className="flex items-center gap-2 text-sm text-creame">
                    Notification
                    <Bell />
                  </button>
                </div>
                <div>
                  <button className="flex items-center gap-2 text-xl text-creame">
                    <Mail />
                  </button>
                </div>
                <div className="text-creame">
                  <button
                    onClick={() => setIsProfileOpen((prev) => !prev)}
                    className="profile-icon text-xl text-creame"
                  >
                    <User />
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="profile-links absolute top-17 right-1 w-52 p-4 bg-charcoal-50 shadow-sm backdrop-blur-md rounded-md  space-y-2 flex flex-col z-50">
                      <Link
                        className="dashboard-link"
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Profile
                      </Link>

                      <Link
                        className="dashboard-link"
                        to="/complaint"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Complaint
                      </Link>

                      <Link
                        className="dashboard-link"
                        to="/my-bookings"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        My Bookings
                      </Link>

                      <LogoutButton onClick={() => setIsProfileOpen(false)} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Dynamic Content */}
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
