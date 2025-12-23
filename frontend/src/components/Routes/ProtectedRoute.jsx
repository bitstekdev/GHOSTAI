import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { Loader } from "lucide-react";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useContext(AppContext);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-black to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <img src="/src/assets/images/logo.gif" alt="Loading" className="w-16 h-16 mx-auto mb-4" />
        <p className="text-white text-xl">Loading your story...</p>
      </div>
      </div>
    );
  }

  // If not authenticated, redirect to signin
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // If authenticated, render the protected route
  return <Outlet />;
};

export default ProtectedRoute;