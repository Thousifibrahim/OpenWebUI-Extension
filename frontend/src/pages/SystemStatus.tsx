import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/store';
import TopNavigation from '../components/Navigation/TopNavigation';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  CogIcon,
  KeyIcon,
  ChatBubbleLeftRightIcon,
  PhotoIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

const SystemStatus: React.FC = () => {
  const { user, checkServerConnection } = useStore();
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [features, setFeatures] = useState({
    authentication: false,
    galaxies: false,
    chat: false,
    settings: false,
    apiKeys: false,
    imageGeneration: false,
    openRouter: false
  });

  useEffect(() => {
    const checkFeatures = async () => {
      // Check server connection
      try {
        await checkServerConnection();
        setServerStatus('online');
      } catch {
        setServerStatus('offline');
      }

      // Check feature availability
      const featureTests = {
        authentication: !!user,
        galaxies: true, // We have galaxy components
        chat: true, // We have chat components
        settings: true, // We have settings page
        apiKeys: false, // Need to implement API key management
        imageGeneration: false, // Need to implement image generation
        openRouter: false // Need to implement OpenRouter integration
      };

      setFeatures(featureTests);
    };

    checkFeatures();
  }, [user, checkServerConnection]);

  const getStatusIcon = (status: boolean | 'checking') => {
    if (status === 'checking') {
      return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />;
    }
    return status ? (
      <CheckCircleIcon className="h-5 w-5 text-green-500" />
    ) : (
      <XCircleIcon className="h-5 w-5 text-red-500" />
    );
  };

  const featureList = [
    {
      name: 'Authentication System',
      key: 'authentication',
      icon: CheckCircleIcon,
      description: 'User login and session management',
      status: features.authentication
    },
    {
      name: 'Galaxy Management',
      key: 'galaxies',
      icon: CheckCircleIcon,
      description: 'Create and manage AI model groups',
      status: features.galaxies
    },
    {
      name: 'Chat Interface',
      key: 'chat',
      icon: ChatBubbleLeftRightIcon,
      description: 'Interactive chat with AI models',
      status: features.chat
    },
    {
      name: 'Settings & Configuration',
      key: 'settings',
      icon: CogIcon,
      description: 'User preferences and system settings',
      status: features.settings
    },
    {
      name: 'API Key Management',
      key: 'apiKeys',
      icon: KeyIcon,
      description: 'Manage AI provider API keys',
      status: features.apiKeys,
      priority: 'high'
    },
    {
      name: 'Image Generation',
      key: 'imageGeneration',
      icon: PhotoIcon,
      description: 'AI-powered image creation',
      status: features.imageGeneration,
      priority: 'medium'
    },
    {
      name: 'OpenRouter Integration',
      key: 'openRouter',
      icon: BeakerIcon,
      description: 'Access to multiple AI models via OpenRouter',
      status: features.openRouter,
      priority: 'high'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <TopNavigation currentPage="status" />
      
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light mb-4">System Status</h1>
          <p className="text-gray-400 text-lg">Current feature availability and system health</p>
        </div>

        {/* Server Status */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 mb-8">
          <div className="flex items-center space-x-4">
            {getStatusIcon(serverStatus === 'checking' ? 'checking' : serverStatus === 'online')}
            <div>
              <h2 className="text-xl font-medium">Backend Server</h2>
              <p className="text-gray-400">
                {serverStatus === 'checking' && 'Checking connection...'}
                {serverStatus === 'online' && 'Connected and operational'}
                {serverStatus === 'offline' && 'Unable to connect to backend'}
              </p>
            </div>
          </div>
        </div>

        {/* Feature Status */}
        <div className="space-y-6">
          <h2 className="text-2xl font-light mb-6">Feature Status</h2>
          
          {featureList.map((feature) => (
            <div
              key={feature.key}
              className={`bg-gray-900 border rounded-2xl p-6 ${
                feature.priority === 'high' ? 'border-orange-500' : 'border-gray-700'
              }`}
            >
              <div className="flex items-start space-x-4">
                {getStatusIcon(feature.status)}
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium">{feature.name}</h3>
                    {feature.priority === 'high' && (
                      <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-medium rounded-lg">
                        High Priority
                      </span>
                    )}
                    {feature.priority === 'medium' && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-lg">
                        Medium Priority
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 mt-1">{feature.description}</p>
                  {!feature.status && (
                    <p className="text-red-400 text-sm mt-2">
                      ⚠️ Not implemented yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-800 rounded-2xl p-8 mt-12">
          <h2 className="text-2xl font-light mb-6">Immediate Next Steps</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                1
              </div>
              <div>
                <h3 className="font-medium">Implement API Key Management</h3>
                <p className="text-gray-400 text-sm">Enable users to configure their AI provider API keys</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                2
              </div>
              <div>
                <h3 className="font-medium">Connect OpenRouter Integration</h3>
                <p className="text-gray-400 text-sm">Enable access to multiple AI models through OpenRouter API</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                3
              </div>
              <div>
                <h3 className="font-medium">Add Image Generation</h3>
                <p className="text-gray-400 text-sm">Implement image generation capabilities using AI models</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center space-x-4 mt-12">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
          
          <Link
            to="/chat/1"
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
            <span>Start Chat</span>
          </Link>
          
          <Link
            to="/image-generation"
            className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            <PhotoIcon className="h-4 w-4" />
            <span>Generate Images</span>
          </Link>
          
          <Link
            to="/settings"
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg transition-colors"
          >
            <CogIcon className="h-4 w-4" />
            <span>Go to Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;