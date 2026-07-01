import api from "./api";

export const getMyBoardingPasses = async () => {
  const res = await api.get("/bookings/my/boarding-passes");
  return res.data;
};

/**
 * Downloads the boarding pass PDF for a given booking.
 * Calls GET /api/bookings/{bookingId}/boarding-pass
 * The backend generates the PDF with QuestPDF and returns it as a file.
 */
export const downloadBoardingPassPdf = async (bookingId) => {
  const res = await api.get(`/bookings/${bookingId}/boarding-pass`, {
    responseType: "blob", // tell axios to treat the response as a binary file
  });
 
  const filename = `boarding-pass-SKY${String(bookingId).padStart(6, "0")}.pdf`;
  const url      = URL.createObjectURL(res.data);
 
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};