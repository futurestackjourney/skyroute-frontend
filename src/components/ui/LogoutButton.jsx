import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login"); // redirect after logout
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
