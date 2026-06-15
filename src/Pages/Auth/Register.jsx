import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import { UserContext } from "../../context/UserContext";
import { saveAuth } from "../../utils/auth";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { userData, setUserData } = useContext(UserContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGoogleLogin = async (email, name) => {
    setShowGoogleModal(false);
    setError("");
    setSuccess("");

    try {
      setIsLoading(true);

      const response = await axiosClient.post("/auth/google-mock", { email, name });
      setUserData(response.data.user);

      const { user, token } = response.data;
      saveAuth(user, token);

      const hasAssistantProfile = user.assistantName && user.assistantImage;

      if (hasAssistantProfile) {
        navigate("/dashboard");
      } else {
        navigate("/customize");
      }
    } catch (err) {
      console.error("Google login error", err);
      setError(
        err.response?.data?.message ||
        "Google Sign-In failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("All fields are required");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);

      const response = await axiosClient.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      setSuccess(response.data.message || "Registration successful! Redirecting to login...");
      
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      console.error("Register error", err);

      setError(
        err.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center px-4 py-8 sm:py-12 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-120px] right-[-120px] w-[380px] h-[380px] bg-cyan-500/30 rounded-full blur-[130px]" />
        <div className="absolute bottom-[-120px] left-[-120px] w-[380px] h-[380px] bg-purple-500/30 rounded-full blur-[130px]" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[140px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
        
        {/* Left Side */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-cyan-600 via-blue-600 to-purple-800 text-white relative lg:rounded-l-[30px] rounded-t-[30px] lg:rounded-tr-none">
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-center mb-8 shadow-lg">
              <span className="text-xl font-extrabold tracking-wider text-cyan-300">AI</span>
            </div>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
              Create Your <br /> AI Assistant Account
            </h1>

            <p className="mt-6 text-white/80 text-lg leading-relaxed">
              Start using your smart virtual assistant for voice commands, chat,
              task help, automation, and productivity.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-4">
            <div className="bg-white/10 border border-white/15 rounded-2xl p-5 shadow-md">
              <h3 className="font-bold text-cyan-300">Voice Chat</h3>
              <p className="text-xs text-white/75 mt-1 leading-relaxed">
                Speak naturally with your virtual assistant.
              </p>
            </div>

            <div className="bg-white/10 border border-white/15 rounded-2xl p-5 shadow-md">
              <h3 className="font-bold text-purple-300">Smart Tasks</h3>
              <p className="text-xs text-white/75 mt-1 leading-relaxed">
                Get answers and complete work faster.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side Form (Glassmorphic) */}
        <div className="p-5 sm:p-12 lg:p-14 bg-slate-950/40 text-white flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-white/10 lg:rounded-r-[30px] rounded-b-[30px] lg:rounded-bl-none">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Create Account
            </h2>
            <p className="text-slate-400 mt-2 text-sm sm:text-base">
              Fill in your details to get started.
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
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2 tracking-wide">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:bg-white/10 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-300"
                required
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2 tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:bg-white/10 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-300"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2 tracking-wide">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create password"
                  value={formData.password}
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2 tracking-wide">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full h-12 px-4 pr-12 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:bg-white/10 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-300"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white flex items-center justify-center transition duration-200 cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Agree Terms */}
            <label className="flex items-start gap-3 text-sm text-slate-300 cursor-pointer select-none leading-relaxed">
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-slate-950 focus:bg-white/10 cursor-pointer"
                required
              />
              <span>
                I agree to the{" "}
                <Link to="/terms" className="text-cyan-400 font-semibold hover:text-cyan-300 transition duration-200">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-cyan-400 font-semibold hover:text-cyan-300 transition duration-200">
                  Privacy Policy
                </Link>
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold tracking-wide shadow-lg shadow-blue-500/15 hover:shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">or</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={() => setShowGoogleModal(true)}
            className="w-full h-12 rounded-xl border border-white/10 bg-white/5 text-white font-medium hover:bg-white/10 active:scale-[0.99] transition duration-300 flex items-center justify-center gap-3 cursor-pointer"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.23-.63-.35-1.3-.35-1.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-cyan-400 font-bold hover:text-cyan-300 transition duration-200"
            >
              Login
            </Link>
          </p>
        </div>
      </div>

      {/* Mock Google Login Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl text-white">
            <div className="p-6 border-b border-white/10 flex flex-col items-center">
              <svg className="w-8 h-8 mb-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.23-.63-.35-1.3-.35-1.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <h3 className="text-xl font-bold">Choose an account</h3>
              <p className="text-xs text-slate-400 mt-1">to continue to AI Virtual Assistant</p>
            </div>

            <div className="p-4 space-y-2">
              {[
                { name: "Manas", email: "manasac2026@gmail.com", avatar: "M" },
                { name: "Guest User", email: "guest.virtual@gmail.com", avatar: "G" },
                { name: "Demo User", email: "demo.assistant@gmail.com", avatar: "D" }
              ].map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleGoogleLogin(acc.email, acc.name)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 active:bg-white/10 transition duration-200 text-left border border-transparent hover:border-white/5 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-md">
                    {acc.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{acc.name}</p>
                    <p className="text-xs text-slate-400 truncate">{acc.email}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;