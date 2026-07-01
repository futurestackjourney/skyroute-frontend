import { Routes, Route } from "react-router-dom";
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import Home from "../pages/publicPages/Home";
import PublicLayout from "../layouts/PublicLayout";
import FlightSearch from "../pages/publicPages/FlightSearch";
import Booking from "../pages/Booking";
import SeatSelection from "../pages/publicPages/SeatSelection";
import AboutUsPage from "../pages/publicPages/AboutUsPage";
import SupportPage from "../pages/publicPages/SupportPage";
import DealsPage from "../pages/publicPages/DealsPage";
import NotFound from "../pages/fallback/NotFound";
import Hotels from "../pages/publicPages/Hotels";

const PublicRoutes = () => {
  return (
    <>
      <Routes>
      <Route element={<PublicLayout />}>
        {/* Home */}
        <Route index element={<Home />} />

        {/* Auth */}
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />

        {/* Flights */}
        <Route path="search" element={<FlightSearch />} />
        {/* <Route path="flights/:flightId/seats" element={<SeatSelection />} /> */}

        {/* Hotels */}
        <Route path="hotels" element={<Hotels />} />
        {/* <Route path="hotels/:hotelId" element={<HotelSearch />} /> */}

        {/* Booking */}
        {/* <Route path="booking" element={<Booking />} /> */}

        {/* Static Pages */}
        <Route path="aboutUs" element={<AboutUsPage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="deals" element={<DealsPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    </>
  );
};

export default PublicRoutes;
