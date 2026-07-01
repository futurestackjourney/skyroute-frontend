import { useState } from "react";

const AircraftForm = ({ initialData, onSubmit, loading }) => {
  const [model, setModel] = useState(initialData?.model || "");
  const [totalSeats, setTotalSeats] = useState(initialData?.totalSeats || "");

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      model,
      totalSeats: Number(totalSeats),
    });
  };

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div>
          <div className="mb-6">
            {/* <h1 className="text-3xl font-semibold mb-1 text-charcoal ">
            Create Aircraft
          </h1> */}
            <p className="text-charcoal-100 mb-4">
              Fill in the details to create a new aircraft.
            </p>
            <input
              className="input-search mb-6 "
              type="text"
              placeholder="Aircraft Search"
            />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div className="form-group">
              <input
                type="text"
                placeholder="Aircraft Model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
                className="input-field"
              />
              <input
                type="number"
                placeholder="Total Seats"
                value={totalSeats}
                onChange={(e) => setTotalSeats(e.target.value)}
                required
                min={1}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Airline Name"
                className="input-field"
              />
            </div>

            <div className="w-full sm:w-[32%] mx-auto">
              <button type="submit" disabled={loading} className="form-btn ">
                {loading ? "Saving..." : "Save Aircraft"}
              </button>
            </div>
          </form>
        </div>

        {/* EDIT AIRCRAFT FORM */}
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-105 space-y-3">
            
          </div>
        </div>
      </div>
    </>
  );
};

export default AircraftForm;
