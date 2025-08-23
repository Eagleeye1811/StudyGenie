import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChevronRight, AlertCircle } from "lucide-react";
import axios from "axios";
import Loader from "../components/Loader";

const ExamQuiz = () => {
  const { subjectId } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answerResults, setAnswerResults] = useState([]);
  const [isloading, setIsLoading] = useState(false);
  const [response, setResponse] = useState([]);
  const [timer, setTimer] = useState(300); // 5 minutes
  const [showTimesUp, setShowTimesUp] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(
          `http://localhost:8000/api/summarize/quiz/${subjectId}?timed=true`
        );
        if (Array.isArray(data.questions)) {
          setResponse(data.questions);
        } else {
          setResponse([]);
        }
      } catch (error) {
        setResponse([error]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [subjectId]);

  // Timer effect
  useEffect(() => {
    if (showResult) return;
    if (timer === 0) {
      setShowTimesUp(true);
      setTimeout(() => {
        handleNext();
        setShowTimesUp(false);
      }, 3000);
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, showResult]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    const isCorrect = selectedAnswer === response[currentQuestion].answer;
    if (isCorrect) {
      setScore(score + 1);
    }
    setAnswerResults((prev) => [
      ...prev,
      {
        question: response[currentQuestion].question,
        selected: selectedAnswer,
        correct: response[currentQuestion].answer,
        isCorrect,
      },
    ]);
    if (currentQuestion < response.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  // Show loader while waiting for quiz data or if fallback question is present
  const isFallback =
    response.length === 1 && response[0].question === "Fallback Question?";
  if (isloading || response.length === 0 || isFallback) {
    return <Loader />;
  }

  if (showResult) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Quiz Complete! 🎉</h2>
            <p className="text-xl mb-6">
              Your Score: {score} out of {response.length}
            </p>
            <div className="mb-6 text-left">
              <h3 className="font-semibold mb-2">Your Answers:</h3>
              <ul className="space-y-2">
                {response.map((q, idx) => {
                  const attempted = answerResults[idx];
                  if (attempted) {
                    return (
                      <li
                        key={idx}
                        className="p-3 rounded-lg border flex flex-col bg-gray-50"
                      >
                        <span className="font-medium">
                          Q{idx + 1}: {q.question}
                        </span>
                        <span>
                          Your answer:{" "}
                          <span
                            className={
                              attempted.isCorrect
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {attempted.selected}
                          </span>
                        </span>
                        {!attempted.isCorrect && (
                          <span>
                            Correct answer:{" "}
                            <span className="text-green-600">{q.answer}</span>
                          </span>
                        )}
                      </li>
                    );
                  } else {
                    // Unattempted question
                    return (
                      <li
                        key={idx}
                        className="p-3 rounded-lg border flex flex-col bg-gray-50"
                      >
                        <span className="font-medium">
                          Q{idx + 1}: {q.question}
                        </span>
                        <span className="text-red-600">Unattempted</span>
                        <span>
                          Correct answer:{" "}
                          <span className="text-green-600">{q.answer}</span>
                        </span>
                      </li>
                    );
                  }
                })}
              </ul>
            </div>
            <Link to="/" className="rounded-full bg-violet-300 p-4">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = response[currentQuestion];
  const progress = ((currentQuestion + 1) / response.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
      {/* Timer's Up Popup */}
      <AnimatePresence>
        {showTimesUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-4 text-center"
            >
              <AlertCircle className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Time's Up!
              </h3>
              <p className="text-gray-600">
                Your answers will be submitted automatically
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-lg w-full">
        {/* Timer and Progress */}
        <div className="flex items-center justify-between mb-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`flex items-center space-x-2 px-4 py-2 bg-white rounded-full shadow-md ${
              timer <= 60 ? "animate-pulse" : ""
            }`}
          >
            <Clock
              className={`w-5 h-5 ${
                timer <= 60 ? "text-red-500" : "text-purple-500"
              }`}
            />
            <span
              className={`font-semibold ${
                timer <= 60 ? "text-red-500" : "text-purple-500"
              }`}
            >
              {formatTimer(timer)}
            </span>
          </motion.div>
          <span className="text-sm font-medium text-gray-600">
            Question {currentQuestion + 1} of {response.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-6 shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
          />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              {currentQ.question}
            </h2>
            <div className="space-y-4">
              {currentQ.options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full p-4 text-left rounded-xl border transition-all duration-200 shadow-sm ${
                    selectedAnswer === option
                      ? "border-purple-500 bg-purple-50 ring-2 ring-purple-300"
                      : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
                  }`}
                >
                  {option}
                </motion.button>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              disabled={!selectedAnswer}
              className={`mt-8 w-full flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md ${
                selectedAnswer
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {currentQuestion === response.length - 1 ? "Submit Exam" : "Next"}
              <ChevronRight className="w-5 h-5 ml-2" />
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExamQuiz;
