import airports from "airports-data";

export const getAirportName = (code) => {
  const airport = airports[code];
  return airport ? airport.city : code;
};
