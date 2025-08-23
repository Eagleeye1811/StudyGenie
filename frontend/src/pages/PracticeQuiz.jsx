import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import Loader from "../components/Loader";

const PracticeQuiz = () => {
  const { subjectId } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answerResults, setAnswerResults] = useState([]);
  const [isloading, setIsLoading] = useState(false);
  const [response, setResponse] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(
          `http://localhost:8000/api/summarize/quiz/${subjectId}?timed=false`
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

  const isFallback =
    response.length === 1 && response[0].question === "Fallback Question?";
  if (isloading || response.length === 0 || isFallback) {
    return <Loader />;
  }

  if (showResult) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4 text-purple-700">
            Quiz Complete! 🎉
          </h2>
          <p className="text-xl mb-6 text-gray-700">
            Your Score:{" "}
            <span className="font-bold text-purple-600">
              {score} / {response.length}
            </span>
          </p>
          <div className="mb-6 text-left">
            <h3 className="font-semibold mb-2">Your Answers:</h3>
            <ul className="space-y-3">
              {answerResults.map((result, idx) => (
                <li
                  key={idx}
                  className="p-4 rounded-xl border bg-gray-50 flex flex-col"
                >
                  <span className="font-medium text-gray-800">
                    Q{idx + 1}: {result.question}
                  </span>
                  <span>
                    Your answer:{" "}
                    <span
                      className={
                        result.isCorrect ? "text-green-600" : "text-red-600"
                      }
                    >
                      {result.selected}
                    </span>
                  </span>
                  {!result.isCorrect && (
                    <span>
                      Correct answer:{" "}
                      <span className="text-green-600">{result.correct}</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <Link
            to="/"
            className="inline-block rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 font-semibold shadow-lg hover:opacity-90"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const currentQ = response[currentQuestion];
  const progress = ((currentQuestion + 1) / response.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
      <div className="max-w-lg w-full">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-6 shadow-inner">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            {currentQ.question}
          </h2>
          <div className="space-y-4">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full p-4 text-left rounded-xl border transition-all duration-200 shadow-sm ${
                  selectedAnswer === option
                    ? "border-purple-500 bg-purple-50 ring-2 ring-purple-300"
                    : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className={`mt-8 w-full flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md ${
              selectedAnswer
                ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white"
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

export default PracticeQuiz;
