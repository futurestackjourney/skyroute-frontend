import { Routes, Route,Navigate } from "react-router-dom";
import UserRoute from "./UserRoute";


import UserProfile from "../pages/user/UserProfile";
import UserLayout from './../layouts/UserLayout';
import MyBookings from './../pages/MyBookings';
import Payment from './../pages/Payment';
import NotFound from "../pages/fallback/NotFound";
import CreateBooking from "../pages/user/CreateBooking";
import Settings from "../pages/user/Settings";


const UserRoutes = () => {
  return (
    <Routes>
     <Route
        path="profile"
        element={
          <UserRoute>
            <UserLayout />
          </UserRoute>
        }
      >
        <Route index element={<UserProfile />} />
        <Route path="my-bookings" element={<MyBookings />} />
        <Route path="booking/create" element={<CreateBooking />} />
        <Route path="payment/:bookingId" element={<Payment />} />


        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound to="/not-found" replace />} />
    </Routes>
  )
}

export default UserRoutes
