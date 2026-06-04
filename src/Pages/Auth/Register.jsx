import { useState } from "react";
import { Link } from "react-router-dom";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // Later connect register API here
    console.log("Register submitted", formData);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-120px] right-[-120px] w-[380px] h-[380px] bg-cyan-500/30 rounded-full blur-[130px]" />
      <div className="absolute bottom-[-120px] left-[-120px] w-[380px] h-[380px] bg-purple-500/30 rounded-full blur-[130px]" />
      <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[140px] -translate-x-1/2 -translate-y-1/2" />

      <div className="relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {/* Left Side */}
        <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-cyan-600 via-blue-600 to-purple-700 text-white">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/20 flex items-center justify-center mb-8">
              <span className="text-2xl">AI</span>
            </div>

            <h1 className="text-4xl font-bold leading-tight">
              Create Your <br /> AI Assistant Account
            </h1>

            <p className="mt-5 text-white/80 text-lg leading-relaxed">
              Start using your smart virtual assistant for voice commands, chat,
              task help, automation, and productivity.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/15 border border-white/20 rounded-2xl p-4">
              <h3 className="font-semibold">Voice Chat</h3>
              <p className="text-sm text-white/75 mt-1">
                Speak naturally with your assistant.
              </p>
            </div>

            <div className="bg-white/15 border border-white/20 rounded-2xl p-4">
              <h3 className="font-semibold">Smart Tasks</h3>
              <p className="text-sm text-white/75 mt-1">
                Get answers and complete work faster.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="p-8 sm:p-12 bg-white">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">
              Create Account
            </h2>
            <p className="text-slate-500 mt-2">
              Fill in your details to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                required
              />
            </div>

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
                  placeholder="Create password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full h-12 px-4 pr-14 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 hover:text-slate-800"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full h-12 px-4 pr-14 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 hover:text-slate-800"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                required
              />
              <span>
                I agree to the{" "}
                <Link to="/terms" className="text-blue-600 font-medium">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-blue-600 font-medium">
                  Privacy Policy
                </Link>
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition"
            >
              Create Account
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
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-semibold hover:text-blue-700"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;