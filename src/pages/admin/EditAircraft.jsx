import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { updateAircraft } from "../../api/aircraftApi";
import AircraftForm from "../../pages/admin/AircraftForm";

const EditAircraft = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(null);

  

  // You can optionally fetch aircraft by ID if needed
  // const initialData = {
  //   model: "",
  //   totalSeats: "",
  // };
//   useEffect(() => {
//   const fetchAircraft = async () => {
//     try {
//       const res = await getAircraftById(id);
//       setInitialData(res.data);
//     } catch (err) {
//       alert("Failed to load aircraft");
//     }
//   };
//   fetchAircraft();
// }, [id]);


  const handleUpdate = async (data) => {
    try {
      setLoading(true);
      await updateAircraft(id, data);
      alert("Aircraft updated successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-1 text-charcoal">Update Aircraft</h1>
      <AircraftForm
        initialData={initialData}
        onSubmit={handleUpdate}
        loading={loading}
      />
    </div>
  );
};

export default EditAircraft;
