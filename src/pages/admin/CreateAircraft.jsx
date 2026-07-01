import { useState } from "react";
import { createAircraft } from "../../api/aircraftApi";
import AircraftForm from "../../pages/admin/AircraftForm";
import { parseApiError } from "../../utils/apiError";
import { showSuccess, showError } from "../../utils/toast";

const CreateAircraft = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const handleCreate = async (data) => {
    try {
      setLoading(true);
      await createAircraft(data);
      showSuccess("Aircraft created successfully");
    } catch (error) {
      showError(parseApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-1 text-charcoal">Create Aircraft</h1>

      {success && <p className="text-green-600 mb-3">{success}</p>}

      <AircraftForm onSubmit={handleCreate} loading={loading} />
    </div>
  );
};

export default CreateAircraft;
