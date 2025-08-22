import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreateContentModal from "../components/CreateContentModal";
import { Plus,Target } from 'lucide-react';
import SubjectCard from '../components/SubjectCard';
import LineChart from '../components/LineChart';
import PieChart from '../components/PieChart';

const Subjects = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Color palette for dynamic assignment
  const colorClasses = [
     '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B',
    '#EF4444', '#6366F1', '#6B7280'
  ];

  const colorClass = [
     'bg-blue-500', 'bg-purple-500', 'bg-green-500', 
    'bg-orange-500', 'bg-red-500', 'bg-indigo-500',
    'bg-pink-500', 'bg-yellow-500', 'bg-teal-500'
  ];

  // Fetch subjects from MongoDB
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/api/summarize/summaries');
        
        // Transform MongoDB data to match our subject format
        const transformedSubjects = response.data.map((item, index) => ({
          id: item._id,
          name: item.name,
          color: colorClass[index % colorClass.length], // Tailwind class for SubjectCard
          hexColor: colorClasses[index % colorClasses.length], // Hex code for PieChart
          points: item.score || 0,
          accuracy: ((item.score)/5)*100,
          summary: item.summary,
          audio_path: item.audio_path,
          percentage: ((item.score)/5)*100
        }));
        
        setSubjects(transformedSubjects);
        setError(null);
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setError('Failed to load subjects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  

  // Calculate total XP
  const totalXP = subjects.reduce((sum, subject) => sum + subject.points, 0);

  const handleContentAdded = (newContent) => {
    // Add the new subject to the list with real data
    const newSubject = {
      id: newContent.summary_id,
      name: newContent.name,
      color: colorClass[subjects.length % colorClass.length], // Tailwind class
      hexColor: colorClasses[subjects.length % colorClasses.length], // Hex code
      points: newContent.score || 0,
      accuracy: 0,
      summary: newContent.summary,
      audio_path: newContent.audio_path
    };
    
    setSubjects([...subjects, newSubject]);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Welcome Back, Molly!
              </h1>
              <p className="text-gray-600 mt-2">
                Keep up the amazing progress! 
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-md transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Content
            </button>
            <div className="flex items-center bg-black text-white px-4 py-2 rounded-full">
              <Target className="w-4 h-4 mr-2" />
              <span className="font-bold">{totalXP} XP</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <LineChart quizData={subjects} />
          <PieChart subjects={subjects} />
        </div>

        {/* Subjects Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Your Subjects 
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4 rounded-md bg-red-50">
            {error}
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center text-gray-500 p-8">
            <p className="text-xl">No subjects found</p>
            <p className="mt-2">Click on "Create Content" to add your first subject</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        )}

        <CreateContentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onContentAdded={handleContentAdded}
        />
      </div>
    </div>
  );
};

export default Subjects;