import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Subjects from "./pages/Subjects";
import SubjectDetail from "./pages/SubjectDetail";
import Flashcards from "./pages/Flashcards";
import PracticeQuiz from "./pages/PracticeQuiz";
import ExamQuiz from "./pages/ExamQuiz";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Subjects />} />
        <Route path="/subject/:subjectId" element={<SubjectDetail />} />
        <Route path="/flashcards/:subjectId" element={<Flashcards />} />
        <Route path="/practice-quiz/:subjectId" element={<PracticeQuiz />} />
        <Route path="/exam-quiz/:subjectId" element={<ExamQuiz />} />
      </Routes>
    </Router>
  );
}

export default App;
