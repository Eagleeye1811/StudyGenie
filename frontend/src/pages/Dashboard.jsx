import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

function Dashboard() {
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl rounded-lg bg-white p-8 shadow-md">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-6">
          <h2 className="mb-4 text-xl font-semibold">User Profile</h2>

          <div className="rounded-lg bg-blue-50 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-lg">{currentUser?.name}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-lg">{currentUser?.email}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Account Created
                </p>
                <p className="text-lg">
                  {currentUser?.created_at
                    ? new Date(currentUser.created_at).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">Quick Navigation</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Link
              to="/"
              className="flex flex-col items-center rounded-lg bg-gray-100 p-6 text-center transition hover:bg-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mb-2 h-8 w-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span className="font-medium">Home</span>
            </Link>

            <Link
              to="/assistant"
              className="flex flex-col items-center rounded-lg bg-gray-100 p-6 text-center transition hover:bg-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mb-2 h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <span className="font-medium">Assistant</span>
            </Link>

            <Link
              to="/"
              className="flex flex-col items-center rounded-lg bg-gray-100 p-6 text-center transition hover:bg-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mb-2 h-8 w-8 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <span className="font-medium">My Subjects</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
