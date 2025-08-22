import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, BookOpen, Target, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const SubjectCard = ({ subject }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="group"
    >
      <Link to={`/subject/${subject.id}`}>
        <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className={`${subject.color} h-32 flex items-center justify-center relative overflow-hidden`}>
            <motion.div
              className="text-6xl"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {subject.emoji}
            </motion.div>
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {subject.name}
              </h3>
              <motion.div
                className="text-gray-400 group-hover:text-purple-500"
                whileHover={{ x: 5 }}
              >
                <ChevronRight className="w-6 h-6" />
              </motion.div>
            </div>
          

            {/* Gamification Stats */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <span>Points</span>
                </div>
                <span className="font-bold text-gray-900">{subject.points || 0} XP</span>
              </div>
              
            </div>
            
            <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
              <motion.div
                className={`h-full ${subject.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${subject.accuracy || 0}%` }}
                transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
              />
            </div>
            
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default SubjectCard;