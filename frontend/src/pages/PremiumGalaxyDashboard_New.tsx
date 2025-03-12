import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/store';
import TopNavigation from '../components/Navigation/TopNavigation';
import { 
  PlusIcon, 
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  RocketLaunchIcon,
  BeakerIcon,
  CodeBracketIcon,
  LightBulbIcon,
  ArrowRightIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const PremiumGalaxyDashboard: React.FC = () => {
  const { 
    galaxies, 
    galaxyLoading, 
    galaxyError, 
    galaxiesLoaded,
    loadGalaxies, 
    setCurrentGalaxy
  } = useStore();

  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    if (!galaxiesLoaded && !galaxyLoading) {
      loadGalaxies();
    }
  }, [galaxiesLoaded, galaxyLoading, loadGalaxies]);

  const getGalaxyCategory = (galaxyName: string): string => {
    if (galaxyName.toLowerCase().includes('creative') || galaxyName.toLowerCase().includes('writing')) {
      return 'Creativity';
    } else if (galaxyName.toLowerCase().includes('productivity') || galaxyName.toLowerCase().includes('work')) {
      return 'Productivity';
    } else if (galaxyName.toLowerCase().includes('analysis') || galaxyName.toLowerCase().includes('data')) {
      return 'Analysis';
    } else if (galaxyName.toLowerCase().includes('development') || galaxyName.toLowerCase().includes('code')) {
      return 'Development';
    }
    return 'General';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Creativity':
        return LightBulbIcon;
      case 'Productivity':
        return RocketLaunchIcon;
      case 'Analysis':
        return BeakerIcon;
      case 'Development':
        return CodeBracketIcon;
      default:
        return SparklesIcon;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Creativity':
        return 'from-purple-500 to-pink-500';
      case 'Productivity':
        return 'from-blue-500 to-cyan-500';
      case 'Analysis':
        return 'from-green-500 to-emerald-500';
      case 'Development':
        return 'from-orange-500 to-red-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const filters = ['All', 'Creativity', 'Productivity', 'Analysis', 'Development', 'General'];
  
  const filteredGalaxies = activeFilter === 'All' 
    ? galaxies 
    : galaxies.filter(galaxy => getGalaxyCategory(galaxy.name) === activeFilter);

  if (galaxyLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your galaxies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <TopNavigation currentPage="dashboard" />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-light mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
            Your AI Galaxy
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Organize your AI conversations by purpose and context. Each galaxy represents a different domain of interaction.
          </p>
          
          <Link
            to="/create-galaxy"
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-full text-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-2xl"
          >
            <PlusIcon className="h-6 w-6" />
            <span>Create New Galaxy</span>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                activeFilter === filter
                  ? 'bg-white text-black'
                  : 'bg-gray-900 border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Error State */}
        {galaxyError && (
          <div className="bg-red-900/50 border border-red-700 rounded-2xl p-6 mb-8">
            <p className="text-red-300">Error loading galaxies: {galaxyError}</p>
          </div>
        )}

        {/* Galaxies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGalaxies.map((galaxy) => {
            const category = getGalaxyCategory(galaxy.name);
            const Icon = getCategoryIcon(category);
            const gradientColor = getCategoryColor(category);
            
            return (
              <Link
                key={galaxy.id}
                to={`/chat/${galaxy.id}`}
                className="group"
                onClick={() => setCurrentGalaxy(galaxy)}
              >
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-8 hover:border-gray-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  {/* Galaxy Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-br ${gradientColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  
                  {/* Galaxy Info */}
                  <h3 className="text-xl font-medium mb-3 group-hover:text-blue-400 transition-colors">
                    {galaxy.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-6 line-clamp-3">
                    {galaxy.description}
                  </p>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <ChatBubbleLeftRightIcon className="h-4 w-4" />
                        <span>5 chats</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <StarIcon className="h-4 w-4" />
                        <span>{category}</span>
                      </div>
                    </div>
                    
                    <ArrowRightIcon className="h-5 w-5 text-gray-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredGalaxies.length === 0 && !galaxyLoading && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <SparklesIcon className="h-12 w-12 text-gray-600" />
            </div>
            <h3 className="text-2xl font-light mb-4">
              {activeFilter === 'All' ? 'No galaxies yet' : `No ${activeFilter.toLowerCase()} galaxies`}
            </h3>
            <p className="text-gray-400 mb-8">
              {activeFilter === 'All' 
                ? 'Create your first galaxy to start organizing your AI conversations.'
                : `Create a ${activeFilter.toLowerCase()} galaxy to get started.`
              }
            </p>
            <Link
              to="/create-galaxy"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Create Galaxy</span>
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link to="/status" className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-800 rounded-2xl p-8 text-center hover:border-blue-600 transition-colors">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <RocketLaunchIcon className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">System Status</h3>
            <p className="text-gray-400 text-sm">
              Check feature availability and system health.
            </p>
          </Link>
          
          <Link to="/settings" className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border border-purple-800 rounded-2xl p-8 text-center hover:border-purple-600 transition-colors">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BeakerIcon className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">Settings</h3>
            <p className="text-gray-400 text-sm">
              Configure API keys and system preferences.
            </p>
          </Link>
          
          <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-800 rounded-2xl p-8 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">Import</h3>
            <p className="text-gray-400 text-sm">
              Import conversations from other AI platforms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumGalaxyDashboard;