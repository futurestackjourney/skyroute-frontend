import api from "./api";

// export const getFlights = async (query) => {
//   const response = await api.get("/flights/search", { params: query });
//   return response.data;
// };
export const getFlights = async (query) => {
  const response = await api.get("/flights/search", {
    params: {
      ...query,
      page: query.page,
      pageSize: query.pageSize,
    },
  });

  return response.data;
};


export const getFlightById = async (id) => {
  const response = await api.get(`/flights/${id}`);
  return response.data;
};

// export const searchCities = async (query, type) => {
//   const res = await api.get("/flights/autocomplete", {
//     params: {
//       query,
//       isOrigin: type === "origin",
//     },
//   });

//   return res.data;
// };
export const searchCities = async (query, type) => {
  const res = await api.get("/flights/cities", {
    params: {
      query,
      isOrigin: type === "origin",
    },
  });

  return res.data;
};


export const getAutocompleteSuggestions = async (query, isOrigin) => {
  const response = await api.get("/flights/autocomplete", {
    params: {
      query,
      isOrigin,
    },
  });
  return response.data;
};
