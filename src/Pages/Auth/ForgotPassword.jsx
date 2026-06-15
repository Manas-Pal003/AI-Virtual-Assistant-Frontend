import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import axiosClient from "../../api/axiosClient";

const ForgotPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.email || !formData.newPassword || !formData.confirmNewPassword) {
      setError("All fields are required");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);

      const response = await axiosClient.post("/auth/forgot-password", {
        email: formData.email,
        newPassword: formData.newPassword,
      });

      setSuccess(response.data.message || "Password reset successful!");
      
      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (err) {
      console.error("Forgot password error", err);
      setError(
        err.response?.data?.message ||
        "Failed to reset password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center px-4 py-8 sm:py-12 relative">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-120px] left-[-120px] w-[350px] h-[350px] bg-blue-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-120px] right-[-120px] w-[350px] h-[350px] bg-purple-500/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[32px] p-5 sm:p-10 shadow-2xl text-white">
        
        {/* Back Link */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition duration-200 mb-6"
        >
          <ArrowLeft size={16} />
          Back to Login
        </Link>

        <div className="mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Reset Password</h2>
          <p className="text-slate-400 mt-2 text-sm">
            Enter your email and choose a new password to reset it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm font-medium animate-fade-in">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm font-medium animate-fade-in">
              {success}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2 tracking-wide">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your registered email"
              value={formData.email}
              onChange={handleChange}
              className="w-full h-12 px-4 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:bg-white/10 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-300"
              required
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2 tracking-wide">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full h-12 px-4 pr-12 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:bg-white/10 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-300"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white flex items-center justify-center transition duration-200 cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2 tracking-wide">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmNewPassword"
                placeholder="Confirm new password"
                value={formData.confirmNewPassword}
                onChange={handleChange}
                className="w-full h-12 px-4 pr-12 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:bg-white/10 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-300"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white flex items-center justify-center transition duration-200 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold tracking-wide shadow-lg shadow-blue-500/15 hover:shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
