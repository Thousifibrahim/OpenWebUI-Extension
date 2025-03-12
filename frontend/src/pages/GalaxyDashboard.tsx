import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/store';
import { 
  PlusIcon, 
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  RocketLaunchIcon,
  BeakerIcon,
  CodeBracketIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

const GalaxyDashboard: React.FC = () => {
  const { 
    galaxies, 
    galaxyLoading, 
    galaxyError, 
    galaxiesLoaded,
    loadGalaxies, 
    setCurrentGalaxy,
    user 
  } = useStore();

  // Load galaxies only once when component mounts
  useEffect(() => {
    if (!galaxiesLoaded && !galaxyLoading) {
      loadGalaxies();
    }
  }, [galaxiesLoaded, galaxyLoading]); // Removed loadGalaxies to prevent infinite loop

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

  const getCategoryColor = (category: string): string => {
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
        return 'from-gray-500 to-slate-500';
    }
  };

  if (galaxyLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading galaxies...</p>
        </div>
      </div>
    );
  }

  if (galaxyError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error loading galaxies</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{galaxyError}</p>
          <button
            onClick={() => loadGalaxies()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Galaxy Hub
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Welcome back, {user?.full_name || 'User'}! Choose your AI Galaxy.
              </p>
            </div>
            <Link
              to="/galaxies/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Galaxy
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <SparklesIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {galaxies.length}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Active Galaxies</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  0
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Conversations</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <RocketLaunchIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Ready
                </h3>
                <p className="text-gray-600 dark:text-gray-400">System Status</p>
              </div>
            </div>
          </div>
        </div>

        {/* Galaxies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galaxies.map((galaxy) => {
            const category = galaxy.category || getGalaxyCategory(galaxy.name);
            const IconComponent = getCategoryIcon(category);
            const gradientColor = galaxy.color || getCategoryColor(category);

            return (
              <Link
                key={galaxy.id}
                to={`/galaxy/${galaxy.id}`}
                onClick={() => setCurrentGalaxy(galaxy)}
                className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
              >
                <div className={`h-32 bg-gradient-to-br ${gradientColor} p-6 relative`}>
                  <div className="flex items-center justify-between h-full">
                    <div className="text-white">
                      <div className="text-3xl mb-2">{galaxy.icon || '🌌'}</div>
                      <div className="text-sm opacity-90">{category}</div>
                    </div>
                    <IconComponent className="h-8 w-8 text-white opacity-60" />
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {galaxy.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {galaxy.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      galaxy.status === 'connected' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {galaxy.status === 'connected' ? 'Connected' : 'Connecting...'}
                    </span>
                    <div className="flex items-center space-x-1 text-gray-400">
                      <ChatBubbleLeftRightIcon className="h-4 w-4" />
                      <span className="text-xs">{galaxy.aiCount || 0} AIs</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {galaxies.length === 0 && (
          <div className="text-center py-12">
            <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No galaxies yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first AI galaxy to get started.
            </p>
            <Link
              to="/galaxies/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Your First Galaxy
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalaxyDashboard;