import api from "./api";

// FLIGHT ENDPOINTS
export const createFlight = async (data) => {
  const res = await api.post("/flights", data);
  return res.data;
};

export const getTodayFlights = async () => {
  const res = await api.get("/flights/today");
  return res.data;
};

export const updateFlight = async (id, data) => {
  const res = await api.put(`/flights/${id}`, data);
  return res.data;
};

export const getAllFlights = async (page = 0, size = 10) => {
  const res = await api.get(`/flights/all?page=${page}&size=${size}`);
  return res.data;
};

// ==================== SEAT ENDPOINTS ====================

// Get seats for a specific flight
// export const getSeatsByFlight = async (flightId) => {
//   const res = await api.get(`/seats/${flightId}`);
//   return res.data;
// };
export const getSeatsByFlight = async (flightId) => {
  const res = await api.get(`/flights/${flightId}/seats`);
  return res.data;
};

export const updateSeats = async (flightId, seats) => {
  const res = await api.put(`/admin/flights/${flightId}/seats/`, seats);
  return res.data;
};

// Update seats for a specific flight
// export const updateSeats = async (flightId, seats) => {
//   // wrap seats in an object to match backend FlightUpdateDto
//   return api.put(`/flights/${flightId}`, { seats });
// };

// Lock selected seats
export const lockSeats = async (seatIds) => {
  const res = await api.post("/seats/lock", { seatIds });
  return res.data;
};

// Release previously locked seats
export const releaseSeats = async (seatIds) => {
  const res = await api.post("/seats/release", { seatIds });
  return res.data;
};