import api from "./api";
import axios from "axios";

const API = "./api";

export const getBookings = async (page = 0, size = 10) => {
  const res = await api.get(`/admin/bookings?page=${page}&size=${size}`);
  return res.data;
};

export const updateBookingStatus = async (id, status) => {
  const res = await api.put(`/admin/bookings/${id}/status?status=${status}`);
  return res.data;
};

export const cancelBooking = async (id) => {
  const res = await api.put(`/admin/bookings/${id}/cancel`);
  return res.data;
};