import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Subjects from './pages/Subjects';
import SubjectDetail from './pages/SubjectDetail';
import Flashcards from './pages/Flashcards';
import RealtimeAssistant from "./components/Realtime";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Subjects />} />
        <Route path="/subject/:subjectId" element={<SubjectDetail />} /> 
        <Route path="/flashcards/:subjectId" element={<Flashcards />} />
        {/* Add route for your realtime assistant */}
        <Route path="/assistant" element={<RealtimeAssistant />} />
      </Routes>
    </Router>
  );
}

export default App;
