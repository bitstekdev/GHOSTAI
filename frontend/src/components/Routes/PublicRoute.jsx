import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AppContext } from "../../context/AppContext";


export default function PublicRoute() {
  const { isAuthenticated } = useContext(AppContext);

  if (isAuthenticated === null) return null;

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
