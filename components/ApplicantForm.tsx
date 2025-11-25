import React, { useState } from 'react';
import { ApplicantData } from '../types';

interface ApplicantFormProps {
  onSubmit: (data: ApplicantData) => void;
  onBack: () => void;
}

const ApplicantForm: React.FC<ApplicantFormProps> = ({ onSubmit, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    experience: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
        formData.name.trim() && 
        formData.role.trim() && 
        formData.email.trim() &&
        formData.experience.trim()
    ) {
      onSubmit({
          id: crypto.randomUUID(),
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: formData.role.trim(),
          experience: formData.experience.trim(),
          timestamp: Date.now()
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-700">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome to Eburon</h2>
            <p className="text-gray-400">Please provide your details to begin the interview process.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
            <input
              type="text"
              id="name"
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400 outline-none transition-all"
              placeholder="e.g. Jane Doe"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
            <input
              type="email"
              id="email"
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400 outline-none transition-all"
              placeholder="e.g. jane@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">Role Applying For</label>
            <input
              type="text"
              id="role"
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400 outline-none transition-all"
              placeholder="e.g. Senior Project Manager"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            />
          </div>

          <div>
            <label htmlFor="experience" className="block text-sm font-medium text-gray-300 mb-1">Brief Experience Summary</label>
            <textarea
              id="experience"
              rows={4}
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400 outline-none transition-all resize-none"
              placeholder="e.g. 5 years in IT project management, specializing in agile methodologies..."
              value={formData.experience}
              onChange={(e) => setFormData({...formData, experience: e.target.value})}
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5"
          >
            Continue to Interview Setup
          </button>
        </form>
        <button onClick={onBack} className="w-full text-center mt-6 text-gray-500 hover:text-white text-sm">
            &larr; Back to Home
        </button>
      </div>
    </div>
  );
};

export default ApplicantForm;
