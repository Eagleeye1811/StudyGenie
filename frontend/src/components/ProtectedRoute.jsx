import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader />;
  }

  if (!currentUser) {
    // Redirect to the register page for first-time users
    return <Navigate to="/register" state={{ from: location }} replace />;
  }

  return children;
}
