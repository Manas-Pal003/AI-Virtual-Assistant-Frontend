import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

const PublicRoute = () => {
  const { userData, loadingUser } = useContext(UserContext);

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (userData) {
    const hasAssistant = userData.assistantName && userData.assistantImage;

    if (hasAssistant) {
      return <Navigate to="/dashboard" replace />;
    }

    return <Navigate to="/customize" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;