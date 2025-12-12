import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { Loader } from "lucide-react";

const PublicRoute = () => {
  const { isAuthenticated, loading } = useContext(AppContext);

  // Show loading state while checking authentication
  if (loading) {
    return (
       <div className="min-h-screen bg-gradient-to-r from-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Loading your story...</p>
        </div>
      </div>
    );
  }

  // If authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, render the public route
  return <Outlet />;
};

export default PublicRoute;