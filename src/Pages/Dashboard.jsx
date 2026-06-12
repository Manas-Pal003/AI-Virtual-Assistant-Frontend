import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  LogOut,
  Mic,
  MicOff,
  Send,
  Sparkles,
  User,
  Volume2,
} from "lucide-react";
import axiosClient from "../api/axiosClient";
import { UserContext } from "../context/UserContext";

const API_URL = "http://localhost:8000";

const Dashboard = () => {
  const navigate = useNavigate();
  const { userData, setUserData } = useContext(UserContext);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I am your AI assistant. You can type or use your voice to talk with me.",
    },
  ]);

  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [voices, setVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState(
    localStorage.getItem("preferredVoice") || ""
  );

  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const assistantName = userData?.assistantName || "Assistant";
  const assistantImage = userData?.assistantImage
    ? userData.assistantImage.startsWith("/public")
      ? `${API_URL}${userData.assistantImage}`
      : userData.assistantImage
    : null;

  // Trigger loading voices on page mount
  useEffect(() => {
    if (!window.speechSynthesis) return;

    const updateVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      // Filter for English voices only to keep the selector clean
      const englishVoices = allVoices.filter((v) =>
        v.lang.toLowerCase().startsWith("en")
      );
      setVoices(englishVoices);

      // Auto-select a female voice if no preferred voice is saved yet
      const preferred = localStorage.getItem("preferredVoice");
      if (!preferred && englishVoices.length > 0) {
        const femaleVoiceIdentifiers = [
          "zira",
          "samantha",
          "hazel",
          "victoria",
          "susan",
          "karen",
          "moira",
          "tessa",
          "veena",
          "eva",
          "sally",
          "female",
          "google us english",
          "google uk english female",
          "microsoft zira"
        ];

        const autoFemale = englishVoices.find((v) => {
          const name = v.name.toLowerCase();
          return femaleVoiceIdentifiers.some((id) => name.includes(id));
        });

        if (autoFemale) {
          setSelectedVoiceName(autoFemale.name);
          localStorage.setItem("preferredVoice", autoFemale.name);
        } else {
          setSelectedVoiceName(englishVoices[0].name);
          localStorage.setItem("preferredVoice", englishVoices[0].name);
        }
      } else if (preferred) {
        setSelectedVoiceName(preferred);
      }
    };

    updateVoices();
    window.speechSynthesis.addEventListener("voiceschanged", updateVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", updateVoices);
    };
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const speakText = (text) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1.0;
    utterance.pitch = 1.05; // Slightly higher pitch for standard female clarity

    const allVoices = window.speechSynthesis.getVoices();
    
    // 1. Try to find the user's preferred selected voice
    let voice = allVoices.find((v) => v.name === selectedVoiceName);

    // 2. Fallback to auto-select female voice if preferred not found
    if (!voice) {
      const femaleVoiceIdentifiers = [
        "zira",
        "samantha",
        "hazel",
        "victoria",
        "susan",
        "karen",
        "moira",
        "tessa",
        "veena",
        "eva",
        "sally",
        "female",
        "google us english",
        "google uk english female"
      ];
      voice = allVoices.find((v) => {
        const name = v.name.toLowerCase();
        const lang = v.lang.toLowerCase();
        return (lang.startsWith("en-") || lang.startsWith("en_") || lang === "en") &&
          femaleVoiceIdentifiers.some((id) => name.includes(id));
      });
    }

    if (voice) {
      utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
  };

  const speakVoicePreview = (voiceName) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const cleanName = voiceName.split(" - ")[0];
    const utterance = new SpeechSynthesisUtterance(`Hi! I am now using ${cleanName}`);
    utterance.lang = "en-US";
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    const allVoices = window.speechSynthesis.getVoices();
    const voice = allVoices.find((v) => v.name === voiceName);

    if (voice) {
      utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (inputText = message) => {
    const finalMessage = inputText.trim();

    if (!finalMessage) return;

    const userMessage = {
      role: "user",
      text: finalMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");

    try {
      setIsLoading(true);

      const response = await axiosClient.post("/assistant/ask", {
  message: finalMessage,
});

      const reply =
        response.data.reply ||
        response.data.message ||
        "I received your message, but I could not generate a reply.";

      const assistantMessage = {
        role: "assistant",
        text: reply,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      speakText(reply);

      if (response.data.type === "command" && response.data.url) {
        window.open(response.data.url, "_blank");
      }
    } catch (error) {
  console.error("AI chat error full:", error);
  console.error("Status:", error.response?.status);
  console.error("Backend data:", error.response?.data);

  const fallbackReply =
    error.response?.data?.message ||
    error.response?.data?.error ||
    `AI request failed. Status: ${error.response?.status || "Network Error"}`;

  setMessages((prev) => [
    ...prev,
    {
      role: "assistant",
      text: fallbackReply,
    },
  ]);

  speakText(fallbackReply);
} finally {
  setIsLoading(false);
}
  };

  const handleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.start();
    setIsListening(true);

    recognition.onresult = (event) => {
      const voiceText = event.results[0][0].transcript;
      setMessage(voiceText);
      handleSendMessage(voiceText);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const handleLogout = async () => {
    try {
      await axiosClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUserData(null);
      navigate("/login");
    }
  };

  return (
    <div style={{ height: "100vh", overflow: "hidden" }} className="w-full bg-slate-950 text-white relative flex flex-col animate-fade-in">
      {/* Background decoration elements */}
      <div className="absolute top-[-180px] left-[-160px] w-[520px] h-[520px] bg-cyan-500/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-180px] right-[-160px] w-[560px] h-[560px] bg-purple-500/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[35%] left-[45%] w-[420px] h-[420px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Header section */}
      <header className="h-20 shrink-0 border-b border-white/10 bg-slate-900/40 backdrop-blur-xl z-20 flex items-center relative">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 overflow-hidden ring-2 ring-white/10 shrink-0">
              {assistantImage ? (
                <img
                  src={assistantImage}
                  alt={assistantName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Bot size={24} className="text-white" />
              )}
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                {assistantName}
              </h1>
              <p className="text-xs text-slate-400">
                Your personal AI virtual assistant
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 hover:bg-red-500/20 active:scale-[0.98] transition duration-300 cursor-pointer shrink-0"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline font-medium text-sm">Logout</span>
          </button>
        </div>
      </header>

      {/* Main content grid */}
      <main className="relative z-10 flex-1 min-h-0 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 overflow-y-auto ">
        
        {/* Sidebar */}
        <aside className="rounded-[32px] bg-slate-900/40 border border-white/10 backdrop-blur-2xl p-6 shadow-2xl h-fit lg:h-full flex flex-col items-center justify-between shrink-0 lg:overflow-y-auto w-full">
          <div className="flex flex-col items-center text-center w-full">
            <div className="relative group">
              {/* Glowing ring around avatar */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-[38px] blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse pointer-events-none" />
              
              <div className="relative w-40 h-40 sm:w-44 sm:h-44 rounded-[36px] bg-slate-950 border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
                {assistantImage ? (
                  <img
                    src={assistantImage}
                    alt={assistantName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Bot size={70} className="text-slate-600" />
                )}
              </div>
            </div>

            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white">{assistantName}</h2>

            <p className="mt-2 text-sm text-slate-400 max-w-[280px]">
              Ready to chat, listen, speak, and help you work faster.
            </p>

            {/* Sidebar Badges */}
            <div className="mt-6 w-full grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 hover:bg-white/10 transition-colors duration-300 text-center">
                <Sparkles className="mx-auto text-cyan-400" size={24} />
                <p className="mt-2 text-xs font-semibold text-slate-300">Smart Chat</p>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 hover:bg-white/10 transition-colors duration-300 text-center">
                <Volume2 className="mx-auto text-purple-400" size={24} />
                <p className="mt-2 text-xs font-semibold text-slate-300">Voice Reply</p>
              </div>
            </div>

            {/* Speak Button */}
            <button
              onClick={handleVoiceInput}
              className={`mt-6 w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300 shadow-lg cursor-pointer ${
                isListening
                  ? "bg-red-600 shadow-red-600/30 text-white animate-pulse"
                  : "bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 shadow-blue-500/20 text-white hover:scale-[1.02] hover:shadow-cyan-500/25 active:scale-[0.98]"
              }`}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              {isListening ? "Listening..." : "Speak Now"}
            </button>

            {/* Customize Profile Button */}
            <button
              onClick={() => navigate("/customize")}
              className="mt-3 w-full h-12 rounded-2xl border border-white/10 hover:border-cyan-500/50 hover:bg-white/5 text-sm font-semibold flex items-center justify-center gap-2 transition duration-300 cursor-pointer text-slate-300 hover:text-white"
            >
              <User size={16} />
              Customize Assistant
            </button>

            {/* Voice Selector */}
            {voices.length > 0 && (
              <div className="mt-5 w-full text-left border-t border-white/5 pt-4">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Assistant Voice
                </label>
                <select
                  value={selectedVoiceName}
                  onChange={(e) => {
                    setSelectedVoiceName(e.target.value);
                    localStorage.setItem("preferredVoice", e.target.value);
                    speakVoicePreview(e.target.value);
                  }}
                  className="w-full h-11 px-3 rounded-xl border border-white/10 bg-slate-950 text-slate-300 text-sm outline-none focus:border-cyan-500 transition duration-300 cursor-pointer"
                >
                  {voices.map((v) => (
                    <option key={v.name} value={v.name} className="bg-slate-950 text-slate-300">
                      {v.name.split(" - ")[0]} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </aside>

        {/* Chat Panel */}
        <section className="rounded-[32px] bg-slate-900/40 border border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col h-full min-h-0 relative">
          {/* Chat Header */}
          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-transparent shrink-0 rounded-t-[30px]">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">AI Chat</h2>
              <p className="text-sm text-slate-400">
                Type a message or use your voice.
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-1.5 text-xs font-semibold tracking-wide">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              Online
            </div>
          </div>

          {/* Chat Messages */}
          <div ref={chatContainerRef} className="flex-1 p-5 sm:p-6 overflow-y-auto bg-slate-950/20">
            <div className="space-y-6">
              {messages.map((item, index) => {
                const isUser = item.role === "user";

                return (
                  <div
                    key={index}
                    className={`flex gap-3.5 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isUser && (
                      <div className="w-10 h-10 rounded-2xl bg-slate-950 border border-white/10 text-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md ring-1 ring-white/5">
                        {assistantImage ? (
                          <img
                            src={assistantImage}
                            alt={assistantName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Bot size={20} className="text-slate-400" />
                        )}
                      </div>
                    )}

                    <div
                      className={`max-w-[78%] rounded-[24px] px-5 py-3.5 text-sm sm:text-base leading-relaxed shadow-lg ${
                        isUser
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-tr-sm shadow-cyan-500/5"
                          : "bg-white/5 border border-white/10 text-slate-100 rounded-tl-sm"
                      }`}
                    >
                      {item.text}
                    </div>

                    {isUser && (
                      <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0 shadow-md">
                        <User size={20} />
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex gap-3.5 justify-start">
                  <div className="w-10 h-10 rounded-2xl bg-slate-950 border border-white/10 text-white flex items-center justify-center overflow-hidden flex-shrink-0">
                    {assistantImage ? (
                      <img
                        src={assistantImage}
                        alt={assistantName}
                        className="w-full h-full object-cover animate-pulse"
                      />
                    ) : (
                      <Bot size={20} className="text-slate-400" />
                    )}
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-[24px] rounded-tl-sm px-6 py-4 shadow-sm flex items-center gap-1.5 min-w-[75px]">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce" />
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Chat Input Controls */}
          <div className="p-4 sm:p-5 border-t border-white/10 bg-transparent shrink-0 rounded-b-[30px]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer shrink-0 ${
                  isListening
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/30 animate-pulse"
                    : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {isListening ? <MicOff size={22} /> : <Mic size={22} />}
              </button>

              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
                placeholder="Ask your assistant anything..."
                className="flex-1 h-14 rounded-2xl bg-white/5 border border-white/10 px-5 outline-none focus:bg-white/10 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-300 text-white placeholder-slate-500"
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={isLoading}
                className="w-14 h-14 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 hover:scale-[1.03] hover:shadow-cyan-500/25 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;