import { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import LogoutButton from "./ui/LogoutButton";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Menu, Plane, X } from "lucide-react";
import AuthToggleButton from "./ui/AuthToggleButton";
import gsap from "gsap";



const Navbar = () => {
  const { user } = useContext(AuthContext);
  // const isAdmin = user?.role === "Admin";
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const titleRef = useRef(null);

  // useEffect(() => {
  //   gsap.from(titleRef.current, {
  //     y: -50,
  //     opacity: 0,
  //     duration: 1,
  //     ease: "power3.out",
  //   });
  // }, []);

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
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-10 transition-opacity duration-300
            ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setIsOpen(false)}
      />
      <header className="md:px-10 md:my-3 w-full mx-auto absolute z-10">
        {/* <div className="">
        
      </div> */}

        <div className="nav px-2 py-2 md:rounded-4xl bg-white/10  shadow-sm mx-auto w-full">
          {/* Dashboard Menu */}
          <div className="hidden md:block">
            <div className="flex items-center gap-10 text-charcoal font-semibold">
              <div className="logo py-2 px-4 ">
                <img src="/images/logo.png" width={100} alt="" />
              </div>

              <div className="nav-links">
                <ul>
                  <li>
                    <NavLink
                      className={({ isActive }) =>
                        `px-4 py-3 rounded-3xl ${isActive ? "bg-charcoal text-white" : "bg-black/10"}`
                      }
                      to="/"
                    >
                      Home
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      className={({ isActive }) =>
                        `px-4 py-3 rounded-3xl ${isActive ? "bg-charcoal text-white" : "bg-black/10"}`
                      }
                      to="/search"
                    >
                      Flight Search
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      className={({ isActive }) =>
                        `px-4 py-3 rounded-3xl ${isActive ? "bg-charcoal text-white" : "bg-black/10"}`
                      }
                      to="/deals"
                    >
                      Deals
                    </NavLink>
                  </li>
                   <li>
                    <NavLink
                      className={({ isActive }) =>
                        `px-4 py-3 rounded-3xl ${isActive ? "bg-charcoal text-white" : "bg-black/10"}`
                      }
                      to="/hotels"
                    >
                      Hotels
                    </NavLink>
                  </li> 
                  <li>
                    <NavLink
                      className={({ isActive }) =>
                        `px-4 py-3 rounded-3xl ${isActive ? "bg-charcoal text-white" : "bg-black/10"}`
                      }
                      to="/aboutUs"
                    >
                      About Us
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      className={({ isActive }) =>
                        `px-4 py-3 rounded-3xl ${isActive ? "bg-charcoal text-white" : "bg-black/10"}`
                      }
                      to="/support"
                    >
                      Support
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Profile Icon */}
          <div className="hidden md:block profile relative">
            {!user && (
              // <button className="text-lg px-4 py-2 rounded-4xl bg-charcoal text-white hover:bg-charcoal-50 transition shadow-lg shadow-[#000a4ea0]">
              //   <Link to="/login">Login</Link>
              // </button>
              <AuthToggleButton/>
            )}

            {user && (
              <div
                className="flex items-center gap-2 text-charcoal"
                ref={profileRef}
              >
                <span>
                  Welcome, {user.fulName} ({user.role})
                </span>

                {/* Profile Icon */}
                <button
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="profile-icon w-10 h-10 flex items-center justify-center bg-charcoal rounded-full text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </button>

                {/* Dropdown */}
                {isProfileOpen && (
                  <div className="profile-links absolute top-14 right-0 w-52 p-4 bg-white/10 shadow-sm backdrop-blur-md rounded-md text-charcoal  space-y-2 flex flex-col z-50">
                    <Link
                      className="profile-link"
                      to="user/"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Profile
                    </Link>

                    <Link
                      className="profile-link"
                      to="/complaint"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Complaint
                    </Link>

                    <Link
                      className="profile-link"
                      to="user/my-bookings"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      My Bookings
                    </Link>

                    <LogoutButton onClick={() => setIsProfileOpen(false)} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="block md:hidden w-full">
            {/* Top Bar */}
            <div className="flex items-center justify-between w-full py-2">
              {/* Logo */}
              <div
                className={`logo  
                ${isOpen ? "opacity-0 invisible" : "opacity-100 visible"}
                `}
              >
                <img src="/images/logo.png" width={100} alt="" />
              </div>

              {/* Menu Button */}
              <button onClick={() => setIsOpen(true)} className="p-2">
                <Menu size={28} className="text-charcoal" />
              </button>
            </div>

            {/* Drawer */}
            <div
              className={`fixed top-0 right-0 h-full w-4/5 max-w-sm bg-card z-50 shadow-xl
              transform transition-transform duration-300
              ${isOpen ? "translate-x-0 " : "translate-x-full"}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-300">
                <img src="/images/logo.png" width={100} alt="" />

                <button onClick={() => setIsOpen(false)}>
                  <X size={28} />
                </button>
              </div>

              {/* Links */}
              <nav className="flex flex-col gap-2 p-6 text-lg font-medium">
                <Link className="hover:bg-pumpkin-100/10 p-2 rounded-lg" to="/" onClick={() => setIsOpen(false)}>
                  Home
                </Link>


                <Link className="hover:bg-pumpkin-100/10 p-2 rounded-lg" to="/search" onClick={() => setIsOpen(false)}>
                  Flight Search
                </Link>

                <Link className="hover:bg-pumpkin-100/10 p-2 rounded-lg" to="/deals" onClick={() => setIsOpen(false)}>
                  Deals
                </Link>

                <Link className="hover:bg-pumpkin-100/10 p-2 rounded-lg" to="/aboutUs" onClick={() => setIsOpen(false)}>
                  About Us
                </Link>

                <Link className="hover:bg-pumpkin-100/10 p-2 rounded-lg" to="/support" onClick={() => setIsOpen(false)}>
                  Customer Support
                </Link>

                <Link className="hover:bg-pumpkin-100/10 p-2 rounded-lg" to="/register" onClick={() => setIsOpen(false)}>
                  Register
                </Link>
                <hr className="text-gray-300" />

                {/* Auth Section */}
                {!user && (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="bg-charcoal text-white text-center py-2 rounded-xl hover:bg-pumpkin-50 transition"
                  >
                    Login
                  </Link>
                )}

                {user && (
                  <>
                    <span className="text-sm text-gray-500">
                      {user.name} ({user.role})
                    </span>

                    <Link to="/profile" onClick={() => setIsOpen(false)}>
                      Profile
                    </Link>

                    <Link to="/my-bookings" onClick={() => setIsOpen(false)}>
                      My Bookings
                    </Link>

                    <Link to="/complaint" onClick={() => setIsOpen(false)}>
                      Complaint
                    </Link>

                    <LogoutButton />
                  </>
                )}
              </nav>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
