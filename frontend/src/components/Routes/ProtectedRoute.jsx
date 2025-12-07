import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AppContext } from "../../context/AppContext";

export default function ProtectedRoute() {
  const { isAuthenticated } = useContext(AppContext);

  if (isAuthenticated === null) return null; 

  return isAuthenticated ? <Outlet /> : <Navigate to="/signin" replace />;
}
