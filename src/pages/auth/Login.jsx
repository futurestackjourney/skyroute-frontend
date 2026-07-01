import { useState, useContext } from "react";
import api from "../../api/api";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

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
    setErrors({});
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      if (!data?.accessToken) throw new Error("Access token missing");

      login(data.accessToken);

      const decoded = jwtDecode(data.accessToken);
      const role =
        decoded.role ||
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      if (role?.toLowerCase() === "admin") navigate("/admin/dashboard");
      // if (role?.toLowerCase() === "staff") navigate("/staf");
      else navigate("/user/profile");
    } catch (err) {
      const data = err.response?.data;

      if (data?.errors) {
        // Normalize keys to camelCase
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
        setError("Invalid credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="padding-x py-18 sm:py-24 flex items-center justify-center bg-[#f1f1f1] bg-[url(/images/airplane-wing-clouds-from-window-view.jpg)] bg-cover bg-center bg-no-repeat lazyload">
      <div className="bg-charcoal/40 p-8 rounded-3xl shadow-md w-full h-max max-w-md">
        <h2 className="text-xl sm:text-3xl font-bold mb-4 text-center text-creame">
          Welcome Back
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          {/* Email Field */}
          <div className="login-group">
            <label htmlFor="email" className="register-label">
              Email address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="login-input"
            />
            {errors.email && (
              <p className="error-message">{errors.email[0]}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="login-group relative">
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
              className="login-input pr-10"
            />
            {form.password && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-12.5 -translate-y-1/2 text-gray-400"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            )}
            {errors.password && (
              <p className="error-message">{errors.password[0]}</p>
            )}
          </div>

          <div className="text-sm text-end">
            <a
              href="#"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Forgot password?
            </a>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="login-btn"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#d8d8d8]">
            Don't have an account?{" "}
            <a
              href="/register"
              className="font-semibold text-indigo-600 hover:underline"
            >
              Sign up
            </a>
          </p>
        </div>

        {/* Third Party Login */}
        <div className="flex items-center justify-center gap-4 mt-6 mb-8 text-white">
          <div className="w-full pb-6">
            <div className="bg-pumpkin w-full h-1 rounded-full flex justify-center py-">
              <button
                onClick={() => navigate("/google-login")}
                className="flex items-center justify-center gap-2 w-full rounded-xl p-6 bg-white mt-3"
              >
                <img
                  src="/images/google-icon-logo-svgrepo-com.svg"
                  className="w-5 h-5"
                  alt=""
                />
                <p className="text-charcoal">Google</p>
              </button>
            </div>
          </div>
          <div className="w-full pb-6">
            <div className="bg-pumpkin-100 w-full h-1 rounded-full flex justify-center">
              <button
                onClick={() => navigate("/apple-login")}
                className="flex items-center justify-center gap-2 w-full rounded-xl p-6 bg-white mt-3"
              >
                <img
                  src="/images/apple-black-logo-svgrepo-com.svg"
                  className="w-5 h-5"
                  alt=""
                />
                <p className="text-charcoal">Apple</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
