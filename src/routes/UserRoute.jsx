import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const UserRoute = ({ children }) => {
  const { user, isAuthReady } = useContext(AuthContext);

  if (!isAuthReady) return null;

  if (!user) return <Navigate to="/login" replace />;

//   if (user.role !== "user") return <Navigate to="/unauthorized" replace />;

  return children;
};

export default UserRoute;
