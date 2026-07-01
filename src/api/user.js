import api from "./api";

export const getUsers = async (page = 0, size = 10) => {
  const res = await api.get(`/users/get?page=${page}&size=${size}`);
  return res.data;
};
export const createUser = async (payload) => {
  const res = await api.post("/users/create", payload);
  return res.data;
};
export const updateUser = async (id, payload) => {
  const res = await api.put(`/users/${id}`, payload);
  return res.data;
};