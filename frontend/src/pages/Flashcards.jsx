import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Loader from "../components/Loader";

const Flashcards = () => {
  const { subjectId } = useParams();
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await fetch(
          `http://localhost:8000/api/summarize/flashcards/${subjectId}`
        ).then((res) => res.json());
        // Use Gemini-generated precise flashcards
        if (data && Array.isArray(data.flashcards)) {
          // Group flashcards into sets of 3 per card
          const grouped = [];
          for (let i = 0; i < data.flashcards.length; i += 3) {
            grouped.push(data.flashcards.slice(i, i + 3));
          }
          setCards(
            grouped.map((group, idx) => ({
              front: `Flashcard ${idx + 1}`,
              back: (
                <ul className="list-disc pl-6 text-left">
                  {group.map((point, j) => (
                    <li key={j}>{point.trim()}</li>
                  ))}
                </ul>
              ),
            }))
          );
        } else {
          setCards([]);
        }
      } catch (error) {
        setCards([error]);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [subjectId]);

  const handleNext = () => {
    if (current < cards.length - 1) {
      setCurrent((c) => c + 1);
    }
  };

  const handlePrev = () => {
    if (current > 0) {
      setCurrent((c) => c - 1);
    }
  };

  if (isLoading || cards.length === 0) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-white">
      <div className="max-w-2xl w-full">
        <div
          className="flex items-center gap-2"
          style={{ position: "absolute", top: 32, left: 32, zIndex: 30 }}
        >
          <Link
            to={`/subject/${subjectId}`}
            className="p-2 rounded-full hover:bg-blue-300 transition-all flex items-center"
            style={{ boxShadow: "0 4px 16px 0 rgba(31, 38, 135, 0.17)" }}
          >
            <ArrowLeft className="w-6 h-6 text-black" />
          </Link>
          <span
            className="text-3xl font-semibold text-black tracking-wide"
            style={{
              fontFamily: "Inter, Montserrat, Arial, sans-serif",
              letterSpacing: "1px",
            }}
          >
            Flashcards
          </span>
        </div>
        <div className="relative flex items-center justify-center h-[28rem] select-none">
          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            disabled={current === 0}
            className={`absolute left-0 z-10 p-4 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all ${
              current === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            style={{ top: "50%", transform: "translateY(-50%)" }}
          >
            <ChevronLeft className="w-10 h-10 text-blue-600" />
          </button>
          {/* Cards Carousel */}
          <div className="flex items-center justify-center w-full h-full">
            {cards.map((card, idx) => {
              const offset = idx - current;
              const isActive = offset === 0;
              const isPrev = offset === -1;
              const isNext = offset === 1;
              return (
                <div
                  key={idx}
                  className={`absolute card-shadow transition-transform duration-300 ${
                    isActive
                      ? "z-20"
                      : isPrev
                      ? "z-10"
                      : isNext
                      ? "z-10"
                      : "z-0 pointer-events-none"
                  }`}
                  style={{
                    left: isActive
                      ? "50%"
                      : isPrev
                      ? "30%"
                      : isNext
                      ? "70%"
                      : "50%",
                    top: "50%",
                    transform: isActive
                      ? "translate(-50%, -50%) scale(1)"
                      : isPrev
                      ? "translate(-50%, -50%) scale(0.9)"
                      : isNext
                      ? "translate(-50%, -50%) scale(0.9)"
                      : "translate(-50%, -50%) scale(0.85)",
                    width: isActive ? "420px" : "320px",
                    height: isActive ? "400px" : "340px",
                    background: isActive
                      ? "linear-gradient(135deg, #fff 80%, #e0f2fe 100%)"
                      : "linear-gradient(135deg, #f3e7e9 80%, #e0f2fe 100%)",
                    boxShadow: isActive
                      ? "0 12px 40px 0 rgba(31, 38, 135, 0.37)"
                      : "0 4px 16px 0 rgba(31, 38, 135, 0.17)",
                    borderRadius: "32px",
                    padding: "40px 32px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: isActive ? "pointer" : "default",
                    // No transition or animation
                    overflow: "hidden",
                  }}
                >
                  <div
                    className={`text-3xl font-extrabold text-blue-600 mb-6 text-center tracking-wide`}
                    style={{ letterSpacing: "1px" }}
                  >
                    {card.front}
                  </div>
                  <div
                    className={`text-lg text-gray-700 text-center w-full font-mono fadein-text`}
                    style={{
                      wordBreak: "break-word",
                      fontFamily: "Montserrat, Arial, sans-serif",
                    }}
                  >
                    {card.back}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Right Arrow */}
          <button
            onClick={handleNext}
            disabled={current === cards.length - 1}
            className={`absolute right-0 z-10 p-4 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all ${
              current === cards.length - 1
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            style={{ top: "50%", transform: "translateY(-50%)" }}
          >
            <ChevronRight className="w-10 h-10 text-blue-600" />
          </button>
        </div>
        <div className="flex justify-center mt-8">
          <span className="text-xl font-bold text-white drop-shadow-lg tracking-wide">
            {current + 1} / {cards.length}
          </span>
        </div>
        <style>{`
          .card-shadow {
            box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.37);
          }
          .fadein-text {
            opacity: 0;
            animation: fadein 1.2s forwards;
          }
          @keyframes fadein {
            to {
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Flashcards;
