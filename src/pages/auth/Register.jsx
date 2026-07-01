import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import { Eye, EyeOff } from "lucide-react"; // install lucide-react if not installed

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  // For eye toggle
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({ ...form, [name]: value });

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/register", {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      });

      navigate("/login");
    } catch (err) {
      const data = err.response?.data;

      if (data?.errors) {
        const normalizedErrors = Object.fromEntries(
          Object.entries(data.errors).map(([key, value]) => [
            key.charAt(0).toLowerCase() + key.slice(1),
            value,
          ])
        );
        setErrors(normalizedErrors);
      } else if (data?.message) {
        setError(data.message);
      } else {
        setError("Registration failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="padding-x py-4 sm:py-10  flex items-center justify-center bg-[#f1f1f1] bg-[url(/images/airplane-wing-clouds-from-window-view.jpg)] bg-cover bg-center bg-no-repeat">
        <div className="bg-charcoal/40 p-8 rounded-3xl shadow-md w-full max-w-lg mt-16 sm:mt-12">
          <h2 className="text-xl sm:text-3xl font-bold mb-4 text-center text-creame ">
            Create Account
          </h2>

          {error && (
            <div className="bg-red-100 text-red-700 p-2 mb-4 rounded text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <div className="register-group ">
              <label htmlFor="fullName" className="register-label ">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                placeholder="John Doe"
                value={form.fullName}
                onChange={handleChange}
                required
                className="register-input"
              />
              <div></div>
              {errors.fullName && <p className="error-message">{errors.fullName[0]}</p>}
            </div>

            <div className="register-group">
              <label htmlFor="email" className="register-label">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={handleChange}
                required
                className="register-input"
              />
              <div></div>
              {errors.email && <p className="error-message">{errors.email[0]}</p>}
            </div>

{/* Password Field */}
<div className="register-group relative">
  <label htmlFor="password" className="register-label">
    Password
  </label>
  <input
    type={showPassword ? "text" : "password"}
    name="password"
    placeholder="Password"
    value={form.password}
    onChange={handleChange}
    required
    className="register-input pr-10"
  />
  <div></div>
  {form.password && (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-2 top-11 sm:top-4 text-gray-400"
    >
      {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
    </button>
  )}
  {errors.password && <p className="error-message">{errors.password[0]}</p>}
</div>

{/* Confirm Password Field */}
<div className="register-group relative">
  <label htmlFor="confirmPassword" className="register-label">
    Confirm Password
  </label>
  <input
    type={showConfirmPassword ? "text" : "password"}
    name="confirmPassword"
    placeholder="Confirm Password"
    value={form.confirmPassword}
    onChange={handleChange}
    required
    className="register-input pr-10"
  />
  {form.confirmPassword && (
    <button
      type="button"
      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
      className="absolute right-2 top-11 sm:top-4 text-gray-400"
    >
      {showConfirmPassword ? <EyeOff size={22} /> : <Eye size={22} />}
    </button>
  )}
  {errors.confirmPassword && (
    <p className="error-message">{errors.confirmPassword[0]}</p>
  )}
</div>


        <button type="submit" disabled={loading} className="register-btn">
          {loading ? "Creating Account..." : "Register"}
        </button>
            {/* <div className="register-group">
              <label htmlFor="password" className="register-label">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                className="register-input"
              />
              <div></div>
              {errors.password && <p className="error-message">{errors.password[0]}</p>}
            </div>

            <div className="register-group">
              <label htmlFor="confirmPassword" className="register-label">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="register-input"
              />
              {errors.confirmPassword && <p className="error-message">{errors.confirmPassword[0]}</p>}
            </div>

            <button type="submit" disabled={loading} className="register-btn">
              {loading ? "Creating Account..." : "Register"}
            </button> */}
          </form>

          {/* rest of your UI stays exactly the same */}
          <div className="mt-6 flex items-center justify-center gap-1">
            <input
              type="checkbox"
              id="subscribe"
              name="subscribe"
              value="yes"
              className=" w-3 h-3 text-blue-600 bg-white/10 border-gray-300 rounded focus:ring-pumpkin focus:ring-2"
            />
            <label htmlFor="subscribe" className="text-sm/1 text-[#d8d8d8]">
              By signing up, you agree to our
            </label>
            <br />
            <button
              onClick={() => navigate("/terms")}
              className="text-sm/2 text-blue-600 hover:underline"
            >
              Terms & Conditions
            </button>
          </div>
          <div className="mt-6">
            <p className="text-sm/1 text-center text-[#d8d8d8]">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-blue-600 cursor-pointer hover:underline"
              >
                Login
              </span>
            </p>
          </div>

          {/* Third Party Login */}
          <div className="flex items-center justify-center gap-4 mt-6 mb-8 text-white">
            <div className="w-full pb-6">
              <div className="bg-pumpkin w-full h-1 rounded-full flex justify-center py-">
                <button
                  onClick={() => navigate("/apple-login")}
                  className="flex items-center justify-center gap-2 w-full rounded-xl p-6 bg-white hover:bg-[#d8d8d8] transition-colors mt-3"
                >
                  <img
                    src="/images/google-icon-logo-svgrepo-com.svg"
                    className="w-5 h-5"
                    alt=""
                  />
                  <p className="text-charcoal ">Google</p>
                </button>
              </div>
            </div>
            <div className="w-full pb-6">
              <div className="bg-pumpkin-100 w-full h-1 rounded-full flex justify-center">
                <button
                  onClick={() => navigate("/google-login")}
                  className="flex items-center justify-center gap-2 w-full rounded-xl p-6 bg-white hover:bg-[#d8d8d8] transition-colors mt-3"
                >
                  <img
                    src="/images/apple-black-logo-svgrepo-com.svg"
                    className="w-5 h-5"
                    alt=""
                  />
                  <p className="text-charcoal ">Apple</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
