import api from "./api";


export const getAllDeals = async () => {
  const res = await api.get("/admin/deals/all");
  return res.data;
};
 
export const getDealById = async (id) => {
  const res = await api.get(`/admin/deals/${id}`);
  return res.data;
};
 
export const createDeal = async (data) => {
  const res = await api.post("/admin/deals/create", data);
  return res.data;
};
 
export const updateDeal = async (id, data) => {
  const res = await api.put(`/admin/deals/${id}`, data);
  return res.data;
};
 
export const deleteDeal = async (id) => {
  const res = await api.delete(`/admin/deals/${id}`);
  return res.data;
};