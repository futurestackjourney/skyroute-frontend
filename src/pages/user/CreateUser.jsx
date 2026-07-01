import { useEffect, useState } from "react";

const CreateUser = (open, onClose, onSuccess) => {

     const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "",
    emailConfirmed: false,
  });

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const submit = async () => {
    try {
      await createUser(form);
      onSuccess();
      onClose();
    } catch {
      alert("Failed to create user");
    }
  };


  return (
    <>
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-105 space-y-3">
        <h3 className="text-lg font-semibold">Create User</h3>

        <input name="fullName" placeholder="Full name" onChange={handleChange} className="input-search w-full"/>
        <input name="email" placeholder="Email" onChange={handleChange} className="input-search w-full"/>
        <input name="phoneNumber" placeholder="Phone" onChange={handleChange} className="input-search w-full"/>
        <input name="password" type="password" placeholder="Password" onChange={handleChange} className="input-search w-full"/>

        <select name="role" onChange={handleChange} className="input-search w-full">
          <option value="">Role</option>
          <option value="Admin">Admin</option>
          <option value="User">User</option>
        </select>

        <label className="flex gap-2">
          <input type="checkbox" name="emailConfirmed" onChange={handleChange}/>
          Email confirmed
        </label>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 border rounded">Cancel</button>
          <button onClick={submit} className="px-3 py-2 bg-charcoal text-white rounded">Create</button>
        </div>
      </div>
    </div>
    </>
  )
}

export default CreateUser
