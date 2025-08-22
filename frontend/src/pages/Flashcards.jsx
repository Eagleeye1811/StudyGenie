import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Loader from "../components/Loader";

const Flashcards = () => {
  const { subjectId } = useParams();
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [current, setCurrent] = useState(0);
  const [slide, setSlide] = useState("");
  // const [transitioning, setTransitioning] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await fetch(
          `http://localhost:8000/api/summarize/flashcards/${subjectId}`
        ).then((res) => res.json());
        // Use Gemini-generated precise bullets
        if (data && Array.isArray(data.bullets)) {
          // Group bullets into sets of 3 per card
          const grouped = [];
          for (let i = 0; i < data.bullets.length; i += 3) {
            grouped.push(data.bullets.slice(i, i + 3));
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

  const handleFlip = () => {
    setFlipped((f) => !f);
  };

  const handleNext = () => {
    if (current < cards.length - 1) {
      setFlipped(false);
      setTimeout(() => {
        setSlide("slide-out-left");
        setTimeout(() => {
          setCurrent((c) => c + 1);
          setSlide("slide-in-right");
          setTimeout(() => setSlide(""), 350);
        }, 350);
      }, 500); // wait for flip
    }
  };

  const handlePrev = () => {
    if (current > 0) {
      setFlipped(false);
      setTimeout(() => {
        setSlide("slide-out-right");
        setTimeout(() => {
          setCurrent((c) => c - 1);
          setSlide("slide-in-left");
          setTimeout(() => setSlide(""), 350);
        }, 350);
      }, 500);
    }
  };

  if (isLoading || cards.length === 0) {
    return <Loader />;
  }

  const card = cards[current];

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center">
      <div className="max-w-xl w-full">
        <div className="flex items-center mb-8">
          <Link
            to={`/subject/${subjectId}`}
            className="mr-4 p-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Flashcards</h1>
        </div>
        <div className="flex flex-col items-center">
          <div
            className="perspective mb-6"
            style={{ perspective: "1000px", width: "100%" }}
          >
            <div
              ref={cardRef}
              className={`relative w-full h-56 transition-transform duration-500 transform ${
                flipped ? "rotate-y-180" : ""
              } ${slide}`}
              style={{ transformStyle: "preserve-3d" }}
              onClick={handleFlip}
            >
              {/* Front */}
              <div
                className="absolute w-full h-full flex items-center justify-center bg-blue-600 text-white rounded-xl shadow-lg cursor-pointer backface-hidden text-2xl font-semibold"
                style={{ backfaceVisibility: "hidden" }}
              >
                {card.front}
              </div>
              {/* Back */}
              <div
                className="absolute w-full h-full flex items-center justify-center bg-white text-blue-700 rounded-xl shadow-lg cursor-pointer backface-hidden text-lg font-normal px-6"
                style={{
                  transform: "rotateY(180deg)",
                  backfaceVisibility: "hidden",
                }}
              >
                {card.back}
              </div>
            </div>
          </div>
          <div className="flex justify-between w-full mt-2">
            <button
              onClick={handlePrev}
              disabled={current === 0}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                current === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Previous
            </button>
            <span className="text-lg font-medium text-gray-700">
              {current + 1} / {cards.length}
            </span>
            <button
              onClick={handleNext}
              disabled={current === cards.length - 1}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                current === cards.length - 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Next
            </button>
          </div>
        </div>
        <style>{`
          .rotate-y-180 { transform: rotateY(180deg); }
          .perspective { perspective: 1000px; }
          .slide-in-right {
            animation: slideInRight 0.35s forwards;
          }
          .slide-in-left {
            animation: slideInLeft 0.35s forwards;
          }
          .slide-out-left {
            animation: slideOutLeft 0.35s forwards;
          }
          .slide-out-right {
            animation: slideOutRight 0.35s forwards;
          }
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(60px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-60px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes slideOutLeft {
            from { opacity: 1; transform: translateX(0); }
            to { opacity: 0; transform: translateX(-60px); }
          }
          @keyframes slideOutRight {
            from { opacity: 1; transform: translateX(0); }
            to { opacity: 0; transform: translateX(60px); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Flashcards;
