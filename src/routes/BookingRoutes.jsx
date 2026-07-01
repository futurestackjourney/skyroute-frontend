import { Routes, Route } from "react-router-dom";
import BookingLayout from "../layouts/BookingLayout";
import SeatSelection from "../pages/publicPages/SeatSelection";
import Payment from "../pages/Payment";
import Booking from "../pages/Booking";

const BookingRoutes = () => {
  return (
    <Routes>
        <Route element={<BookingLayout/>}>
            {/* Booking */}
            <Route path="/flights/:flightId/seats" element={<SeatSelection />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/profile/payment/:bookingId" element={<Payment/> } />
        </Route>

        <Route/>
      
    </Routes>
  )
}

export default BookingRoutes
