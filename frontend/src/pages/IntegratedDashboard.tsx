import React, { useState, useEffect } from 'react';
import { useStore } from '../store/store';
import { useAPIKeys, ChatMessage } from '../services/aiService';
import AIService from '../services/aiService';
import TopNavigation from '../components/Navigation/TopNavigation';
import {
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  PhotoIcon,
  KeyIcon,
  PlusIcon,
  CogIcon,
  RocketLaunchIcon,
  BeakerIcon,
  CodeBracketIcon,
  LightBulbIcon,
  PaperAirplaneIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ClockIcon,
  UserIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

// Types for different sections
type ActiveSection = 'galaxies' | 'chat' | 'image-generation' | 'api-keys' | 'history';

interface ImageRequest {
  id: string;
  prompt: string;
  model: string;
  size: string;
  status: 'generating' | 'completed' | 'failed';
  imageUrl?: string;
  timestamp: Date;
  cost?: number;
}

const IntegratedDashboard: React.FC = () => {
  const { galaxies, currentGalaxy, setCurrentGalaxy, user } = useStore();
  const { apiKeys, setApiKey, getApiKey, removeApiKey } = useAPIKeys();
  const aiService = AIService.getInstance();
  
  // State management
  const [activeSection, setActiveSection] = useState<ActiveSection>('galaxies');
  const [selectedGalaxy, setSelectedGalaxy] = useState(galaxies[0] || null);
  
  // Chat states
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState(aiService.getModels()[0]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  // Image generation states
  const [imagePrompt, setImagePrompt] = useState('');
  const [selectedImageModel, setSelectedImageModel] = useState('dall-e-3');
  const [selectedSize, setSelectedSize] = useState('1024x1024');
  const [selectedQuality, setSelectedQuality] = useState('standard');
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<ImageRequest[]>([]);
  
  // API Key states
  const [newApiKey, setNewApiKey] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('openai');
  
  // Error states
  const [error, setError] = useState<string | null>(null);

  // Available models
  const availableModels = aiService.getModels();
  
  // Image models configuration
  const imageModels = [
    {
      id: 'dall-e-3',
      name: 'DALL·E 3',
      provider: 'openai',
      sizes: ['1024x1024', '1024x1792', '1792x1024'],
      qualities: ['standard', 'hd']
    },
    {
      id: 'dall-e-2',
      name: 'DALL·E 2',
      provider: 'openai',
      sizes: ['256x256', '512x512', '1024x1024'],
      qualities: ['standard']
    }
  ];

  // Load chat history when galaxy changes
  useEffect(() => {
    if (selectedGalaxy && activeSection === 'chat') {
      const savedMessages = localStorage.getItem(`chat_${selectedGalaxy.id}`);
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages);
          setMessages(parsed.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          })));
        } catch (error) {
          console.error('Error loading messages:', error);
          setMessages([]);
        }
      } else {
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: `Welcome to ${selectedGalaxy.name}! I'm ready to help you. What would you like to talk about?`,
          timestamp: new Date()
        }]);
      }
    }
  }, [selectedGalaxy, activeSection]);

  // Handle galaxy selection
  const handleGalaxySelect = (galaxy: any, section: ActiveSection = 'chat') => {
    setSelectedGalaxy(galaxy);
    setCurrentGalaxy(galaxy);
    setActiveSection(section);
    setError(null);
  };

  // Handle chat message send
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isChatLoading || !selectedModel) return;
    
    const apiKey = getApiKey(selectedModel.provider);
    if (!apiKey) {
      setError(`No API key found for ${selectedModel.provider}. Please add your API key first.`);
      setActiveSection('api-keys');
      return;
    }

    setError(null);
    setIsChatLoading(true);

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
      const assistantMessage = await aiService.sendMessage(
        newMessages,
        selectedModel,
        apiKey,
        { temperature: 0.7, maxTokens: 2048 }
      );

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      
      // Save to localStorage
      if (selectedGalaxy) {
        localStorage.setItem(`chat_${selectedGalaxy.id}`, JSON.stringify(finalMessages));
      }
      
    } catch (error: any) {
      console.error('Chat error:', error);
      setError(`Failed to send message: ${error.message}`);
      setMessages(newMessages);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Handle image generation
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      setError('Please enter a prompt for the image');
      return;
    }

    const apiKey = getApiKey('openai');
    if (!apiKey) {
      setError('No OpenAI API key found. Please add your API key first.');
      setActiveSection('api-keys');
      return;
    }

    setError(null);
    setIsImageGenerating(true);

    const imageRequest: ImageRequest = {
      id: Date.now().toString(),
      prompt: imagePrompt.trim(),
      model: selectedImageModel,
      size: selectedSize,
      status: 'generating',
      timestamp: new Date(),
      cost: selectedImageModel === 'dall-e-3' ? 0.040 : 0.020
    };

    setGeneratedImages(prev => [imageRequest, ...prev]);

    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: selectedImageModel,
          prompt: imagePrompt.trim(),
          n: 1,
          size: selectedSize,
          quality: selectedQuality,
          response_format: 'url'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.data && data.data[0] && data.data[0].url) {
        setGeneratedImages(prev => prev.map(img => 
          img.id === imageRequest.id 
            ? { ...img, status: 'completed', imageUrl: data.data[0].url }
            : img
        ));
        setImagePrompt('');
      } else {
        throw new Error('No image URL received from API');
      }

    } catch (error: any) {
      console.error('Image generation error:', error);
      setError(`Failed to generate image: ${error.message}`);
      
      setGeneratedImages(prev => prev.map(img => 
        img.id === imageRequest.id 
          ? { ...img, status: 'failed' }
          : img
      ));
    } finally {
      setIsImageGenerating(false);
    }
  };

  // Handle API key management
  const handleAddApiKey = () => {
    if (!newApiKey.trim()) {
      setError('Please enter an API key');
      return;
    }
    
    setApiKey(selectedProvider, newApiKey.trim());
    setNewApiKey('');
    setError(null);
  };

  // Render galaxy cards
  const renderGalaxies = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-light mb-4">AI Galaxies</h2>
        <p className="text-gray-400">Choose your AI workspace</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galaxies.map((galaxy) => (
          <div
            key={galaxy.id}
            className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all duration-200 cursor-pointer group"
          >
            <div className="text-center mb-4">
              <div className="text-4xl mb-3">{galaxy.icon}</div>
              <h3 className="text-xl font-medium text-white mb-2">{galaxy.name}</h3>
              <p className="text-gray-400 text-sm">{galaxy.description}</p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => handleGalaxySelect(galaxy, 'chat')}
                className="w-full flex items-center justify-center space-x-2 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
                <span>Start Chat</span>
              </button>
              
              <button
                onClick={() => handleGalaxySelect(galaxy, 'image-generation')}
                className="w-full flex items-center justify-center space-x-2 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                <PhotoIcon className="h-4 w-4" />
                <span>Generate Images</span>
              </button>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between text-xs text-gray-500">
              <span>{galaxy.category}</span>
              <span>{galaxy.aiCount} AI models</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render chat interface
  const renderChat = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light">{selectedGalaxy?.name} Chat</h2>
          <p className="text-gray-400">{selectedGalaxy?.description}</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedModel?.id || ''}
            onChange={(e) => {
              const model = availableModels.find(m => m.id === e.target.value);
              setSelectedModel(model || availableModels[0]);
            }}
            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm"
          >
            {availableModels.map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setActiveSection('galaxies')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
          >
            Back to Galaxies
          </button>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 h-96 overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id} className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-100'
            }`}>
              <p className="whitespace-pre-wrap">{message.content}</p>
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isChatLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-700 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="flex space-x-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={`Message ${selectedModel?.name}...`}
          className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          disabled={isChatLoading}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || isChatLoading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </form>
    </div>
  );

  // Render image generation
  const renderImageGeneration = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light">AI Image Generation</h2>
          <p className="text-gray-400">Create stunning images with DALL-E</p>
        </div>
        <button
          onClick={() => setActiveSection('galaxies')}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
        >
          Back to Galaxies
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4">Generate Image</h3>
          
          <div className="space-y-4">
            <textarea
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              placeholder="Describe the image you want to create..."
              className="w-full px-3 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
              rows={3}
            />
            
            <select
              value={selectedImageModel}
              onChange={(e) => setSelectedImageModel(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
            >
              {imageModels.map(model => (
                <option key={model.id} value={model.id}>{model.name}</option>
              ))}
            </select>
            
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
            >
              {imageModels.find(m => m.id === selectedImageModel)?.sizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            
            <button
              onClick={handleGenerateImage}
              disabled={!imagePrompt.trim() || isImageGenerating}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isImageGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <PhotoIcon className="h-5 w-5" />
                  <span>Generate Image</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          {generatedImages.length === 0 ? (
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-12 text-center">
              <PhotoIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-400 mb-2">No images generated yet</h3>
              <p className="text-gray-500">Enter a prompt and click generate to create your first image</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedImages.map((image) => (
                <div key={image.id} className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
                  <div className="aspect-square bg-gray-800 flex items-center justify-center">
                    {image.status === 'generating' && (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto mb-3"></div>
                        <p className="text-gray-400">Generating...</p>
                      </div>
                    )}
                    
                    {image.status === 'completed' && image.imageUrl && (
                      <img src={image.imageUrl} alt={image.prompt} className="w-full h-full object-cover" />
                    )}
                    
                    {image.status === 'failed' && (
                      <div className="text-center text-red-400">
                        <span className="text-2xl mb-2 block">❌</span>
                        <p>Generation failed</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <p className="text-sm text-gray-300 mb-2 line-clamp-2">{image.prompt}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{image.timestamp.toLocaleTimeString()}</span>
                      {image.status === 'completed' && image.imageUrl && (
                        <button
                          onClick={async () => {
                            const response = await fetch(image.imageUrl!);
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `cenai-${image.prompt.substring(0, 20)}.png`;
                            a.click();
                            window.URL.revokeObjectURL(url);
                          }}
                          className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                        >
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render API key management
  const renderApiKeys = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light">API Key Management</h2>
          <p className="text-gray-400">Manage your AI provider API keys</p>
        </div>
        <button
          onClick={() => setActiveSection('galaxies')}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
        >
          Back to Galaxies
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4">Add API Key</h3>
          <div className="space-y-4">
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="openrouter">OpenRouter</option>
            </select>
            
            <input
              type="password"
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              placeholder="Enter API key..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400"
            />
            
            <button
              onClick={handleAddApiKey}
              className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              Add API Key
            </button>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4">Current API Keys</h3>
          <div className="space-y-3">
            {Object.entries(apiKeys).map(([provider, key]) => (
              <div key={provider} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div>
                  <div className="font-medium capitalize">{provider}</div>
                  <div className="text-sm text-gray-400">
                    {key ? `${key.substring(0, 8)}...${key.substring(key.length - 4)}` : 'No key set'}
                  </div>
                </div>
                <button
                  onClick={() => removeApiKey(provider)}
                  className="p-1 text-red-400 hover:text-red-300"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <TopNavigation currentPage="dashboard" />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Main Content */}
        {activeSection === 'galaxies' && renderGalaxies()}
        {activeSection === 'chat' && renderChat()}
        {activeSection === 'image-generation' && renderImageGeneration()}
        {activeSection === 'api-keys' && renderApiKeys()}

        {/* Quick Access Toolbar */}
        {activeSection !== 'galaxies' && (
          <div className="fixed bottom-6 right-6 flex items-center space-x-2 bg-gray-900 border border-gray-700 rounded-full p-2">
            <button
              onClick={() => setActiveSection('galaxies')}
              className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
              title="Galaxies"
            >
              <SparklesIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setActiveSection('api-keys')}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
              title="API Keys"
            >
              <KeyIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegratedDashboard;