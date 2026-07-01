import { Outlet } from "react-router-dom";

;/**
 * BookingLayout – stripped layout for the seat selection → passenger details → payment flow.
 * Each page in this flow has its own sticky top bar, so we render nothing but the page itself.
 */
const BookingLayout = () => {
  return <Outlet />;
};

export default BookingLayout;