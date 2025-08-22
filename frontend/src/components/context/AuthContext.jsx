import { createContext, useState, useEffect, useContext } from "react";
import axios from "../../lib/api";

// Create Authentication Context
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // On mount, check if user is already logged in
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const token = localStorage.getItem("token");

        if (token) {
          // Configure axios to include the token
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // Fetch user data
          const response = await axios.get("/auth/me");
          setCurrentUser(response.data);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        // Clear token if it's invalid
        localStorage.removeItem("token");
        axios.defaults.headers.common["Authorization"] = "";
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // Register new user
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/auth/register", {
        name,
        email,
        password,
      });

      return response.data;
    } catch (error) {
      setError(error.response?.data?.detail || "Registration failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      // Override content-type for OAuth2 password flow
      const response = await axios.post(
        "/auth/login",
        new URLSearchParams({
          username: email, // OAuth2 expects 'username' field
          password: password,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      // Save token to local storage
      const { access_token } = response.data;
      localStorage.setItem("token", access_token);

      // Set authorization header for future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      // Fetch user information
      const userResponse = await axios.get("/auth/me");
      setCurrentUser(userResponse.data);

      return userResponse.data;
    } catch (error) {
      setError(error.response?.data?.detail || "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem("token");
    axios.defaults.headers.common["Authorization"] = "";
    setCurrentUser(null);
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!currentUser;
  };

  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated,
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
