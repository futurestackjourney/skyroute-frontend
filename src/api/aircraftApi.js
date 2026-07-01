import api from "../api/api";

export const getAllAircrafts = async () => {
  const res = await api.get("/aircrafts/all");
  return res.data;
};

export const getAllAircraft = async (page = 0, size = 10) => {
  const res = await api.get(`/aircrafts?page=${page}&size=${size}`);
  return res.data;
};

export const createAircraft = async (data) => {
  const response = await api.post("/aircrafts/create", data);
  return response.data;
};

export const updateAircraft = async (id, data) => {
  const response = await api.put(`/aircrafts/${id}`, data );
  return response.data;
};
