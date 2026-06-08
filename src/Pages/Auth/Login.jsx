import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import axiosClient from "../../Api/axiosClient";
import { saveAuth } from "../../utils/auth";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert("Email and password are required");
      return;
    }

    try {
      setIsLoading(true);

      const response = await axiosClient.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const { user, token, message } = response.data;

      if (!user || !token) {
        alert("Invalid login response from server");
        return;
      }

      saveAuth(user, token);

      alert(message || "Login successful!");

      if (user.role === "Admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error", error);

      alert(
        error.response?.data?.message ||
        "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-120px] left-[-120px] w-[350px] h-[350px] bg-blue-500/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-120px] right-[-120px] w-[350px] h-[350px] bg-purple-500/30 rounded-full blur-[120px]" />

      <div className="relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">

        {/* Left Side */}
        <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
          <div>
            <h1 className="text-4xl font-bold leading-tight">
              Welcome Back to <br /> AI Assistant
            </h1>
            <p className="mt-5 text-white/80 text-lg">
              Login to continue using your smart virtual assistant for chat,
              voice commands, automation, and productivity.
            </p>
          </div>

          <div className="bg-white/15 border border-white/20 rounded-2xl p-5">
            <p className="text-sm text-white/80">
              “Your personal AI assistant is ready to help you work faster,
              smarter, and better.”
            </p>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="p-8 sm:p-12 bg-white">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Login</h2>
            <p className="text-slate-500 mt-2">
              Enter your details to access your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full h-12 px-4 pr-12 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 flex items-center justify-center"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Remember me
              </label>

              <Link
                to="/forgot-password"
                className="text-blue-600 font-medium hover:text-blue-700"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-sm text-slate-400">or</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          {/* Google Button */}
          <button className="w-full h-12 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 transition">
            Continue with Google
          </button>

          <p className="text-center text-sm text-slate-500 mt-7">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-semibold hover:text-blue-700"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;