import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Routes imports
import AdminRoutes from "./routes/AdminRoutes";
import PublicRoutes from "./routes/PublicRoutes";
import UserRoutes from "./routes/UserRoutes";
import BookingRoutes from "./routes/BookingRoutes";



// Fallback Pages imports
import Unauthorized from "./pages/fallback/Unauthorized";
import NotFound from "./pages/fallback/NotFound";



const App = () => {



  return (
    <Router>
      <Routes>

        {/* Public Routes Layout */}
        <Route path="/*" element={<PublicRoutes />}/>

        {/* Auth User Routes Layout */}
        <Route path="/user/*" element={<UserRoutes />} />

        <Route path="/booking/*" element={<BookingRoutes />} />
    
        {/* Staff Routes Layout  */}

        {/* Admin Routes */}
        <Route path="/admin/*" element={<AdminRoutes />} />

        {/* Fallback */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  );
};

export default App;
