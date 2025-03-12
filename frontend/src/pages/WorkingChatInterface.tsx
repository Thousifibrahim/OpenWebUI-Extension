import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import TopNavigation from '../components/Navigation/TopNavigation';
import AIService, { useAPIKeys, ChatMessage, AIModel } from '../services/aiService';
import {
  PaperAirplaneIcon,
  ArrowLeftIcon,
  SparklesIcon,
  UserIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  CogIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

const WorkingChatInterface: React.FC = () => {
  const { galaxyId } = useParams<{ galaxyId: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getApiKey } = useAPIKeys();
  const aiService = AIService.getInstance();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { currentGalaxy, galaxies, setCurrentGalaxy } = useStore();

  // Available models
  const availableModels = aiService.getModels();
  
  // Find the galaxy by ID
  useEffect(() => {
    if (galaxyId && galaxies.length > 0) {
      const galaxy = galaxies.find(g => g.id === parseInt(galaxyId));
      if (galaxy) {
        setCurrentGalaxy(galaxy);
      }
    }
  }, [galaxyId, galaxies, setCurrentGalaxy]);

  // Set default model
  useEffect(() => {
    if (availableModels.length > 0 && !selectedModel) {
      setSelectedModel(availableModels[0]);
    }
  }, [availableModels, selectedModel]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversation history
  useEffect(() => {
    const savedMessages = localStorage.getItem(`chat_${galaxyId}`);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        const messagesWithDates = parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    } else {
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `Welcome to ${currentGalaxy?.name || 'AI Chat'}! I'm ready to help you. What would you like to talk about?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [galaxyId, currentGalaxy]);

  // Save messages to localStorage
  const saveMessages = (newMessages: ChatMessage[]) => {
    localStorage.setItem(`chat_${galaxyId}`, JSON.stringify(newMessages));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isLoading || !selectedModel) return;
    
    // Check if API key is available
    const apiKey = getApiKey(selectedModel.provider);
    if (!apiKey) {
      setError(`No API key found for ${selectedModel.provider}. Please add your API key in settings.`);
      return;
    }

    setError(null);
    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: newMessage.trim(),
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setNewMessage('');
    
    try {
      // Send to AI service
      const assistantMessage = await aiService.sendMessage(
        newMessages,
        selectedModel,
        apiKey,
        {
          temperature: 0.7,
          maxTokens: 2048
        }
      );

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      saveMessages(finalMessages);
      
    } catch (error: any) {
      console.error('Chat error:', error);
      setError(`Failed to send message: ${error.message}`);
      
      // Remove the user message on error
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    if (window.confirm('Are you sure you want to clear this conversation?')) {
      setMessages([]);
      localStorage.removeItem(`chat_${galaxyId}`);
    }
  };

  const getModelProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai':
        return '🤖';
      case 'anthropic':
        return '🎭';
      case 'openrouter':
        return '🌐';
      default:
        return '🤖';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <TopNavigation currentPage="chat" />
      
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              
              <div>
                <h1 className="text-xl font-medium">{currentGalaxy?.name || 'AI Chat'}</h1>
                <p className="text-sm text-gray-400">{currentGalaxy?.description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Model Selection */}
              <div className="flex items-center space-x-2">
                <CpuChipIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedModel?.id || ''}
                  onChange={(e) => {
                    const model = availableModels.find(m => m.id === e.target.value);
                    setSelectedModel(model || null);
                  }}
                  className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
                >
                  {availableModels.map(model => (
                    <option key={model.id} value={model.id}>
                      {getModelProviderIcon(model.provider)} {model.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={clearConversation}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-900/50 border-b border-red-700 px-6 py-3">
          <div className="max-w-4xl mx-auto flex items-center space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <span className="text-red-300">{error}</span>
            {error.includes('API key') && (
              <button
                onClick={() => navigate('/api-keys')}
                className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
              >
                <KeyIcon className="h-3 w-3" />
                <span>Add API Key</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-4 ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                    : 'bg-gray-700'
                }`}>
                  {message.role === 'user' ? (
                    <UserIcon className="h-4 w-4 text-white" />
                  ) : (
                    <SparklesIcon className="h-4 w-4 text-white" />
                  )}
                </div>

                {/* Message Content */}
                <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block max-w-3xl px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'bg-gray-800 text-gray-100'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  
                  {/* Message Metadata */}
                  <div className={`mt-1 text-xs text-gray-500 ${
                    message.role === 'user' ? 'text-right' : ''
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                    {message.model && ` • ${message.model}`}
                    {message.tokens && ` • ${message.tokens} tokens`}
                    {message.cost && ` • $${message.cost.toFixed(4)}`}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  <SparklesIcon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="inline-block bg-gray-800 px-4 py-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm p-6">
            <form onSubmit={handleSendMessage} className="flex items-end space-x-4">
              <div className="flex-1">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder={selectedModel ? `Message ${selectedModel.name}...` : 'Select a model to start chatting...'}
                  disabled={isLoading || !selectedModel}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none max-h-32"
                  rows={1}
                />
              </div>
              
              <button
                type="submit"
                disabled={!newMessage.trim() || isLoading || !selectedModel}
                className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-2xl transition-all duration-200 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </form>
            
            {selectedModel && (
              <div className="mt-2 text-xs text-gray-500 text-center">
                Using {selectedModel.name} • Input: ${selectedModel.costPer1kTokens.input}/1k tokens • Output: ${selectedModel.costPer1kTokens.output}/1k tokens
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkingChatInterface;