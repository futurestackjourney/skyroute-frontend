import { Routes, Route } from "react-router-dom";
import AdminRoute from "./AdminRoute";

import DashboardLayout from "../layouts/DashboardLayout";
// import DashboardLayout from "../pages/admin/DashboardLayout";
import DashboardHome from "../pages/admin/DashboardHome";
import Analytics from "../pages/admin/Analytics";
import Settings from "../pages/admin/Settings";
import CreateAircraft from "../pages/admin/CreateAircraft";
import EditAircraft from "../pages/admin/EditAircraft";
import CreateFlight from "../pages/admin/CreateFligth";
import NotFound from "../pages/fallback/NotFound";
import Users from "../pages/admin/Users";
import CreateUser from "../pages/user/CreateUser";
import Aircraft from "../pages/admin/Aircraft";
import Flight from "../pages/admin/Flight";
import AdminComplaints from "../pages/admin/AdminComplaints ";
import AdminBookings from "../pages/admin/AdminBookings";
import { BookingPage } from "../pages/admin/Booking";
import AdminHotels from "../pages/admin/AdminHotels";
import AdminDeals from "../pages/admin/AdminDeals";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route
        path="dashboard"
        element={
          <AdminRoute>
            <DashboardLayout />
          </AdminRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="users" element={<Users />} />
        <Route path="createuser" element={<CreateUser />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        {/* FLight Routes */}
        <Route path="flights" element={<Flight/>}/>
        <Route path="createflight" element={<CreateFlight />} />
        {/* Aircraft Routes */}
        <Route path="aircraft" element={<Aircraft />}/>
        <Route path="aircrafts/create" element={<CreateAircraft />} />
        <Route path="aircrafts/:id/edit" element={<EditAircraft />} />
        {/* Complaint Routes */}
        <Route path="complaints" element={<AdminComplaints/>}/>
        {/* Booking Routes */}
        <Route path="bookings" element={<AdminBookings/>}/>
        {/* <Route path="bookings" element={<BookingPage/>}/> */}
        {/* Hotel Routes */}
        <Route path="hotels" element={<AdminHotels/>}/>
        {/* Deal Routes */}
        <Route path="deals" element={<AdminDeals/>}/>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AdminRoutes;
