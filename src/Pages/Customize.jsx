import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ImagePlus, Sparkles, Bot, Loader2 } from "lucide-react";
import axiosClient from "../api/axiosClient";
import { UserContext } from "../context/UserContext";

import img1 from "../assets/image1.png";
import img2 from "../assets/image2.jpg";
import img3 from "../assets/image6.jpeg";
import img4 from "../assets/image4.png";
import img5 from "../assets/image5.png";
import img6 from "../assets/authBg.png";

const assistantImages = [
  { id: 1, image: img1, name: "Nova" },
  { id: 2, image: img2, name: "Luna" },
  { id: 3, image: img3, name: "Echo" },
  { id: 4, image: img4, name: "Orion" },
  { id: 5, image: img5, name: "Aura" },
  { id: 6, image: img6, name: "Human" },
];

const Customize = () => {
  const navigate = useNavigate();
  const { userData, setUserData } = useContext(UserContext);

  const [assistantName, setAssistantName] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [customImageFile, setCustomImageFile] = useState(null);
  const [customPreview, setCustomPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Pre-populate data if user already has an assistant profile
  useEffect(() => {
    if (userData) {
      if (userData.assistantName && !assistantName) {
        setAssistantName(userData.assistantName);
      }
      if (userData.assistantImage && !selectedImage && !customPreview) {
        const imagePath = userData.assistantImage;
        const isPreset = assistantImages.some(item => item.image === imagePath);
        
        if (isPreset) {
          setSelectedImage(imagePath);
        } else {
          const fullPreviewUrl = imagePath.startsWith("/public")
            ? `http://${window.location.hostname}:8000${imagePath}`
            : imagePath;
          setCustomPreview(fullPreviewUrl);
        }
      }
    }
  }, [userData]);

  const handleSelectPreset = (item) => {
    setSelectedImage(item.image);
    setCustomImageFile(null);
    setCustomPreview(null);

    if (!assistantName) {
      setAssistantName(item.name);
    }
  };

  const handleCustomImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setCustomImageFile(file);
    setCustomPreview(URL.createObjectURL(file));
    setSelectedImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!assistantName.trim()) {
      alert("Please enter assistant name");
      return;
    }

    if (!selectedImage && !customImageFile) {
      alert("Please select or upload assistant image");
      return;
    }

    try {
      setIsLoading(true);

      const data = new FormData();
      data.append("assistantName", assistantName);

      if (customImageFile) {
        data.append("assistantImage", customImageFile);
      } else {
        data.append("assistantImageUrl", selectedImage);
      }

      const response = await axiosClient.post("/users/customize", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.user) {
        setUserData(response.data.user);
      }

      alert(response.data.message || "Assistant customized successfully");
      navigate("/dashboard");
    } catch (error) {
      console.error("Customize error", error);

      alert(
        error.response?.data?.message ||
        "Something went wrong while saving assistant."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const previewImage = customPreview || selectedImage;

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white relative overflow-y-auto px-3 sm:px-6 py-6 sm:py-12 flex flex-col items-center justify-center animate-fade-in">
      {/* Background decoration elements */}
      <div className="absolute top-[-180px] left-[-160px] w-[480px] h-[480px] bg-cyan-500/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-180px] right-[-150px] w-[520px] h-[520px] bg-purple-500/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[35%] left-[50%] w-[420px] h-[420px] bg-blue-500/10 rounded-full blur-[150px] -translate-x-1/2 pointer-events-none" />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-6xl rounded-3xl sm:rounded-[34px] bg-slate-900/40 border border-white/10 backdrop-blur-2xl shadow-2xl p-4 sm:p-8 lg:p-10"
      >
        {/* Header section */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <span className="inline-flex items-center rounded-full bg-cyan-500/10 border border-cyan-500/20 px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm text-cyan-300 mb-4 sm:mb-5 font-medium tracking-wide">
            <Sparkles size={13} className="mr-1.5 sm:mr-2 text-cyan-400 animate-pulse" />
            Customize your AI assistant
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Choose Your Assistant
          </h1>

          <p className="text-slate-400 mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
            Select one of your assistant images or upload your own image from your device.
          </p>
        </div>

        {/* Input section */}
        <div className="max-w-xl mx-auto mb-10 sm:mb-12">
          <label className="block text-sm font-semibold text-slate-300 mb-2.5 sm:mb-3 tracking-wide text-center">
            Assistant Name
          </label>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none">
              <Bot size={18} className="text-slate-500 group-focus-within:text-cyan-400 transition-colors duration-300" />
            </div>
            <input
              type="text"
              value={assistantName}
              onChange={(e) => setAssistantName(e.target.value)}
              placeholder="Example: Jarvis"
              className="w-full h-12 sm:h-[58px] pl-10 sm:pl-12 pr-4 sm:pr-5 rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:bg-white/10 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-300 text-center text-base sm:text-lg"
            />
          </div>
        </div>

        {/* Preset Selection section */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 border-b border-white/5 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Select Avatar</h2>
              <p className="text-slate-400 mt-1 text-xs sm:text-sm">
                Choose a pre-configured personality card from your assets
              </p>
            </div>

            {previewImage && (
              <div className="flex items-center gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 p-2 sm:p-2.5 backdrop-blur-md shadow-lg shrink-0 w-full sm:w-auto">
                <img
                  src={previewImage}
                  alt="Selected assistant"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl object-cover ring-2 ring-cyan-400"
                />
                <div>
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Selected Assistant</p>
                  <p className="font-semibold text-xs sm:text-sm text-cyan-300">
                    {assistantName || "Assistant"}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-5">
            {assistantImages.map((item) => {
              const isActive = selectedImage === item.image && !customPreview;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectPreset(item)}
                  className={`relative overflow-hidden rounded-2xl border-2 bg-white/5 transition-all duration-300 group hover:-translate-y-1.5 hover:shadow-lg cursor-pointer ${isActive
                      ? "border-cyan-400 ring-4 ring-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.15)] bg-cyan-950/20"
                      : "border-white/10 hover:border-cyan-500/50 hover:bg-white/10"
                    }`}
                >
                  <div className="w-full aspect-[3/4] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-out"
                    />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/40 to-transparent text-left">
                    <p className="text-base sm:text-lg font-bold text-white tracking-tight">{item.name}</p>
                    <p className="text-[10px] sm:text-xs text-white/60 mt-0.5">Select preset</p>
                  </div>

                  {isActive && (
                    <span className="absolute top-2.5 right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-lg border border-white/20">
                      <Check size={14} className="sm:w-4 sm:h-4" strokeWidth={2.5} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Upload and Submit section */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 sm:gap-8 items-stretch border-t border-white/5 pt-8 sm:pt-10">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3 tracking-wide">
              Upload From Your Device
            </label>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch">
              <label className="cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-4 flex-1 min-h-[120px] sm:min-h-[140px] p-4 sm:px-6 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-400 transition-all duration-300 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 group-hover:scale-110 transition duration-300">
                  <ImagePlus size={20} className="sm:w-6 sm:h-6" />
                </div>

                <div className="text-center sm:text-left">
                  <p className="font-semibold text-white text-sm sm:text-base">
                    Upload custom avatar
                  </p>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">
                    PNG, JPG, or JPEG supported
                  </p>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomImage}
                  className="hidden"
                />
              </label>

              {customPreview && (
                <div className="relative overflow-hidden rounded-2xl border-2 border-cyan-400 bg-cyan-950/20 shadow-[0_0_20px_rgba(34,211,238,0.15)] flex flex-row sm:flex-col w-full sm:w-[130px] h-[100px] sm:h-auto sm:aspect-[3/4] shrink-0 group items-center sm:items-stretch p-3 sm:p-0 gap-3 sm:gap-0">
                  <div className="w-16 sm:w-full h-16 sm:h-full overflow-hidden relative rounded-xl sm:rounded-none shrink-0">
                    <img
                      src={customPreview}
                      alt="Custom preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>

                  <div className="flex-1 sm:absolute sm:inset-x-0 sm:bottom-0 p-0 sm:p-3 sm:bg-gradient-to-t sm:from-black/95 sm:to-transparent text-left">
                    <p className="text-sm font-bold text-white truncate">
                      {assistantName || "Custom"}
                    </p>
                    <p className="text-[10px] text-cyan-300 mt-0.5">Uploaded</p>
                  </div>

                  <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-lg border border-white/20">
                    <Check size={12} strokeWidth={3} />
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 sm:h-[58px] rounded-xl sm:rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold tracking-wide shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-white sm:w-[18px] sm:h-[18px]" />
                  Saving Configuration...
                </>
              ) : (
                <>
                  Continue to Dashboard
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Customize;