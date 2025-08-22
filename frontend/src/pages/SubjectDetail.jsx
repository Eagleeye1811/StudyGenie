import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Headphones, Brain} from 'lucide-react';
import SummaryCard from '../components/SummaryCard';
import AudioPlayer from '../components/AudioPlayer';
import axios from 'axios';
import Loader from "../components/Loader"

const SubjectDetail = () => {
  const { subjectId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [response , setResponse] = useState([]);

  useEffect(() => {
  const fetchData = async () =>{
    try {
      console.log("hit");
      
      setIsLoading(true)
      const {data}  = await axios.get(`http://localhost:8000/api/summarize/summaries/${subjectId}`)
      setResponse(data[0]);
      console.log("Response from server: ",data[0]);
      setIsLoading(false);
    
   } catch (error) {
    console.log("the error is ",error);
   }

  }
  fetchData();
  }, [subjectId]);

  const handleAudioClick = () => {
    setShowAudioPlayer(true);
  };

  const handleCloseAudio = () => {
    setShowAudioPlayer(false);
  };

  if(!response?.summary || isLoading){<Loader/>}
  

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link to="/" className="mr-4 p-2 rounded-full hover:bg-white/50 transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
               {response.name}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          <div className="lg:col-span-2">
            <SummaryCard summary={response.summary} isLoading={isLoading} />
          </div>

          <div className="flex flex-col gap-4 w-full">
            <button
              onClick={handleAudioClick}
              className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
            >
              <Headphones className="w-5 h-5 mr-2" />
              Listen to Audio 🎧
            </button>
            <Link
              to={`/flashcards/${subjectId}`}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Brain className="w-5 h-5 mr-2" />
              Practice Flashcards
            </Link>
          </div>
        </div>
      </div>

      {/* Render AudioPlayer when showAudioPlayer is true */}
      {showAudioPlayer && <AudioPlayer onClose={handleCloseAudio} AudioUrl={response.audio_path} />}
    </div>
  );
};

export default SubjectDetail;