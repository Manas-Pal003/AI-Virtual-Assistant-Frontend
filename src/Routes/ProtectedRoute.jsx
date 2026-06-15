import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

const ProtectedRoute = ({ requireAssistant = false, customizeOnly = false }) => {
  const { userData, loadingUser } = useContext(UserContext);

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!userData) {
    return <Navigate to="/login" replace />;
  }

  const hasAssistant = userData.assistantName && userData.assistantImage;

  if (requireAssistant && !hasAssistant) {
    return <Navigate to="/customize" replace />;
  }

  if (customizeOnly && hasAssistant) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;