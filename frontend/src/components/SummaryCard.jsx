import React from 'react';
import { motion } from 'framer-motion';
import Markdown from "react-markdown";
import { Loader } from 'lucide-react';
const SummaryCard = ({ summary, isLoading }) => {



  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-md p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Subject Summary
        </h2>
      </div>
      
      {isLoading ? (
        <Loader />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="prose prose-lg max-w-none"
        >
          <Markdown>{summary}</Markdown>
          
          
        </motion.div>
      )}
    </motion.div>
  );
};

export default SummaryCard;