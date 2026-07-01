import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, isAuthReady } = useContext(AuthContext);

  // WAIT until auth check finishes
  if (!isAuthReady) return null; // or loading spinner

  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== "Admin")
    return <Navigate to="/unauthorized" replace />;

  return children;
};



export default AdminRoute;
