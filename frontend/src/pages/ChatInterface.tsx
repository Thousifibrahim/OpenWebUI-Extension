import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import {
  PaperAirplaneIcon,
  ArrowLeftIcon,
  SparklesIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const ChatInterface: React.FC = () => {
  const { galaxyId } = useParams<{ galaxyId: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState('');
  
  const {
    currentGalaxy,
    galaxies,
    messages,
    chatLoading,
    chatError,
    loadChatHistory,
    sendMessage,
    setCurrentGalaxy
  } = useStore();

  // Find the galaxy by ID
  useEffect(() => {
    if (galaxyId && galaxies.length > 0) {
      const galaxy = galaxies.find(g => g.id === parseInt(galaxyId));
      if (galaxy) {
        setCurrentGalaxy(galaxy);
      }
    }
  }, [galaxyId, galaxies, setCurrentGalaxy]);

  // Load chat history when galaxy changes
  useEffect(() => {
    if (currentGalaxy) {
      loadChatHistory();
    }
  }, [currentGalaxy, loadChatHistory]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || chatLoading) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    
    try {
      await sendMessage(messageText);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!currentGalaxy) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
            No Galaxy Selected
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Please select a galaxy to start chatting
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{currentGalaxy.icon || '🌌'}</div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {currentGalaxy.name}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentGalaxy.status === 'connected' ? 'Connected' : 'Connecting...'}
                </p>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {currentGalaxy.aiCount || 0} AI models available
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && !chatLoading && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">{currentGalaxy.icon || '🌌'}</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Welcome to {currentGalaxy.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {currentGalaxy.description}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
              Start a conversation to begin exploring this galaxy's capabilities
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`flex max-w-xs lg:max-w-md ${
                message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div className={`flex-shrink-0 ${
                message.sender === 'user' ? 'ml-3' : 'mr-3'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender === 'user'
                    ? 'bg-blue-600'
                    : 'bg-gray-700 dark:bg-gray-600'
                }`}>
                  {message.sender === 'user' ? (
                    <UserIcon className="h-5 w-5 text-white" />
                  ) : (
                    <SparklesIcon className="h-5 w-5 text-white" />
                  )}
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border dark:border-gray-700'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' 
                    ? 'text-blue-100' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}

        {chatLoading && (
          <div className="flex justify-start">
            <div className="flex">
              <div className="mr-3">
                <div className="w-8 h-8 rounded-full bg-gray-700 dark:bg-gray-600 flex items-center justify-center">
                  <SparklesIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {chatError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200 text-sm">{chatError}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-6">
        <form onSubmit={handleSendMessage} className="flex space-x-4">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message ${currentGalaxy.name}...`}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              disabled={chatLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || chatLoading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 
                       text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;