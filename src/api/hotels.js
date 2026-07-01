import api from "./api";

export const getHotels = async () => {
  const res = await api.get("/hotelbookings/all");
  return res.data;
};

export const createHotelBooking = async (data) => {
  const res = await api.post("/hotelbookings", data);
  return res.data;
};