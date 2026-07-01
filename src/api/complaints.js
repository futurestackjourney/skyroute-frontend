import api from "../api/api";


// export const getAllFlights = async (page = 0, size = 10) => {
//   const res = await api.get(`/flights/all?page=${page}&size=${size}`);
//   return res.data;
// };

export const getComplaints = async (page = 0, size = 10, status = "") => {
  let url = `/admin/complaints?page=${page}&size=${size}&status=${status}`;

  if (status) {
    url += `&status=${status}`;
  }

  const res = await api.get(url);
  return res.data;
};


export const updateComplaint = async (id, data) => {
  const res = await api.put(`/admin/complaints/${id}`, data);
  return res.data;
};