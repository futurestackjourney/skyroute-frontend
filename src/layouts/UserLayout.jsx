import { Link, Outlet, useLocation } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  Plane, LayoutGrid, Settings, TicketsPlane, MessageSquareWarning,
  BadgePercent, Hotel, Bell, Mail, Info, ChevronLeft, ChevronRight,
  LogOut, ChevronDown,
} from "lucide-react";

// ─── Nav config ───────────────────────────────────────────────────────────────
const NAV = [
  {
    id: "home",
    label: "Dashboard",
    icon: LayoutGrid,
    to: "",
    exact: true,
  },
  {
    id: "bookings",
    label: "My Bookings",
    icon: TicketsPlane,
    to: "my-bookings",
    children: [
      { label: "All Bookings",   to: "my-bookings"    },
      { label: "Book a Flight",  to: "booking/create" },
      { label: "Cancel Booking", to: "booking/delete" },
    ],
  },
  {
    id: "complaints",
    label: "Complaints",
    icon: MessageSquareWarning,
    to: "complaints",
    children: [
      { label: "Raise Complaint", to: "complaints/create" },
      { label: "Track Complaint", to: "complaints/track"  },
    ],
  },
  { id: "hotel", label: "Hotel Booking", icon: Hotel,        to: "hotel"      },
  { id: "promo", label: "Promotions",    icon: BadgePercent, to: "promotions" },
];

const BOTTOM_NAV = [
  { id: "help",     label: "Help & Support", icon: Info,     to: "help"     },
  { id: "settings", label: "Settings",       icon: Settings, to: "settings" },
];

// ─── Single nav item ──────────────────────────────────────────────────────────
const NavItem = ({ item, collapsed, location }) => {
  const [open, setOpen] = useState(false);

  const isActive = item.exact
    ? location.pathname.endsWith("/profile") || location.pathname.endsWith("/profile/")
    : item.to !== "" && location.pathname.includes(item.to);

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
            transition-all duration-150 group
            ${isActive ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-white"}`}
        >
          <item.icon
            size={18}
            className={isActive ? "text-amber-400" : "text-slate-500 group-hover:text-amber-400 transition-colors"}
          />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              />
            </>
          )}
        </button>

        {!collapsed && (
          <div className={`overflow-hidden transition-all duration-200 ease-in-out ${open ? "max-h-40 mt-1" : "max-h-0"}`}>
            <div className="ml-7 pl-3 border-l border-slate-700/60 space-y-0.5 py-1">
              {item.children.map((child) => (
                <Link
                  key={child.to}
                  to={child.to}
                  className="block px-3 py-2 rounded-lg text-xs font-medium text-slate-400
                    hover:bg-slate-800 hover:text-white transition-colors"
                >
                  {child.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={item.to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
        transition-all duration-150 group
        ${isActive ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-white"}`}
    >
      <item.icon
        size={18}
        className={isActive ? "text-amber-400" : "text-slate-500 group-hover:text-amber-400 transition-colors"}
      />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
};

// ─── Layout ───────────────────────────────────────────────────────────────────
const UserLayout = () => {
  const [collapsed,  setCollapsed]  = useState(false);
  const [notifOpen,  setNotifOpen]  = useState(false);
  const location                    = useLocation();
  const { user, logout }            = useContext(AuthContext);

  const initials = user?.fullName
    ?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "U";

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen flex bg-slate-950">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className={`sticky top-0 h-screen flex flex-col bg-slate-900 border-r border-slate-800
          transition-all duration-300 ease-in-out shrink-0 z-20
          ${collapsed ? "w-16" : "w-64"}`}
      >
        {/* Logo row */}
        <div className={`h-16 flex items-center border-b border-slate-800 shrink-0
          ${collapsed ? "justify-center px-3" : "justify-between px-5"}`}>
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-amber-400 rounded-xl flex items-center justify-center shadow-lg shadow-amber-900/40">
                <Plane size={15} className="text-slate-900 -rotate-45" />
              </div>
              <span className="font-black text-white text-lg tracking-tight">SkyRoute</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="w-8 h-8 flex items-center justify-center rounded-lg
              text-slate-500 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* User card */}
        <div className={`shrink-0 border-b border-slate-800 ${collapsed ? "px-2 py-4" : "px-4 py-4"}`}>
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <div className="relative shrink-0">
              {user?.image ? (
                <img
                  src={user.image}
                  alt="avatar"
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-700"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-400 to-orange-500
                  flex items-center justify-center text-slate-900 text-sm font-black ring-2 ring-slate-700">
                  {initials}
                </div>
              )}
              {/* Online indicator */}
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate leading-tight">{user?.fullName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {NAV.map((item) => (
            <NavItem key={item.id} item={item} collapsed={collapsed} location={location} />
          ))}
        </nav>

        {/* Bottom nav */}
        <div className="shrink-0 border-t border-slate-800 px-2 py-3 space-y-0.5">
          {BOTTOM_NAV.map((item) => (
            <NavItem key={item.id} item={item} collapsed={collapsed} location={location} />
          ))}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
              text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-all group"
          >
            <LogOut size={18} className="text-slate-500 group-hover:text-red-400 transition-colors" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">

        {/* Top bar */}
        <header className="sticky top-0 z-10 h-16 shrink-0
          bg-slate-900/80 backdrop-blur-md border-b border-slate-800
          flex items-center justify-between px-6">

          <div>
            <p className="text-xs text-slate-500 font-medium">
              {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
            </p>
            <p className="text-sm font-bold text-white leading-tight">
              {greeting()}, {user?.fullName?.split(" ")[0]} 👋
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Mail */}
            <button className="w-9 h-9 flex items-center justify-center rounded-xl
              text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <Mail size={17} />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen((o) => !o)}
                className="w-9 h-9 flex items-center justify-center rounded-xl
                  text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative"
              >
                <Bell size={17} />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-amber-400 rounded-full" />
              </button>

              {notifOpen && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-800
                    rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                      <p className="text-sm font-bold text-white">Notifications</p>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                        NEW
                      </span>
                    </div>
                    <div className="py-8 text-center text-slate-500 text-sm">
                      You're all caught up!
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Avatar → settings */}
            <Link to="settings" className="ml-1">
              {user?.image ? (
                <img
                  src={user.image}
                  alt="avatar"
                  className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-700
                    hover:ring-amber-400 transition-all"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-amber-400 to-orange-500
                  flex items-center justify-center text-slate-900 text-xs font-black
                  ring-2 ring-slate-700 hover:ring-amber-400 transition-all cursor-pointer">
                  {initials}
                </div>
              )}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 bg-slate-950 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;