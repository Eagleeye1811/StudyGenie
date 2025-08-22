import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Subjects from "./pages/Subjects";
import SubjectDetail from "./pages/SubjectDetail";
import Flashcards from "./pages/Flashcards";
import PracticeQuiz from "./pages/PracticeQuiz";
import ExamQuiz from "./pages/ExamQuiz";
import RealtimeAssistant from "./components/Realtime";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import NavBar from "./components/NavBar";

// Component to handle conditional NavBar rendering
function AppLayout({ children, showNavBar = true }) {
  return (
    <div className="flex min-h-screen flex-col">
      {showNavBar && <NavBar />}
      <div className="flex-grow">{children}</div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Auth Routes (no NavBar) */}
            <Route
              path="/login"
              element={
                <AppLayout showNavBar={false}>
                  <LoginPage />
                </AppLayout>
              }
            />
            <Route
              path="/register"
              element={
                <AppLayout showNavBar={false}>
                  <RegisterPage />
                </AppLayout>
              }
            />

            {/* Protected Routes (with NavBar) */}
            <Route
              path="/"
              element={
                <AppLayout>
                  <ProtectedRoute>
                    <Subjects />
                  </ProtectedRoute>
                </AppLayout>
              }
            />

            <Route
              path="/dashboard"
              element={
                <AppLayout>
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                </AppLayout>
              }
            />

            <Route
              path="/subject/:subjectId"
              element={
                <AppLayout>
                  <ProtectedRoute>
                    <SubjectDetail />
                  </ProtectedRoute>
                </AppLayout>
              }
            />

            <Route
              path="/flashcards/:subjectId"
              element={
                <AppLayout>
                  <ProtectedRoute>
                    <Flashcards />
                  </ProtectedRoute>
                </AppLayout>
              }
            />

            <Route
              path="/practice-quiz/:subjectId"
              element={
                <AppLayout>
                  <ProtectedRoute>
                    <PracticeQuiz />
                  </ProtectedRoute>
                </AppLayout>
              }
            />

            <Route
              path="/exam-quiz/:subjectId"
              element={
                <AppLayout>
                  <ProtectedRoute>
                    <ExamQuiz />
                  </ProtectedRoute>
                </AppLayout>
              }
            />

            <Route
              path="/assistant"
              element={
                <AppLayout>
                  <ProtectedRoute>
                    <RealtimeAssistant />
                  </ProtectedRoute>
                </AppLayout>
              }
            />

            {/* Redirect unknown routes to register for new users */}
            <Route path="*" element={<Navigate to="/register" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
