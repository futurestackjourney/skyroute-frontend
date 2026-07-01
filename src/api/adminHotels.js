// services/hotelService.js

import api from "./api";

// Get all hotels
export const getAllHotels = async () => {
  const res = await api.get("/admin/hotels/all");
  return res.data;
};

// Get hotels by city
export const getHotelsByCity = async (city) => {
  const res = await api.get(`/admin/hotels/city/${city}`);
  return res.data;
};

// Get hotels by country
export const getHotelsByCountry = async (country) => {
  const res = await api.get(`/admin/hotels/country/${country}`);
  return res.data;
};

// Create hotel (with rooms)
export const createHotel = async (data) => {
  const res = await api.post("/admin/hotels", data);
  return res.data;
};

// Update hotel
export const updateHotel = async (id, data) => {
  const res = await api.put(`/admin/hotels/${id}`, data);
  return res.data;
};