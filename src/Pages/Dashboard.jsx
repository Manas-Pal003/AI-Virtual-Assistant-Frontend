import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  ExternalLink,
  LogOut,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Trash2,
  User,
  Volume2,
  Menu,
  X,
  Power,
  ShieldAlert,
} from "lucide-react";
import axiosClient from "../api/axiosClient";
import { UserContext } from "../context/UserContext";
import { useNotification } from "../context/NotificationContext";
import userGif from "../assets/user.gif";
import aiGif from "../assets/ai.gif";

const API_URL = `http://${window.location.hostname}:8000`;

const Dashboard = () => {
  const navigate = useNavigate();
  const { userData, setUserData } = useContext(UserContext);
  const { showSuccess, showError } = useNotification();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I am your AI assistant. You can type or use your voice to talk with me.",
    },
  ]);

  const [voiceMode, setVoiceMode] = useState(null); // null | "listening" | "processing" | "speaking"
  const isListening = voiceMode === "listening";
  const isSpeaking = voiceMode === "speaking";

  const setIsListening = (val) => {
    setVoiceMode((prev) => {
      if (val) {
        return "listening";
      } else {
        return prev === "listening" ? null : prev;
      }
    });
  };

  const setIsSpeaking = (val) => {
    setVoiceMode((prev) => {
      if (val) {
        return prev === "processing" ? "speaking" : prev;
      } else {
        return prev === "speaking" ? null : prev;
      }
    });
  };

  const [isLoading, setIsLoading] = useState(false);
  const [messagesInitialized, setMessagesInitialized] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [voices, setVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState(
    localStorage.getItem("preferredVoice") || ""
  );

  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const activeUtteranceRef = useRef(null);
  const recognitionRef = useRef(null);
  const wakeWordRecRef = useRef(null);

  const [isWakeWordListening, setIsWakeWordListening] = useState(false);
  const [isWakeWordEnabled, setIsWakeWordEnabled] = useState(
    localStorage.getItem("wakeWordEnabled") === "true"
  );
  const [isShutdownActive, setIsShutdownActive] = useState(false);
  const [shutdownCountdown, setShutdownCountdown] = useState(10);
  const shutdownTimerRef = useRef(null);
  // isSpeaking is defined as derived state above

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

  useEffect(() => {
    if (userData?.history && !messagesInitialized) {
      if (userData.history.length > 0) {
        setMessages(userData.history);
      }
      setMessagesInitialized(true);
    }
  }, [userData, messagesInitialized]);

  // Background wake word listener
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition || !isWakeWordEnabled || voiceMode !== null || !userData) {
      if (wakeWordRecRef.current) {
        try {
          wakeWordRecRef.current.abort();
        } catch (e) {}
        wakeWordRecRef.current = null;
      }
      setIsWakeWordListening(false);
      return;
    }

    let active = true;
    let recognition = null;

    const startPassiveListening = () => {
      if (!active || voiceMode !== null || !isWakeWordEnabled) return;

      try {
        recognition = new SpeechRecognition();
        wakeWordRecRef.current = recognition;
        recognition.lang = "en-IN";
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
          console.log("Wake word listener started");
          setIsWakeWordListening(true);
        };

        recognition.onresult = (event) => {
          if (voiceMode !== null || !isWakeWordEnabled) return;

          let fullTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            fullTranscript += event.results[i][0].transcript;
          }
          fullTranscript = fullTranscript.toLowerCase();
          const cleanName = assistantName.toLowerCase().trim();

          // Match exact wake word name, "hey [name]", or phonetic variants for "Jarvis"
          const isWakeWordDetected = 
            fullTranscript.includes(cleanName) || 
            fullTranscript.includes("hey " + cleanName) ||
            (cleanName === "jarvis" && (
              fullTranscript.includes("travis") || 
              fullTranscript.includes("charvis") || 
              fullTranscript.includes("java") ||
              fullTranscript.includes("jar vis") ||
              fullTranscript.includes("service")
            )) ||
            (cleanName === "assistant" && fullTranscript.includes("assistant"));

          if (isWakeWordDetected) {
            console.log("Wake word detected:", fullTranscript);
            
            // Stop background listener
            recognition.abort();
            wakeWordRecRef.current = null;
            setIsWakeWordListening(false);
            
            // Speak acknowledgment and start voice capture
            speakText(`Yes?`);
            setTimeout(() => {
              handleVoiceInput();
            }, 600);
          }
        };

        recognition.onerror = (e) => {
          console.log("Wake word listener error:", e.error);
        };

        recognition.onend = () => {
          console.log("Wake word listener ended");
          setIsWakeWordListening(false);
          if (active && voiceMode === null && isWakeWordEnabled) {
            setTimeout(startPassiveListening, 100);
          }
        };

        recognition.start();
      } catch (err) {
        console.error("Failed to start wake word listener:", err);
      }
    };

    const timer = setTimeout(startPassiveListening, 200);

    return () => {
      active = false;
      clearTimeout(timer);
      if (recognition) {
        try {
          recognition.abort();
        } catch (e) {}
      }
      wakeWordRecRef.current = null;
      setIsWakeWordListening(false);
    };
  }, [voiceMode, assistantName, userData, isWakeWordEnabled]);

  useEffect(() => {
    return () => {
      if (shutdownTimerRef.current) {
        clearInterval(shutdownTimerRef.current);
      }
    };
  }, []);

  const startShutdownCountdown = () => {
    if (shutdownTimerRef.current) {
      clearInterval(shutdownTimerRef.current);
    }
    setShutdownCountdown(10);
    setIsShutdownActive(true);
    
    shutdownTimerRef.current = setInterval(() => {
      setShutdownCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(shutdownTimerRef.current);
          shutdownTimerRef.current = null;
          setIsShutdownActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelShutdownCountdown = (voiceReplyText) => {
    if (shutdownTimerRef.current) {
      clearInterval(shutdownTimerRef.current);
      shutdownTimerRef.current = null;
    }
    setIsShutdownActive(false);
    setShutdownCountdown(10);
    if (voiceReplyText) {
      speakText(voiceReplyText);
    }
  };

  const handleAbortShutdown = async () => {
    try {
      setIsLoading(true);
      const response = await axiosClient.post("/assistant/cancel-shutdown");
      
      const rawReply = response.data.reply || "Shutdown successfully aborted.";
      const reply = cleanAssistantText(rawReply);
      
      const assistantMessage = {
        role: "assistant",
        text: reply,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      cancelShutdownCountdown(reply);
    } catch (error) {
      console.error("Failed to abort shutdown:", error);
      const errorMsg = error.response?.data?.message || "Failed to abort shutdown. No active shutdown might be scheduled.";
      showError(errorMsg);
      cancelShutdownCountdown();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm("Are you sure you want to clear your chat history?")) return;

    try {
      setIsLoading(true);
      await axiosClient.post("/users/clear-history");
      setMessages([
        {
          role: "assistant",
          text: "Hello! I am your AI assistant. You can type or use your voice to talk with me.",
        },
      ]);
      setUserData((prev) => ({
        ...prev,
        history: []
      }));
      showSuccess("Chat history cleared successfully.");
    } catch (error) {
      console.error("Failed to clear chat history:", error);
      showError("Failed to clear chat history. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) return;

    try {
      window.speechSynthesis.resume();
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      activeUtteranceRef.current = utterance; // Keep reference to prevent GC

      const allVoices = window.speechSynthesis.getVoices();
      
      let voice = null;
      let pitch = 1.05; // default pitch
      let rate = 1.0;   // default rate

      const isJarvis = assistantName.toLowerCase().trim() === "jarvis";
      const isFriday = assistantName.toLowerCase().trim() === "friday";

      if (isJarvis) {
        // Search for British/UK Male voice (classy British accent like Jarvis)
        voice = allVoices.find((v) => {
          const name = v.name.toLowerCase();
          const lang = v.lang.toLowerCase();
          const isUK = lang.includes("gb") || lang.includes("uk") || name.includes("uk") || name.includes("british") || name.includes("england");
          const isMale = name.includes("male") || name.includes("george") || name.includes("david") || name.includes("microsoft david");
          return isUK && isMale;
        });

        // Fallback 1: Any Male voice
        if (!voice) {
          voice = allVoices.find((v) => {
            const name = v.name.toLowerCase();
            return name.includes("male") || name.includes("david") || name.includes("george") || name.includes("google us english male");
          });
        }

        // Fallback 2: Any British/UK voice
        if (!voice) {
          voice = allVoices.find((v) => {
            const name = v.name.toLowerCase();
            const lang = v.lang.toLowerCase();
            return lang.includes("gb") || lang.includes("uk") || name.includes("uk") || name.includes("british");
          });
        }

        pitch = 0.88; // Deep, calm class signature
        rate = 0.95;  // Calm, deliberate pacing
      } else if (isFriday) {
        // Search for Irish voice (Friday is Irish in MCU)
        voice = allVoices.find((v) => {
          const name = v.name.toLowerCase();
          const lang = v.lang.toLowerCase();
          return lang.includes("ie") || name.includes("irish") || name.includes("ireland");
        });

        // Fallback 1: British/UK female voice (Hazel or Google UK English Female)
        if (!voice) {
          voice = allVoices.find((v) => {
            const name = v.name.toLowerCase();
            const lang = v.lang.toLowerCase();
            const isUK = lang.includes("gb") || lang.includes("uk") || name.includes("uk") || name.includes("british");
            const isFemale = name.includes("hazel") || name.includes("female") || name.includes("zira") || name.includes("samantha");
            return isUK && isFemale;
          });
        }

        // Fallback 2: Any standard female voice
        if (!voice) {
          const femaleVoiceIdentifiers = ["zira", "samantha", "hazel", "victoria", "susan", "karen", "female"];
          voice = allVoices.find((v) => {
            const name = v.name.toLowerCase();
            const lang = v.lang.toLowerCase();
            return (lang.startsWith("en-") || lang === "en") && femaleVoiceIdentifiers.some((id) => name.includes(id));
          });
        }

        pitch = 1.05; // Warm, melodious signature
        rate = 1.02;  // Quick, responsive pacing
      } else {
        // Standard voice selection flow
        voice = allVoices.find((v) => v.name === selectedVoiceName);

        if (!voice) {
          const femaleVoiceIdentifiers = [
            "zira", "samantha", "hazel", "victoria", "susan", "karen", "moira", 
            "tessa", "veena", "eva", "sally", "female", "google us english", "google uk english female"
          ];
          voice = allVoices.find((v) => {
            const name = v.name.toLowerCase();
            const lang = v.lang.toLowerCase();
            return (lang.startsWith("en-") || lang.startsWith("en_") || lang === "en") &&
              femaleVoiceIdentifiers.some((id) => name.includes(id));
          });
        }
      }

      utterance.lang = voice ? voice.lang : (isJarvis ? "en-GB" : (isFriday ? "en-IE" : "en-US"));
      utterance.rate = rate;
      utterance.pitch = pitch;

      if (voice) {
        utterance.voice = voice;
      }

      utterance.onend = () => {
        activeUtteranceRef.current = null;
        setVoiceMode((prev) => {
          if (prev === "speaking") {
            setTimeout(() => {
              handleVoiceInput(true);
            }, 300);
            return "listening";
          }
          return prev === "speaking" ? null : prev;
        });
      };
      utterance.onerror = () => {
        activeUtteranceRef.current = null;
        setVoiceMode((prev) => {
          if (prev === "speaking") {
            setTimeout(() => {
              handleVoiceInput(true);
            }, 300);
            return "listening";
          }
          return prev === "speaking" ? null : prev;
        });
      };

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    } catch (err) {
      console.error("Text to speech error:", err);
    }
  };

  const speakVoicePreview = (voiceName) => {
    if (!window.speechSynthesis) return;

    try {
      window.speechSynthesis.resume();
      window.speechSynthesis.cancel();

      const cleanName = voiceName.split(" - ")[0];
      const utterance = new SpeechSynthesisUtterance(`Hi! I am now using ${cleanName}`);
      activeUtteranceRef.current = utterance; // Keep reference to prevent GC

      utterance.lang = "en-US";
      utterance.rate = 1.0;
      utterance.pitch = 1.05;

      utterance.onend = () => {
        activeUtteranceRef.current = null;
        setIsSpeaking(false);
      };
      utterance.onerror = () => {
        activeUtteranceRef.current = null;
        setIsSpeaking(false);
      };

      const allVoices = window.speechSynthesis.getVoices();
      const voice = allVoices.find((v) => v.name === voiceName);

      if (voice) {
        utterance.voice = voice;
      }

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    } catch (err) {
      console.error("Voice preview error:", err);
    }
  };

  const cleanAssistantText = (text) => {
    if (!text) return "";

    return text
      .replace(/\*\*/g, "")
      .replace(/###/g, "")
      .replace(/##/g, "")
      .replace(/#/g, "")
      .replace(/\*/g, "")
      .trim();
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
        history: [...messages, userMessage],
        assistantName: assistantName,
      });

      const rawReply =
        response.data.reply ||
        response.data.response ||
        response.data.message ||
        "I received your message, but I could not generate a reply.";

      const reply = cleanAssistantText(rawReply);

      const assistantMessage = {
        role: "assistant",
        text: reply,
        url: response.data.url || null,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      speakText(reply);

      if (response.data.type === "shutdown") {
        startShutdownCountdown();
      } else if (response.data.type === "cancel-shutdown") {
        cancelShutdownCountdown();
      } else if (response.data.type === "clear-history") {
        setMessages([
          {
            role: "assistant",
            text: "Hello! I am your AI assistant. You can type or use your voice to talk with me.",
          },
        ]);
        setUserData((prev) => ({
          ...prev,
          history: []
        }));
      }

      // URL opening is now handled directly by the local Node.js backend to prevent browser popup blocker issues.
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

  const handleVoiceInput = (forceStart = false) => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showError("Speech recognition is not supported in this browser. Please use Google Chrome.");
      return;
    }

    if (isListening && !forceStart) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.lang = "en-IN"; // Keeping en-IN for optimal local accent and name recognition
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      let finalTranscript = "";

      recognition.onstart = () => {
        console.log("Speech recognition started");
        setMessage(""); // Reset transcription text state when starting voice recognition
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        setMessage(currentText);

        if (finalTranscript.trim()) {
          recognition.stop();
          setVoiceMode("processing");
          handleSendMessage(finalTranscript.trim());
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);

        if (event.error === "not-allowed") {
          showError("Microphone permission is blocked. Please allow microphone access in browser settings.");
        } else if (event.error === "no-speech") {
          // Suppress silence timeout message while in Voice Assistant Mode
          console.log("Speech timed out due to silence. Suppressing error alert.");
        } else if (event.error === "audio-capture") {
          showError("No microphone found. Please check your microphone.");
        } else if (event.error === "network") {
          showError("Speech recognition network error. Please check your internet connection.");
        }

        if (event.error !== "no-speech") {
          setIsListening(false);
        }
        recognitionRef.current = null;
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
        setVoiceMode((prev) => {
          if (prev === "listening") {
            setTimeout(() => {
              handleVoiceInput(true);
            }, 100);
            return "listening";
          }
          return prev;
        });
        recognitionRef.current = null;
      };

      recognition.start();
    } catch (error) {
      console.error("Speech recognition start error:", error);
      setIsListening(false);
      recognitionRef.current = null;
    }
  };

  const handleLogout = async () => {
    try {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
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
    <div style={{ height: "100dvh", minHeight: "100dvh", overflow: "hidden" }} className="w-full bg-slate-950 text-white relative flex flex-col animate-fade-in">
      {/* Background decoration elements */}
      <div className="absolute top-[-180px] left-[-160px] w-[520px] h-[520px] bg-cyan-500/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-180px] right-[-160px] w-[560px] h-[560px] bg-purple-500/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[35%] left-[45%] w-[420px] h-[420px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Header section */}
      <header className="h-16 sm:h-20 shrink-0 border-b border-white/10 bg-slate-900/40 backdrop-blur-xl z-20 flex items-center relative">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2.5 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition duration-300 shrink-0 cursor-pointer"
            >
              <Menu size={20} />
            </button>

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
      <main className="relative z-10 flex-1 min-h-0 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 lg:py-6 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 overflow-hidden">

        {/* Backdrop for mobile drawer */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-[280px] sm:w-[320px] bg-slate-950/95 border-r border-white/10 p-5 sm:p-6 shadow-2xl flex flex-col justify-start overflow-y-auto transition-transform duration-300 ease-in-out
            lg:relative lg:inset-auto lg:z-10 lg:w-full lg:h-full lg:translate-x-0 lg:bg-slate-900/40 lg:border lg:rounded-[32px] lg:backdrop-blur-2xl
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          {/* Mobile Close Button */}
          <div className="w-full flex justify-end lg:hidden mb-4">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

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
            <div className="mt-6 w-full grid grid-cols-2 gap-2 sm:gap-3">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-3 sm:p-4 hover:bg-white/10 transition-colors duration-300 text-center">
                <Sparkles className="mx-auto text-cyan-400" size={24} />
                <p className="mt-2 text-[11px] sm:text-xs font-semibold text-slate-300">Smart Chat</p>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 p-3 sm:p-4 hover:bg-white/10 transition-colors duration-300 text-center">
                <Volume2 className="mx-auto text-purple-400" size={24} />
                <p className="mt-2 text-[11px] sm:text-xs font-semibold text-slate-300">Voice Reply</p>
              </div>
            </div>

            {/* Speak Button */}
            <button
              onClick={handleVoiceInput}
              className={`mt-6 w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300 shadow-lg cursor-pointer ${isListening
                ? "bg-red-600 shadow-red-600/30 text-white animate-pulse"
                : "bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 shadow-blue-500/20 text-white hover:scale-[1.02] hover:shadow-cyan-500/25 active:scale-[0.98]"
                }`}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              {isListening ? "Listening..." : "Speak Now"}
            </button>

            {/* Wake Word Activation Toggle */}
            <div className="mt-4 w-full flex items-center justify-between px-4 py-3 rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
              <span className="text-xs font-semibold text-slate-300">
                Wake Word ("Hey {assistantName}")
              </span>
              <button
                type="button"
                onClick={() => {
                  const newVal = !isWakeWordEnabled;
                  setIsWakeWordEnabled(newVal);
                  localStorage.setItem("wakeWordEnabled", newVal);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none cursor-pointer ${
                  isWakeWordEnabled ? "bg-cyan-500 shadow-md shadow-cyan-500/20" : "bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                    isWakeWordEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Customize Profile Button */}
            <button
              onClick={() => navigate("/customize")}
              className="mt-3 w-full h-11 sm:h-12 rounded-xl sm:rounded-2xl border border-white/10 hover:border-cyan-500/50 hover:bg-white/5 text-sm font-semibold flex items-center justify-center gap-2 transition duration-300 cursor-pointer text-slate-300 hover:text-white"
            >
              <User size={16} />
              Customize Assistant
            </button>

            {/* Clear Chat Button */}
            <button
              onClick={handleClearChat}
              className="mt-3 w-full h-11 sm:h-12 rounded-xl sm:rounded-2xl border border-red-500/20 hover:border-red-500/5 text-sm font-semibold flex items-center justify-center gap-2 transition duration-300 cursor-pointer text-red-300 hover:text-red-200"
            >
              <Trash2 size={16} />
              Clear Chat History
            </button>

            {isWakeWordListening && (
              <p className="mt-3 text-[10px] text-cyan-400 font-bold tracking-wider uppercase animate-pulse flex items-center gap-1.5 justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Say "Hey {assistantName}" to wake up
              </p>
            )}

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
                  className="w-full h-10 sm:h-11 px-3 rounded-xl border border-white/10 bg-slate-950 text-slate-300 text-sm outline-none focus:border-cyan-500 transition duration-300 cursor-pointer"
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

            <div className="hidden sm:flex items-center gap-3">
              {isWakeWordListening && (
                <div className="flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-3.5 py-1.5 text-xs font-semibold tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  Say "Hey {assistantName}"
                </div>
              )}
              <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-1.5 text-xs font-semibold tracking-wide">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                Online
              </div>
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
                    className={`flex gap-3.5 ${isUser ? "justify-end" : "justify-start"
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
                      className={`max-w-[78%] whitespace-pre-wrap break-words rounded-[24px] px-5 py-3.5 text-sm sm:text-base leading-relaxed shadow-lg flex flex-col gap-2 ${isUser
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-tr-sm shadow-cyan-500/5"
                        : "bg-white/5 border border-white/10 text-slate-100 rounded-tl-sm"
                        }`}
                    >
                      <span>{item.text}</span>
                      {item.url && (
                        <div className="mt-2 pt-2 border-t border-white/10 flex flex-col gap-1.5 w-full">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 hover:border-cyan-500/50 text-cyan-300 hover:text-cyan-200 text-xs font-bold transition-all duration-300 active:scale-[0.97] w-fit"
                          >
                            <ExternalLink size={13} className="shrink-0" />
                            <span>
                              {item.url.includes("youtube.com")
                                ? "Watch on YouTube"
                                : item.url.includes("google.com/search")
                                  ? "Open Google Search"
                                  : "Open Link"}
                            </span>
                          </a>
                        </div>
                      )}
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
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer shrink-0 ${isListening
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
                className="flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 px-4 sm:px-5 outline-none focus:bg-white/10 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-300 text-white placeholder-slate-500 text-sm sm:text-base"
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={isLoading}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 hover:scale-[1.03] hover:shadow-cyan-500/25 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </section>
      </main>

      {isShutdownActive && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xl z-50 flex flex-col items-center justify-center animate-fade-in select-none">
          {/* Animated glowing backdrop circles */}
          <div className="absolute top-[20%] left-[30%] w-[350px] h-[350px] bg-red-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
          <div className="absolute bottom-[20%] right-[30%] w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />

          <div className="relative flex flex-col items-center max-w-lg w-full text-center p-8 bg-slate-900/60 border border-red-500/20 rounded-[32px] backdrop-blur-3xl shadow-2xl ring-2 ring-red-500/5 overflow-hidden mx-4">
            {/* Red alert scanner bar */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-red-600 via-orange-500 to-red-600 animate-pulse" />

            <div className="relative w-28 h-28 flex items-center justify-center rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 mb-6 shadow-lg shadow-red-500/10 animate-bounce">
              <Power size={52} className="animate-pulse" />
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2 uppercase">
              Shutdown Initiated
            </h2>
            <p className="text-slate-400 text-sm max-w-sm mb-8 leading-relaxed">
              System is scheduled to power off in {shutdownCountdown} seconds. Please save any unsaved work immediately.
            </p>

            {/* Premium Countdown circle/number */}
            <div className="relative flex items-center justify-center w-48 h-48 mb-10 rounded-full bg-slate-950 border border-white/5 shadow-inner">
              {/* Spinning background track */}
              <div className="absolute inset-0.5 rounded-full border border-red-500/10" />
              {/* Outer pulsing ring */}
              <div className="absolute inset-[-4px] rounded-full border-2 border-red-500/40 animate-ping opacity-25" />
              <div className="absolute inset-[-8px] rounded-full border border-purple-500/30 opacity-10" />

              <div className="flex flex-col items-center">
                <span className="text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-red-500 via-orange-400 to-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)] select-none">
                  {shutdownCountdown}
                </span>
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest mt-1">
                  Seconds
                </span>
              </div>
            </div>

            {/* Glowing Emergency Abort Button */}
            <button
              onClick={handleAbortShutdown}
              disabled={isLoading}
              className="relative w-full h-14 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white font-extrabold text-base tracking-wide flex items-center justify-center gap-3 shadow-lg shadow-red-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group"
            >
              {/* Glow effect */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl blur-[12px] opacity-40 group-hover:opacity-70 transition duration-300 -z-10" />
              
              <ShieldAlert size={20} className="group-hover:rotate-12 transition duration-300" />
              <span>CANCEL SYSTEM SHUTDOWN</span>
            </button>
          </div>
        </div>
      )}
      
      {voiceMode && (
        <div 
          onClick={voiceMode === "listening" ? handleVoiceInput : undefined}
          className={`fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-fade-in select-none ${
            voiceMode === "listening" ? "cursor-pointer" : ""
          }`}
        >
          <div className="relative flex flex-col items-center gap-6 p-6 max-w-sm w-full text-center">
            {/* Glowing ring */}
            <div className={`absolute w-[240px] h-[240px] rounded-full blur-[40px] animate-pulse pointer-events-none ${
              voiceMode === "listening" ? "bg-cyan-500/20" : "bg-purple-500/20"
            }`} />

            {/* Avatar / Animation Box */}
            <div className={`relative w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden border-2 shadow-2xl bg-slate-900 flex items-center justify-center ${
              voiceMode === "listening" ? "border-cyan-500/30 shadow-cyan-500/10" : "border-purple-500/30 shadow-purple-500/10"
            }`}>
              {voiceMode === "listening" && (
                <img
                  src={userGif}
                  alt="Listening..."
                  className="w-full h-full object-cover scale-110"
                />
              )}
              {voiceMode === "processing" && (
                <div className="flex items-center gap-2 justify-center">
                  <span className="w-3.5 h-3.5 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-3.5 h-3.5 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-3.5 h-3.5 rounded-full bg-purple-400 animate-bounce" />
                </div>
              )}
              {voiceMode === "speaking" && (
                <img
                  src={aiGif}
                  alt="Speaking..."
                  className="w-full h-full object-cover scale-110"
                />
              )}
            </div>

            {/* Description Text */}
            <div className="relative z-10 max-w-xs sm:max-w-md mx-auto">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-relaxed">
                {voiceMode === "listening" && (message ? `“${message}”` : "Listening to you...")}
                {voiceMode === "processing" && "Thinking..."}
                {voiceMode === "speaking" && "Speaking..."}
              </h3>
              <p className="text-slate-400 mt-2 text-xs sm:text-sm font-medium">
                {voiceMode === "listening" && (message ? "Transcribing in real-time..." : "Speak clearly. Click anywhere on the screen to cancel.")}
                {voiceMode === "processing" && "Analyzing your request..."}
                {voiceMode === "speaking" && "Your assistant is reading the response."}
              </p>
            </div>

            {/* Stop/Cancel Button */}
            {(voiceMode === "speaking" || voiceMode === "processing" || voiceMode === "listening") && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  window.speechSynthesis?.cancel();
                  if (activeUtteranceRef.current) {
                    activeUtteranceRef.current.onend = null;
                    activeUtteranceRef.current.onerror = null;
                    activeUtteranceRef.current = null;
                  }
                  if (recognitionRef.current) {
                    try {
                      recognitionRef.current.abort();
                    } catch (err) {}
                  }
                  setVoiceMode(null);
                }}
                className="px-6 py-3 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-200 hover:bg-red-500/20 active:scale-[0.98] transition duration-300 font-bold text-sm tracking-wide cursor-pointer mt-2 animate-fade-in"
              >
                {voiceMode === "listening" ? "Cancel" : "Stop Playback"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;