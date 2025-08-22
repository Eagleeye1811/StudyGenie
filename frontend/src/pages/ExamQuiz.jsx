import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
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
      setShowResult(true);
      return;
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

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8 justify-between">
          <div className="flex items-center">
            <Link
              to={`/subject/${subjectId}`}
              className="mr-4 p-2 rounded-full hover:bg-white/50 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Exam Simulator
              </h1>
              <p className="text-gray-600 mt-2">
                Question {currentQuestion + 1} of {response.length}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono text-lg px-4 py-2 bg-gray-200 rounded-lg">
              ⏱️ {formatTimer(timer)}
            </span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6">{currentQ.question}</h2>
          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full p-4 text-left rounded-lg border transition-all ${
                  selectedAnswer === option
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className={`mt-6 w-full flex items-center justify-center px-6 py-3 rounded-xl transition-colors ${
              selectedAnswer
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {currentQuestion === response.length - 1 ? "Finish" : "Next"}
            <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamQuiz;
