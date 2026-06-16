import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const NotificationContext = createContext(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);
  }, []);

  const showSuccess = useCallback((message) => {
    showNotification(message, "success");
  }, [showNotification]);

  const showError = useCallback((message) => {
    showNotification(message, "error");
  }, [showNotification]);

  const showInfo = useCallback((message) => {
    showNotification(message, "info");
  }, [showNotification]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ showSuccess, showError, showInfo, showNotification }}>
      {children}
      {/* Notifications Portal Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {notifications.map((notif) => (
          <Toast
            key={notif.id}
            notif={notif}
            onClose={() => removeNotification(notif.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// Toast Component
const Toast = ({ notif, onClose }) => {
  const { message, type } = notif;
  const [isExiting, setIsExiting] = useState(false);

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 200); // Allow fade-out animation to play
  };

  // Color config based on type
  const typeConfig = {
    success: {
      border: "border-emerald-500/30",
      bg: "bg-slate-950/90",
      accent: "from-emerald-500 to-teal-500",
      textColor: "text-emerald-400",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 animate-bounce" />,
    },
    error: {
      border: "border-red-500/30",
      bg: "bg-slate-950/90",
      accent: "from-red-500 to-rose-500",
      textColor: "text-red-400",
      icon: <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5 animate-pulse" />,
    },
    info: {
      border: "border-cyan-500/30",
      bg: "bg-slate-950/90",
      accent: "from-cyan-500 to-blue-500",
      textColor: "text-cyan-400",
      icon: <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />,
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div
      className={`pointer-events-auto w-full border ${config.border} ${config.bg} backdrop-blur-xl rounded-2xl p-4 shadow-2xl flex items-start gap-3 relative overflow-hidden select-none transition-all duration-300 ${
        isExiting ? "animate-fade-out scale-95 opacity-0" : "animate-slide-in"
      }`}
    >
      {config.icon}
      
      <div className="flex-1 pr-4">
        <p className="text-slate-200 text-sm font-medium leading-relaxed">
          {message}
        </p>
      </div>

      <button
        onClick={handleClose}
        className="text-slate-400 hover:text-white transition duration-200 cursor-pointer shrink-0 mt-0.5"
      >
        <X size={16} />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white/5 overflow-hidden rounded-b-2xl">
        <div className={`h-full bg-gradient-to-r ${config.accent} animate-shrink`} />
      </div>
    </div>
  );
};
