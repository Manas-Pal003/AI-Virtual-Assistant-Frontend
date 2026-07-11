import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ImagePlus, Sparkles, Bot, Loader2 } from "lucide-react";
import axiosClient, { API_URL } from "../api/axiosClient";
import { UserContext } from "../context/UserContext";
import { useNotification } from "../context/NotificationContext";

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
  const { showSuccess, showError } = useNotification();

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
          const fullPreviewUrl = imagePath.startsWith("/public")
            ? `${API_URL}${imagePath}`
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
      showError("Please enter assistant name");
      return;
    }

    if (!selectedImage && !customImageFile) {
      showError("Please select or upload assistant image");
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

      showSuccess(response.data.message || "Assistant customized successfully");
      navigate("/dashboard");
    } catch (error) {
      console.error("Customize error", error);

      showError(
        error.response?.data?.message ||
        "Something went wrong while saving assistant."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const previewImage = customPreview || selectedImage;

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white relative px-4 sm:px-6 py-6 sm:py-8 flex flex-col items-center justify-center animate-fade-in">
      {/* Background decoration elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-180px] left-[-160px] w-[480px] h-[480px] bg-cyan-500/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-180px] right-[-150px] w-[520px] h-[520px] bg-purple-500/20 rounded-full blur-[150px]" />
        <div className="absolute top-[35%] left-[50%] w-[420px] h-[420px] bg-blue-500/10 rounded-full blur-[150px] -translate-x-1/2" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-4xl rounded-2xl sm:rounded-[28px] bg-slate-900/40 border border-white/10 backdrop-blur-2xl shadow-2xl p-5 sm:p-7 lg:p-8"
      >
        {/* Header section */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-7">
          <span className="inline-flex items-center rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs text-cyan-300 mb-2.5 sm:mb-3 font-medium tracking-wide">
            <Sparkles size={12} className="mr-1.5 text-cyan-400 animate-pulse" />
            Customize your AI assistant
          </span>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Choose Your Assistant
          </h1>

          <p className="text-slate-400 mt-1.5 sm:mt-2 text-xs sm:text-sm max-w-xl mx-auto">
            Select one of your assistant images or upload your own image from your device.
          </p>
        </div>

        {/* Input section */}
        <div className="max-w-md mx-auto mb-6 sm:mb-8">
          <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1.5 sm:mb-2 tracking-wide text-center">
            Assistant Name
          </label>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Bot size={16} className="text-slate-500 group-focus-within:text-cyan-400 transition-colors duration-300" />
            </div>
            <input
              type="text"
              value={assistantName}
              onChange={(e) => setAssistantName(e.target.value)}
              placeholder="Example: Jarvis"
              className="w-full h-10 sm:h-12 pl-10 pr-4 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:bg-white/10 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-300 text-center text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Preset Selection section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4 border-b border-white/5 pb-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">Select Avatar</h2>
              <p className="text-slate-400 mt-0.5 text-[11px] sm:text-xs">
                Choose a pre-configured personality card from your assets
              </p>
            </div>

            {previewImage && (
              <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 p-1.5 sm:p-2 backdrop-blur-md shadow-lg shrink-0 w-full sm:w-auto">
                <img
                  src={previewImage}
                  alt="Selected assistant"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover ring-2 ring-cyan-400"
                />
                <div>
                  <p className="text-[8px] sm:text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Selected Assistant</p>
                  <p className="font-semibold text-xs text-cyan-300 leading-tight">
                    {assistantName || "Assistant"}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3.5">
            {assistantImages.map((item) => {
              const isActive = selectedImage === item.image && !customPreview;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectPreset(item)}
                  className={`relative overflow-hidden rounded-xl border-2 bg-white/5 transition-all duration-300 group hover:-translate-y-1 hover:shadow-md cursor-pointer ${isActive
                      ? "border-cyan-400 ring-4 ring-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.15)] bg-cyan-950/20"
                      : "border-white/10 hover:border-cyan-500/50 hover:bg-white/10"
                    }`}
                >
                  <div className="w-full aspect-[3/4] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
                    />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3 bg-gradient-to-t from-black/95 via-black/40 to-transparent text-left">
                    <p className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight">{item.name}</p>
                    <p className="text-[9px] sm:text-[10px] text-white/60 mt-0.5">Select preset</p>
                  </div>

                  {isActive && (
                    <span className="absolute top-1.5 right-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-lg border border-white/20">
                      <Check size={11} className="sm:w-3 sm:h-3" strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Upload and Submit section */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-5 items-stretch border-t border-white/5 pt-5 sm:pt-6">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2 tracking-wide">
              Upload From Your Device
            </label>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch">
              <label className="cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-3 flex-1 min-h-[75px] sm:min-h-[85px] p-3 sm:px-5 rounded-xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-400 transition-all duration-300 group">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 group-hover:scale-105 transition duration-300">
                  <ImagePlus size={16} className="sm:w-5 sm:h-5" />
                </div>

                <div className="text-center sm:text-left">
                  <p className="font-semibold text-white text-xs sm:text-sm">
                    Upload custom avatar
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
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
                <div className="relative overflow-hidden rounded-xl border-2 border-cyan-400 bg-cyan-950/20 shadow-[0_0_15px_rgba(34,211,238,0.15)] flex flex-row sm:flex-col w-full sm:w-[110px] h-[75px] sm:h-auto sm:aspect-[3/4] shrink-0 group items-center sm:items-stretch p-2 sm:p-0 gap-2.5 sm:gap-0">
                  <div className="w-12 sm:w-full h-12 sm:h-full overflow-hidden relative rounded-lg sm:rounded-none shrink-0">
                    <img
                      src={customPreview}
                      alt="Custom preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>

                  <div className="flex-1 sm:absolute sm:inset-x-0 sm:bottom-0 p-0 sm:p-2 sm:bg-gradient-to-t sm:from-black/95 sm:to-transparent text-left">
                    <p className="text-xs font-bold text-white truncate leading-tight">
                      {assistantName || "Custom"}
                    </p>
                    <p className="text-[9px] text-cyan-300 mt-0.5">Uploaded</p>
                  </div>

                  <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-lg border border-white/20">
                    <Check size={10} strokeWidth={3} />
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 sm:h-12 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold tracking-wide shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin text-white sm:w-4 sm:h-4" />
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