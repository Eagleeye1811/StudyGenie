import React, { useEffect, useRef, useState } from "react";

const Realtime = () => {
  const [messages, setMessages] = useState([]);
  const [collection, setCollection] = useState("nmc-regulations"); // 🔥 active PDF collection
  const ws = useRef(null);
  const audioChunks = useRef([]); 
  const mediaRecorder = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
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
          setMessages((prev) => [...prev, { type: "user", content: data.content }]);
        } else if (data.type === "assistant") {
          setMessages((prev) => [...prev, { type: "assistant", content: data.text }]);

          if (data.audio) {
            const audioBytes = Uint8Array.from(atob(data.audio), c => c.charCodeAt(0));
            const audioBlob = new Blob([audioBytes], { type: "audio/wav" });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play();
          }
        }
      } catch {
        const audioBlob = new Blob([event.data], { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();

        setMessages((prev) => [...prev, { type: "assistant", content: "Voice response..." }]);
      }
    };

    return () => ws.current.close();
  }, [collection]); // 🔥 re-run if collection changes

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startRecording = async () => {
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
    <div className="flex flex-col items-center justify-center p-6 min-h-screen bg-gradient-to-b from-purple-100 to-blue-100">
      <h2 className="text-3xl font-bold mb-6">Personalized Voice Assistant</h2>

      {/* 🔥 Dropdown to switch PDFs (collections) */}
      <select
        value={collection}
        onChange={(e) => setCollection(e.target.value)}
        className="mb-4 p-2 rounded-md border"
      >
        <option value="nmc-regulations">NMC Regulations</option>
        <option value="mbbs-guide">MBBS Guide</option>
        <option value="ai-research">AI Research Paper</option>
      </select>

      <button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        className={`px-6 py-3 mb-6 rounded-full font-semibold text-white ${
          isRecording ? "bg-red-500 shadow-lg" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isRecording ? "Recording..." : "Hold to Speak"}
      </button>

      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-4 overflow-y-auto h-96">
        {messages.length === 0 && <p className="text-gray-400">Your assistant messages will appear here...</p>}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`my-2 p-2 rounded-lg ${
              msg.type === "assistant" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
            }`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default Realtime;