export const parseApiError = (error) => {
  if (!error.response) {
    return "Network error. Please try again.";
  }

  const { status, data } = error.response;

  if (status === 401) return "Unauthorized. Please login again.";
  if (status === 403) return "Access denied.";
  if (status === 404) return "Resource not found.";
  if (status === 500) return "Server error. Please try later.";

  if (data?.errors) {
    return Object.values(data.errors).flat().join("\n");
  }

  return data?.message || "Something went wrong.";
};
