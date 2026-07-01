import api from "./api";

export const createBooking = async (payload) => {
  const res = await api.post("/bookings", payload);
  return res.data;
};

export const payBooking = async (bookingId) => {
  const res = await api.post(`/bookings/${bookingId}/pay`);
  return res.data;
};

export const getMyBookings = async () => {
  const res = await api.get("/bookings/my");
  return res.data;
};

export const getBookingById = async (id) => {
  const res = await api.get(`/bookings/${id}`);
  return res.data;
};
