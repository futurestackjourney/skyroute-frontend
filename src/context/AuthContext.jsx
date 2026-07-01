import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext(null);

const getRoleFromToken = (decoded) => {
  return (
    decoded.role ||
    decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
    null
  );
};


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false); //  IMPORTANT


useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    setIsAuthReady(true);
    return;
  }

  try {
    const decoded = jwtDecode(token);

    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      setUser(null);
    } else {
      setUser({
        id: decoded.sub,
        email: decoded.email,
        fullName: decoded.fullName,
        role: getRoleFromToken(decoded),
      });
    }
  } catch {
    localStorage.removeItem("token");
    setUser(null);
  }

  setIsAuthReady(true); //  now auth check finished
}, []);



  const login = (token) => {
  const decoded = jwtDecode(token);
  localStorage.setItem("token", token);

  setUser({
    id: decoded.sub,
    email: decoded.email,
    fullName: decoded.fullName,
    role: getRoleFromToken(decoded),
  });

  const timeout = decoded.exp * 1000 - Date.now();

  setTimeout(() => {
    logout();
    window.location.href = "/login";
  }, timeout);
};


  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthReady }}>
      {children}
    </AuthContext.Provider>
  );
};

