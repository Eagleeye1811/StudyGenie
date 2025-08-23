import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Subjects from "./pages/Subjects";
import SubjectDetail from "./pages/SubjectDetail";
import Flashcards from "./pages/Flashcards";
import PracticeQuiz from "./pages/PracticeQuiz";
import ExamQuiz from "./pages/ExamQuiz";
import RealtimeAssistant from "./components/Realtime";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Subjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subject/:subjectId"
              element={
                <ProtectedRoute>
                  <SubjectDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/flashcards/:subjectId"
              element={
                <ProtectedRoute>
                  <Flashcards />
                </ProtectedRoute>
              }
            />
            <Route
              path="/practice-quiz/:subjectId"
              element={
                <ProtectedRoute>
                  <PracticeQuiz />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exam-quiz/:subjectId"
              element={
                <ProtectedRoute>
                  <ExamQuiz />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assistant"
              element={
                <ProtectedRoute>
                  <RealtimeAssistant />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
