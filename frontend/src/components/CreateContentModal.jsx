import { X, Upload } from 'lucide-react';
import React, { useState } from 'react';
import axios from 'axios';

function CreateContentModal({ isOpen, onClose, onContentAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    pdfFile: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setUploadProgress(0);
    
    try {
      // Create FormData object for file upload
      const apiFormData = new FormData();
      apiFormData.append('file', formData.pdfFile);
      apiFormData.append('name',formData.name);
      
      // Send file to backend with progress tracking
      const response = await axios.post('http://localhost:8000/api/summarize/pdf', apiFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });
      
      // Handle successful response
      const processedData = {
        id: Date.now(),
        name: formData.name,
        pdfFile: formData.pdfFile,
        summary: response.data.summary,
        audio_path: response.data.audio_path,
        quiz: response.data.quiz,
        summary_id: response.data.summary_id,
        quiz_id: response.data.quiz_id
      };
      
      // Call the callback with processed data
      onContentAdded(processedData);
      
      // Reset form and close modal
      setFormData({ name: '', pdfFile: null });
      onClose();
    } catch (error) {
      console.error('Error processing PDF:', error);
      setError(error.response?.data?.detail || 'Failed to process PDF. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData({ ...formData, pdfFile: file });
    } else {
      setError('Please select a valid PDF file');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Subject</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Subject Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter name of subject"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="pdfFile" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Upload PDF
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors">
              <input
                type="file"
                id="pdfFile"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                required
              />
              <label htmlFor="pdfFile" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formData.pdfFile ? formData.pdfFile.name : 'Click to upload PDF file'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Only PDF files are allowed
                </p>
              </label>
            </div>
            {formData.pdfFile && (
              <p className="text-xs text-green-600 dark:text-green-400">
                ✓ {formData.pdfFile.name} selected
              </p>
            )}
          </div>

          {isSubmitting && (
            <div className="space-y-2">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {uploadProgress < 100 ? 'Uploading...' : 'Processing PDF...'}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2.5 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-500 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || !formData.pdfFile}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Create Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateContentModal;