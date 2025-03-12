import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { 
  ArrowLeftIcon,
  SparklesIcon,
  RocketLaunchIcon,
  BeakerIcon,
  CodeBracketIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

const CreateGalaxyPage: React.FC = () => {
  const navigate = useNavigate();
  const { createGalaxy, user, logout } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'General'
  });
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { id: 'General', name: 'General', icon: SparklesIcon, color: 'from-gray-500 to-gray-600' },
    { id: 'Creativity', name: 'Creativity', icon: LightBulbIcon, color: 'from-purple-500 to-pink-500' },
    { id: 'Productivity', name: 'Productivity', icon: RocketLaunchIcon, color: 'from-blue-500 to-cyan-500' },
    { id: 'Analysis', name: 'Analysis', icon: BeakerIcon, color: 'from-green-500 to-emerald-500' },
    { id: 'Development', name: 'Development', icon: CodeBracketIcon, color: 'from-orange-500 to-red-500' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createGalaxy(formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to create galaxy:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                to="/dashboard"
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-400">
                <span>Welcome,</span>
                <span className="text-white font-medium">{user?.email}</span>
              </div>
              <button
                onClick={logout}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-thin mb-6">
            Create New
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              {" "}Galaxy
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto font-light">
            Design a specialized AI workspace tailored to your specific needs and workflow.
          </p>
        </div>

        {/* Form */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-3xl p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Galaxy Name */}
            <div>
              <label htmlFor="name" className="block text-lg font-medium text-white mb-4">
                Galaxy Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-6 py-4 bg-black border border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 transition-all duration-200 text-lg"
                placeholder="e.g., Creative Writing Hub, Data Analysis Lab..."
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-lg font-medium text-white mb-4">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={4}
                className="w-full px-6 py-4 bg-black border border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 transition-all duration-200 text-lg resize-none"
                placeholder="Describe the purpose and use cases for this galaxy..."
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-4 rounded-2xl text-lg font-medium transition-all duration-200 hover:scale-105 disabled:hover:scale-100 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Galaxy...
                  </>
                ) : (
                  'Create Galaxy'
                )}
              </button>
              
              <Link
                to="/dashboard"
                className="flex-1 sm:flex-initial border border-gray-600 text-white hover:border-gray-400 hover:bg-gray-800 px-8 py-4 rounded-2xl text-lg font-medium transition-all duration-200 hover:scale-105 text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGalaxyPage;