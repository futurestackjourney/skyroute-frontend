import { useState } from "react";
import { createFlight } from "../../api/adminFlights";
import { showSuccess, showError } from "../../utils/toast";
import { parseApiError } from "../../utils/apiError";

const CreateFlight = () => {
    const [success, setSuccess] = useState(null);
  const [form, setForm] = useState({
    flightNumber: "",
    origin: "",
    destination: "",
    departureTime: "",
    arrivalTime: "",
    aircraftId: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await createFlight({
        ...form,
        aircraftId: Number(form.aircraftId),
      });
      showSuccess("Flight created successfully");
    } catch (err) {
      showError(parseApiError(err));
      // alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <>
      <div className="px-4 sm:px-6  max-w-7xl mx-auto ">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold mb-1 text-charcoal ">
          Create Flight
        </h1>
        <p className="text-charcoal-100 mb-4">
          Fill in the details to create a new flight.
        </p>
          <input className="input-search mb-6 " type="text" placeholder="Flight Search" />
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <input
              className="input-field"
              name="flightNumber"
              placeholder="Flight No"
              onChange={handleChange}
            />
            <input
              className="input-field"
              name="origin"
              placeholder="Origin"
              onChange={handleChange}
            />
            <input
              className="input-field"
              name="destination"
              placeholder="Destination"
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <input
              type="datetime-local"
              className="input-field"
              name="departureTime"
              onChange={handleChange}
            />
            <input
              type="datetime-local"
              className="input-field"
              name="arrivalTime"
              onChange={handleChange}
            />
            <input
              className="input-field"
              name="aircraftId"
              placeholder="Aircraft ID"
              onChange={handleChange}
            />
          </div>

          <div className=" w-full sm:w-1/4 mx-auto">
          <button className="form-btn">Create</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateFlight;
