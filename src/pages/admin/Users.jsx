import { useEffect, useState } from "react";
import { getUsers, createUser, updateUser } from "../../api/user";
import { showSuccess, showError } from "../../utils/toast";
import { ChevronsUpDown } from "lucide-react";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeController, setActiveController] = useState(null);
  const [success, setSuccess] = useState(null);

  //PAGINATION PAGES & SIZES
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [total, setTotal] = useState(0);

  //CREATE USER FORM
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  //Update USER FORM
  const [showEdit, setShowEdit] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [updating, setUpdating] = useState(false);

  //Fetch all user
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers(page, size);
      setUsers(data.data);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  // ==== CREATE NEW USER =====
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "",
    emailConfirmed: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const submitCreate = async () => {
    try {
      if (!form.fullName || !form.email || !form.password || !form.role) {
        showError("Missing required fields");
        return;
      }

      setCreating(true);

      const newUser = await createUser(form);
      showSuccess("User Create Successfull");

      // optimistic UI
      setUsers((prev) => [newUser, ...prev]);

      // reset form
      setForm({
        fullName: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "",
        emailConfirmed: false,
      });

      setShowCreate(false);

      // ensure cache sync
      fetchUsers();
    } catch (err) {
      console.error(err);
      showError(err?.response?.data?.message || "Create failed");
    } finally {
      setCreating(false);
    }
  };

  // ===== UPDATE USER =====
  const openEdit = (user) => {
    setEditingUser({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber || "",
      role: user.role || "",
      emailConfirmed: user.emailConfirmed,
      isActive: user.isActive,
    });
    setShowEdit(true);
  };
  const submitUpdate = async () => {
    try {
      if (!editingUser.fullName || !editingUser.email) {
        showError("Missing required fields");
        return;
      }

      setUpdating(true);

      const updated = await updateUser(editingUser.id, editingUser);
      showSuccess("User Updated Successfull");

      // optimistic update
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));

      setShowEdit(false);
      setEditingUser(null);

      // ensure cache sync
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <div className="px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold mb-1 text-charcoal ">
            App Users
          </h1>
          <p className="text-charcoal-100 mb-4">
            View and manage all app users.
          </p>
          <input
            className="input-search mb-6 "
            type="text"
            placeholder="Search users..."
          />
        </div>
        <div className="relative flex flex-col w-full h-full text-slate-700 bg-[#f1f1f1] shadow-md rounded-xl bg-clip-border">
          <div className="relative mx-4 mt-4 overflow-hidden text-slate-700 bg-[#f1f1f1] rounded-none bg-clip-border">
            <div className="flex items-center justify-between ">
              <div>
                <h3 className="text-lg font-semibold ">Users List</h3>
                <p className="text-charcoal-100">
                  Review each person before edit
                </p>
              </div>
              <div className="flex flex-col gap-2 shrink-0 sm:flex-row">
                <button
                  className="rounded border border-slate-300 py-2.5 px-3 text-center text-xs font-semibold text-slate-600 transition-all hover:opacity-75 focus:ring focus:ring-slate-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                  type="button"
                >
                  View All
                </button>
                <button
                  onClick={() => setShowCreate(true)}
                  className="flex select-none items-center gap-2 rounded bg-charcoal py-2.5 px-4 text-xs font-semibold text-white shadow-md transition-all hover:shadow-lg hover:bg-charcoal-100 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                  type="button"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    stroke-width="2"
                    className="w-4 h-4"
                  >
                    <path d="M6.25 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM3.25 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM19.75 7.5a.75.75 0 00-1.5 0v2.25H16a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25H22a.75.75 0 000-1.5h-2.25V7.5z"></path>
                  </svg>
                  Add member
                </button>
              </div>
            </div>
          </div>
          {loading ? (
            <p className="p-4 text-2xl">Loading...</p>
          ) : (
            <div className="p-0 overflow-scroll">
              <table className="w-full mt-4 text-left table-auto min-w-max">
                <thead>
                  <tr>
                    <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
                      <p className="flex items-center justify-between gap-2 font-sans text-sm font-normal leading-none text-slate-500">
                        Member
                        <ChevronsUpDown className="size-4" />
                      </p>
                    </th>
                    <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
                      <p className="flex items-center justify-between gap-2 font-sans text-sm font-normal leading-none text-slate-500">
                        Function
                        <ChevronsUpDown className="size-4" />
                      </p>
                    </th>
                    <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
                      <p className="flex items-center justify-between gap-2 font-sans text-sm  font-normal leading-none text-slate-500">
                        Status
                        <ChevronsUpDown className="size-4" />
                      </p>
                    </th>
                    <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-[#f7f7f7] hover:bg-slate-100">
                      <p className="flex items-center justify-between gap-2 font-sans text-sm  font-normal leading-none text-slate-500">
                        Employed
                        <ChevronsUpDown className="size-4" />
                      </p>
                    </th>
                    <th className="p-4 transition-colors cursor-pointer border-y border-slate-200 bg-slate-50 hover:bg-slate-100">
                      <p className="flex items-center justify-between gap-2 font-sans text-sm  font-normal leading-none text-slate-500">
                        Actions
                      </p>
                    </th>
                  </tr>
                </thead>
                <tbody className="" onClick={() => setActiveController(false)}>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="p-4 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                          {u.imageUrl ? (
                            <img
                              src={u.imageUrl}
                              alt={u.fullName}
                              className="relative inline-block h-9 w-9 rounded-full! object-cover object-center"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-full! bg-[#e2e2e2]"></div>
                          )}
                          <div className="flex flex-col">
                            <p className="text-sm font-semibold text-slate-700">
                              {u.fullName}
                            </p>
                            <p className="text-sm text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 border-b border-slate-200">
                        <div className="flex flex-col">
                          <p className="text-sm font-semibold text-slate-700">
                            {u.role}
                          </p>
                          <p className="text-sm text-slate-500">Organization</p>
                        </div>
                      </td>
                      <td className="p-4 border-b border-slate-200">
                        <div className="w-max">
                          <div className="relative grid items-center font-sans text-xs font-bold  uppercase  select-none whitespace-nowrap ">
                            {u.isActive == true ? (
                              <span className="text-green-900 bg-green-500/20 px-2 py-1 rounded-md">
                                Active
                              </span>
                            ) : (
                              <span className="text-slate-500 bg-slate-300/20 px-2 py-1 rounded-md">
                                Offline
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 border-b border-slate-200">
                        <p className="text-sm text-slate-500">23/04/18</p>
                      </td>
                      <td className="relative p-4 border-b border-slate-200 ">
                        <div onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setActiveController(u.id)}
                            className=" h-10 max-h-10 w-10 max-w-10 select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-slate-900 transition-all hover:bg-slate-900/10 active:bg-slate-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                            type="button"
                          >
                            <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2">
                              <svg
                                width={20}
                                viewBox="0 0 16 16"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="#a1a1a1"
                                class="bi bi-three-dots-vertical"
                              >
                                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                <g
                                  id="SVGRepo_tracerCarrier"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                ></g>
                                <g id="SVGRepo_iconCarrier">
                                  {" "}
                                  <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"></path>{" "}
                                </g>
                              </svg>
                            </span>
                            {activeController === u.id && (
                              <div className="absolute p-3 bottom-2 right-5 w-25 space-y-2 bg-white rounded-lg">
                                <button
                                  onClick={() => openEdit(u)}
                                  className="text-charcoal w-full flex gap-2"
                                >
                                  <svg
                                    width={15}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <g
                                      id="SVGRepo_bgCarrier"
                                      stroke-width="0"
                                    ></g>
                                    <g
                                      id="SVGRepo_tracerCarrier"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                    ></g>
                                    <g id="SVGRepo_iconCarrier">
                                      {" "}
                                      <path
                                        fill-rule="evenodd"
                                        clip-rule="evenodd"
                                        d="M20.8477 1.87868C19.6761 0.707109 17.7766 0.707105 16.605 1.87868L2.44744 16.0363C2.02864 16.4551 1.74317 16.9885 1.62702 17.5692L1.03995 20.5046C0.760062 21.904 1.9939 23.1379 3.39334 22.858L6.32868 22.2709C6.90945 22.1548 7.44285 21.8693 7.86165 21.4505L22.0192 7.29289C23.1908 6.12132 23.1908 4.22183 22.0192 3.05025L20.8477 1.87868ZM18.0192 3.29289C18.4098 2.90237 19.0429 2.90237 19.4335 3.29289L20.605 4.46447C20.9956 4.85499 20.9956 5.48815 20.605 5.87868L17.9334 8.55027L15.3477 5.96448L18.0192 3.29289ZM13.9334 7.3787L3.86165 17.4505C3.72205 17.5901 3.6269 17.7679 3.58818 17.9615L3.00111 20.8968L5.93645 20.3097C6.13004 20.271 6.30784 20.1759 6.44744 20.0363L16.5192 9.96448L13.9334 7.3787Z"
                                        fill="#0F0F0F"
                                      ></path>{" "}
                                    </g>
                                  </svg>
                                  Edit
                                </button>
                                <button className="text-red-500 w-full flex gap-2">
                                  <svg
                                    width={15}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <g
                                      id="SVGRepo_bgCarrier"
                                      stroke-width="0"
                                    ></g>
                                    <g
                                      id="SVGRepo_tracerCarrier"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                    ></g>
                                    <g id="SVGRepo_iconCarrier">
                                      {" "}
                                      <path
                                        d="M10 12V17"
                                        stroke="#fb2c36"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                      ></path>{" "}
                                      <path
                                        d="M14 12V17"
                                        stroke="#fb2c36"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                      ></path>{" "}
                                      <path
                                        d="M4 7H20"
                                        stroke="#fb2c36"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                      ></path>{" "}
                                      <path
                                        d="M6 10V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V10"
                                        stroke="#fb2c36"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                      ></path>{" "}
                                      <path
                                        d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z"
                                        stroke="#fb2c36"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                      ></path>{" "}
                                    </g>
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGGINATION */}
          <div className="flex items-center justify-between p-3">
            <p className="block text-sm text-slate-500">
              Page {page + 1} / {Math.ceil((total || 0) / size)}
            </p>
            <div className="flex gap-1">
              <button
                className="rounded border border-slate-300 py-2.5 px-3 text-center text-xs font-semibold text-slate-600 transition-all hover:opacity-75 focus:ring focus:ring-slate-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <button
                className="rounded border border-slate-300 py-2.5 px-3 text-center text-xs font-semibold text-slate-600 transition-all hover:opacity-75 focus:ring focus:ring-slate-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                type="button"
                disabled={(page + 1) * size >= total}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* CREATE NEW USER */}
        {showCreate && (
          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={() => setShowCreate(false)}
          >
            <div
              className="bg-white p-6 rounded-lg w-102 space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold">Create User</h3>

              <input
                name="fullName"
                placeholder="Full name"
                value={form.fullName}
                onChange={handleChange}
                className="form-input "
              />

              <input
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="form-input "
              />

              <input
                name="phoneNumber"
                placeholder="Phone"
                value={form.phoneNumber}
                onChange={handleChange}
                className="form-input "
              />

              <input
                name="password"
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="form-input "
              />

              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="form-input "
              >
                <option value="">Role</option>
                <option value="Admin">Admin</option>
                <option value="Staff">Staff</option>
                <option value="Customer">Customer</option>
              </select>

              <label className="flex gap-2">
                <input
                  type="checkbox"
                  name="emailConfirmed"
                  checked={form.emailConfirmed}
                  onChange={handleChange}
                />
                Email confirmed
              </label>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-3 py-2 border rounded"
                >
                  Cancel
                </button>

                <button
                  disabled={creating}
                  onClick={submitCreate}
                  className="px-3 py-2 bg-charcoal text-white rounded disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* UPDATE USER */}
        {showEdit && (
          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={() => setShowEdit(false)}
          >
            <div
              className="bg-white p-6 rounded-lg w-105 space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-bold text-xl text-chatcoal">
                Edit User Details
              </h2>

              <div className="relative p-2">
                <label className="form-label">Full Name</label>
                <input
                  value={editingUser.fullName}
                  onChange={(e) =>
                    setEditingUser((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                  className="form-input w-full"
                />
              </div>

              <div className="relative p-2">
                <label className="form-label">Email Address</label>
                <input
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="form-input w-full"
                />
              </div>

              <div className="relative p-2">
                <label className="form-label">Phone Number</label>
                <input
                  value={editingUser.phoneNumber}
                  onChange={(e) =>
                    setEditingUser((prev) => ({
                      ...prev,
                      phoneNumber: e.target.value,
                    }))
                  }
                  className="form-input w-full"
                />
              </div>

              <select
                name="role"
                value={editingUser.role}
                onChange={(e) =>
                  setEditingUser((prev) => ({
                    ...prev,
                    role: e.target.value,
                  }))
                }
                className="form-input "
              >
                <option value="">Role</option>
                <option value="Admin">Admin</option>
                <option value="Staff">Staff</option>
                <option value="Customer">Customer</option>
              </select>

              {/* <label className="flex gap-2">
                <input
                  type="checkbox"
                  name="emailConfirmed"
                  checked={editingUser.emailConfirmed}
                  onChange={(e) =>
                  setEditingUser((prev) => ({
                    ...prev,
                    emailConfirmed: e.target.value,
                  }))
                }
                />
                Is Active
              </label> */}

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowEdit(false)}
                  className="px-3 py-2 border rounded"
                >
                  Cancel
                </button>

                <button
                  disabled={updating}
                  onClick={submitUpdate}
                  className="px-3 py-2 bg-charcoal text-white rounded"
                >
                  {updating ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Users;
