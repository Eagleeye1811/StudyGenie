import React, { useEffect, useRef, useState } from "react";

const Realtime = () => {
  const [messages, setMessages] = useState([]);
  const ws = useRef(null);
  const audioChunks = useRef([]);
  const mediaRecorder = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://127.0.0.1:8000/ws/assistant");

    ws.current.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "user") {
          // Display the spoken query
          setMessages((prev) => [
            ...prev,
            { type: "user", content: data.content },
          ]);
        } else if (data.type === "assistant") {
          // Display the LLM response
          setMessages((prev) => [
            ...prev,
            { type: "assistant", content: data.text },
          ]);

          // Play audio if available
          if (data.audio) {
            const audioBytes = Uint8Array.from(atob(data.audio), (c) =>
              c.charCodeAt(0)
            );
            const audioBlob = new Blob([audioBytes], { type: "audio/wav" });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play();
          }
        }
      } catch {
        // fallback in case something is raw audio
        const audioBlob = new Blob([event.data], { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();

        setMessages((prev) => [
          ...prev,
          { type: "assistant", content: "Voice response..." },
        ]);
      }
    };

    return () => ws.current.close();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    audioChunks.current = []; // Reset chunks

    mediaRecorder.current.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.current.push(e.data); // collect all chunks
    };

    mediaRecorder.current.onstop = () => {
      const blob = new Blob(audioChunks.current, { type: "audio/webm" });
      blob.arrayBuffer().then((buffer) => {
        if (ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(buffer); // send full recording once
        }
      });
      audioChunks.current = [];
    };

    mediaRecorder.current.start(); // no interval, just record full audio
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop(); // triggers onstop
      setIsRecording(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100 p-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-6">SmartGenie</h2>

        {/* GIF Container - Replacing video with image */}
        <div className="relative w-full aspect-[16/9] mb-8 rounded-2xl overflow-hidden ">
          <img
            src="/Conrado-Cotomacio-Via-KLICKPIN-unscreen.gif"
            alt="Voice Interaction Animation"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Voice Control Button */}
        <div className="flex justify-center mb-8">
          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            className={`px-8 py-4 rounded-full font-semibold text-white transition-all transform hover:scale-105 ${
              isRecording
                ? "bg-red-500 shadow-lg animate-pulse"
                : "bg-blue-600 hover:bg-blue-700 shadow-md"
            }`}
          >
            {isRecording ? "Recording..." : "Hold to Speak"}
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
