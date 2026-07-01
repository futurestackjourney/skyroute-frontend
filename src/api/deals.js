import api from "./api";


// ── DEALS (PUBLIC) ─────────────────────────────────────────────
export const getAllActiveDeals = async () => {
  const res = await api.get("/admin/deals/active");
  return res.data;
};
 
// ── DEAL BOOKINGS ──────────────────────────────────────────────
export const bookDeal = async (data) => {
  const res = await api.post("/traveldealbookings", data);
  return res.data;
};
 
export const getMyDealBookings = async () => {
  const res = await api.get("/traveldealbookings/my-bookings");
  return res.data;
};
 
export const getDealBookingById = async (id) => {
  const res = await api.get(`/traveldealbookings/${id}`);
  return res.data;
};
 
export const getAllDealBookings = async () => {
  const res = await api.get("/traveldealbookings/all");
  return res.data;
};
