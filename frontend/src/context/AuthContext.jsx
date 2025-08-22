import { createContext, useState, useEffect, useContext } from "react";
import axios from "../lib/api";

// Create Authentication Context
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");

      if (token) {
        // Set token in axios defaults
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        try {
          // Verify token by fetching user data
          const response = await axios.get("/auth/me");
          setCurrentUser(response.data);
        } catch (error) {
          // Token might be expired, try to refresh
          if (error.response?.status === 401 && refreshToken) {
            const refreshed = await refreshAccessToken(refreshToken);
            if (refreshed) {
              const response = await axios.get("/auth/me");
              setCurrentUser(response.data);
            } else {
              clearAuthData();
            }
          } else {
            clearAuthData();
          }
        }
      }
    } catch (error) {
      console.error("Auth initialization failed:", error);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setCurrentUser(null);
  };

  const saveAuthData = (user, accessToken, refreshToken = null) => {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("user", JSON.stringify(user));

    if (refreshToken) {
      localStorage.setItem("refresh_token", refreshToken);
    }

    axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    setCurrentUser(user);
  };

  const refreshAccessToken = async (refreshToken) => {
    try {
      const response = await axios.post("/auth/refresh", {
        refresh_token: refreshToken,
      });

      const { access_token } = response.data;
      localStorage.setItem("access_token", access_token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      clearAuthData();
      return false;
    }
  };

  // Register new user and automatically log them in
  const signup = async (name, email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/auth/register", {
        name,
        email,
        password,
      });

      const { access_token, refresh_token } = response.data;

      // Store tokens
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      // Fetch user data and set current user
      const userResponse = await axios.get("/auth/me");
      setCurrentUser(userResponse.data);

      return { success: true, user: userResponse.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail || "Registration failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/auth/login", {
        email,
        password,
      });

      const { access_token, refresh_token } = response.data;

      // Set authorization header
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      // Fetch user information
      const userResponse = await axios.get("/auth/me");
      const user = userResponse.data;

      // Save auth data
      saveAuthData(user, access_token, refresh_token);

      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || "Login failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      // Call logout endpoint (optional)
      await axios.post("/auth/logout");
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      clearAuthData();
    }
  };

  // Get current user (refresh from server)
  const getMe = async () => {
    try {
      const response = await axios.get("/auth/me");
      setCurrentUser(response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      throw error;
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!currentUser && !!localStorage.getItem("access_token");
  };

  const value = {
    currentUser,
    loading,
    error,
    signup,
    login,
    logout,
    getMe,
    isAuthenticated,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
