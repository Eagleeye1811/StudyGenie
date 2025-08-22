import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

function AuthRedirect() {
  const { currentUser, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <Loader />;
  }

  // If user is authenticated, redirect to home page
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  // If user is not authenticated, redirect to register page
  return <Navigate to="/register" replace />;
}

export default AuthRedirect;
