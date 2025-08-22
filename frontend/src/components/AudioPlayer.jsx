import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, X } from 'lucide-react';
import { AnimatePresence,motion } from 'framer-motion';

const AudioPlayer = ({ onClose,AudioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const audioUrl = AudioUrl; //to insert audio_url received

  useEffect(() => {
    const audio = audioRef.current;
    
    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const updateDuration = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipForward = () => {
    audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, duration);
  };

  const skipBackward = () => {
    audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
  };

  const handleProgressClick = (e) => {
    const progressBar = e.currentTarget;
    const clickPosition = (e.clientX - progressBar.getBoundingClientRect().left) / progressBar.offsetWidth;
    const newTime = clickPosition * duration;
    audioRef.current.currentTime = newTime;
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <div className="bg-white rounded-2xl shadow-lg p-4 w-80 border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 text-sm">
                🎧 Subject Audio Summary
              </h4>
            
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xs p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex items-center space-x-3 mb-3">
            <button 
              onClick={skipBackward}
              className="p-2 text-gray-600 hover:text-purple-600 transition-colors"
              title="Skip 10 seconds backward"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={togglePlay}
              className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </motion.button>
            
            <button 
              onClick={skipForward}
              className="p-2 text-gray-600 hover:text-purple-600 transition-colors"
              title="Skip 10 seconds forward"
            >
              <SkipForward className="w-4 h-4" />
            </button>
            
            <div className="flex-1 mx-3">
              <div 
                className="bg-gray-200 rounded-full h-1 cursor-pointer"
                onClick={handleProgressClick}
              >
                <motion.div
                  className="bg-purple-600 h-1 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          
          {isPlaying && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-purple-600 mt-2 text-center"
            >
              🎵 Playing your personalized audio summary...
            </motion.p>
          )}

          {/* Hidden audio element */}
          <audio ref={audioRef} src={audioUrl} preload="metadata" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AudioPlayer;