import axios from "axios";

// Set base URL for API calls
axios.defaults.baseURL = "http://localhost:8000";

// Set default content type
axios.defaults.headers.post["Content-Type"] = "application/json";

// Request interceptor to add auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration and refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken) {
        try {
          // Try to refresh the token
          const response = await axios.post("/auth/refresh", {
            refresh_token: refreshToken,
          });

          const { access_token } = response.data;
          localStorage.setItem("access_token", access_token);

          // Update the authorization header
          originalRequest.headers.Authorization = `Bearer ${access_token}`;

          // Retry the original request
          return axios(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");

          // Redirect to login page
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, clear storage and redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axios;
