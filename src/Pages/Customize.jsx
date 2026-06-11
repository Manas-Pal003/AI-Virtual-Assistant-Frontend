import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ImagePlus } from "lucide-react";
import axiosClient from "../api/axiosClient";
import { UserContext } from "../context/UserContext";

import img1 from "../assets/image1.png";
import img2 from "../assets/image2.jpg";
import img3 from "../assets/image6.jpeg";
import img4 from "../assets/image4.png";
import img5 from "../assets/image5.png";

const assistantImages = [
  { id: 1, image: img1, name: "Nova" },
  { id: 2, image: img2, name: "Luna" },
  { id: 3, image: img3, name: "Echo" },
  { id: 4, image: img4, name: "Orion" },
  { id: 5, image: img5, name: "Aura" },
];

const Customize = () => {
  const navigate = useNavigate();
  const { setUserData } = useContext(UserContext);

  const [assistantName, setAssistantName] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [customImageFile, setCustomImageFile] = useState(null);
  const [customPreview, setCustomPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="min-h-screen w-full bg-slate-950 text-white relative overflow-hidden px-4 py-10 flex items-center justify-center">
      <div className="absolute top-[-180px] left-[-160px] w-[480px] h-[480px] bg-cyan-500/25 rounded-full blur-[140px]" />
      <div className="absolute bottom-[-180px] right-[-150px] w-[520px] h-[520px] bg-purple-500/25 rounded-full blur-[150px]" />
      <div className="absolute top-[35%] left-[50%] w-[420px] h-[420px] bg-blue-500/10 rounded-full blur-[150px] -translate-x-1/2" />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-6xl rounded-[34px] bg-white/10 border border-white/10 backdrop-blur-xl shadow-2xl p-6 sm:p-8 lg:p-10"
      >
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-flex items-center rounded-full bg-white/10 border border-white/10 px-5 py-2 text-sm text-cyan-100 mb-5">
            Customize your AI assistant
          </span>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Choose Your Assistant
          </h1>

          <p className="text-slate-300 mt-4 text-lg">
            Select one of your assistant images or upload your own image from
            your device.
          </p>
        </div>

        <div className="max-w-xl mx-auto mb-10">
          <label className="block text-sm font-semibold text-slate-200 mb-3">
            Assistant Name
          </label>

          <input
            type="text"
            value={assistantName}
            onChange={(e) => setAssistantName(e.target.value)}
            placeholder="Example: Nova"
            className="w-full h-[56px] px-5 rounded-2xl border border-white/10 bg-white text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition"
          />
        </div>

        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
            <div>
              <h2 className="text-2xl font-bold">Select Avatar</h2>
              <p className="text-slate-400 mt-1">
                Large cards from your assets folder
              </p>
            </div>

            {previewImage && (
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 border border-white/10 px-4 py-3">
                <img
                  src={previewImage}
                  alt="Selected assistant"
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <p className="text-xs text-slate-400">Selected</p>
                  <p className="font-semibold">
                    {assistantName || "Assistant"}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {assistantImages.map((item) => {
              const isActive = selectedImage === item.image && !customPreview;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectPreset(item)}
                  className={`relative overflow-hidden rounded-[28px] border-2 bg-white/5 transition group ${
                    isActive
                      ? "border-cyan-400 ring-4 ring-cyan-400/20"
                      : "border-white/10 hover:border-cyan-300"
                  }`}
                >
                  <div className="h-[260px] sm:h-[280px] lg:h-[300px] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-left">
                    <p className="text-xl font-bold text-white">{item.name}</p>
                    <p className="text-sm text-white/70">Tap to select</p>
                  </div>

                  {isActive && (
                    <span className="absolute top-4 right-4 w-10 h-10 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-lg">
                      <Check size={22} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-end">
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-3">
              Upload From Your Device
            </label>

            <label className="cursor-pointer flex items-center justify-center gap-4 w-full min-h-[150px] rounded-[28px] border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 hover:border-cyan-300 transition">
              <ImagePlus size={32} className="text-cyan-300" />

              <div>
                <p className="font-semibold text-white text-lg">
                  Click to upload image
                </p>
                <p className="text-sm text-slate-400">
                  PNG, JPG, JPEG supported
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
              <div className="mt-4 flex items-center gap-4 rounded-2xl bg-white/10 border border-white/10 p-3">
                <img
                  src={customPreview}
                  alt="Custom preview"
                  className="w-16 h-16 rounded-2xl object-cover"
                />
                <div>
                  <p className="font-semibold text-white">
                    Custom image selected
                  </p>
                  <p className="text-sm text-slate-400">
                    {customImageFile?.name}
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full lg:w-[280px] h-[58px] rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : "Continue to Dashboard"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Customize;