import api from "./api";

export const getSeatsByFlight = async (flightId) => {
  const res = await api.get(`/flights/${flightId}/seats`);
  return res.data;
};

export const lockSeats = async (payload) => {
  await api.post("/seats/lock", payload);
};

export const releaseSeats = async (payload) => {
  await api.post("/seats/release", payload);
};
