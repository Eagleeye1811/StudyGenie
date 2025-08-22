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
            setMessages((prev) => [...prev, { type: "user", content: data.content }]);
          } else if (data.type === "assistant") {
            // Display the LLM response
            setMessages((prev) => [...prev, { type: "assistant", content: data.text }]);
      
            // Play audio if available
            if (data.audio) {
              const audioBytes = Uint8Array.from(atob(data.audio), c => c.charCodeAt(0));
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
      
          setMessages((prev) => [...prev, { type: "assistant", content: "Voice response..." }]);
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
    <div className="flex flex-col items-center justify-center p-6 min-h-screen bg-gradient-to-b from-purple-100 to-blue-100">
      <h2 className="text-3xl font-bold mb-6">Personalized Voice Assistant</h2>
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
