import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

const Realtime = () => {
  const [messages, setMessages] = useState([]);
  const [collection, setCollection] = useState("nmc-regulations"); // 🔥 active PDF collection
  const ws = useRef(null);
  const audioChunks = useRef([]);
  const mediaRecorder = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // 🔥 Processing state
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false); // 🔥 Speaking state
  const currentAudio = useRef(null); // 🔥 Track current audio for interruption
  const messagesEndRef = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://127.0.0.1:8000/ws/assistant");

    ws.current.onopen = () => {
      // 🔥 tell backend which collection to use
      ws.current.send(`SET_COLLECTION:${collection}`);
    };

    ws.current.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "user") {
          setMessages((prev) => [
            ...prev,
            { type: "user", content: data.content },
          ]);
          setIsProcessing(true); // 🔥 Start processing when user message received
        } else if (data.type === "assistant") {
          setIsProcessing(false); // 🔥 Stop processing when assistant responds
          setMessages((prev) => [
            ...prev,
            { type: "assistant", content: data.text },
          ]);

          if (data.audio) {
            setIsAssistantSpeaking(true); // 🔥 Assistant starts speaking
            const audioBytes = Uint8Array.from(atob(data.audio), (c) =>
              c.charCodeAt(0)
            );
            const audioBlob = new Blob([audioBytes], { type: "audio/wav" });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            currentAudio.current = audio; // 🔥 Store reference for interruption

            // Handle audio end
            audio.onended = () => {
              setIsAssistantSpeaking(false);
              currentAudio.current = null;
            };

            audio.play();
          }
        }
      } catch {
        setIsProcessing(false); // 🔥 Stop processing on error
        const audioBlob = new Blob([event.data], { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        setIsAssistantSpeaking(true);
        currentAudio.current = audio;

        audio.onended = () => {
          setIsAssistantSpeaking(false);
          currentAudio.current = null;
        };

        audio.play();
        setMessages((prev) => [
          ...prev,
          { type: "assistant", content: "Voice response..." },
        ]);
      }
    };

    return () => ws.current.close();
  }, [collection]); // 🔥 re-run if collection changes

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startRecording = async () => {
    // 🔥 Interrupt assistant if speaking
    if (isAssistantSpeaking && currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current.currentTime = 0;
      setIsAssistantSpeaking(false);
      currentAudio.current = null;
    }

    // 🔥 Reset processing state when user starts speaking
    setIsProcessing(false);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    audioChunks.current = [];

    mediaRecorder.current.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.current.push(e.data);
    };

    mediaRecorder.current.onstop = () => {
      const blob = new Blob(audioChunks.current, { type: "audio/webm" });
      blob.arrayBuffer().then((buffer) => {
        if (ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(buffer);
        }
      });
      audioChunks.current = [];
    };

    mediaRecorder.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100 p-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-6">SmartGenie</h2>

        {/* GIF Container - Replacing video with image */}
        <div className="relative w-full aspect-[16/8] mb-8 rounded-xl overflow-hidden ">
          <img
            src="/Conrado-Cotomacio-Via-KLICKPIN-unscreen.gif"
            alt="Voice Interaction Animation"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Voice Control Button */}
        <div className="flex flex-col items-center mb-8">
          {/* Status Indicator */}
          {(isProcessing || isAssistantSpeaking) && (
            <div className="mb-4 flex items-center space-x-2">
              {isProcessing && (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-blue-600 font-medium">
                    Processing your request...
                  </span>
                </>
              )}
              {isAssistantSpeaking && !isProcessing && (
                <>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-green-600 font-medium">
                    Assistant is speaking...
                  </span>
                </>
              )}
            </div>
          )}

          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            disabled={isProcessing}
            className={`px-8 py-4 rounded-full font-semibold text-white transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
              isRecording
                ? "bg-red-500 shadow-lg animate-pulse"
                : isAssistantSpeaking
                ? "bg-orange-500 hover:bg-orange-600 shadow-md"
                : "bg-blue-600 hover:bg-blue-700 shadow-md"
            }`}
          >
            {isRecording
              ? "Recording..."
              : isAssistantSpeaking
              ? "Interrupt & Speak"
              : "Hold to Speak"}
          </button>
        </div>
        {/* Chat Container */}
        <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400 text-lg">
                Your assistant messages will appear here...
              </p>
            </div>
          )}
          <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl ${
                  msg.type === "assistant"
                    ? "bg-green-100/80 text-green-800 ml-4"
                    : "bg-blue-100/80 text-blue-800 mr-4"
                }`}
              >
                {msg.content}
              </div>
            ))}

            {/* Processing indicator in chat */}
            {isProcessing && (
              <div className="p-4 rounded-xl bg-yellow-100/80 text-yellow-800 ml-4 flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                <span>Assistant is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export default Realtime;
