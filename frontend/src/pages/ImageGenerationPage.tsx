import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavigation from '../components/Navigation/TopNavigation';
import { useAPIKeys } from '../services/aiService';
import {
  PhotoIcon,
  SparklesIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface ImageRequest {
  id: string;
  prompt: string;
  model: string;
  size: string;
  quality: string;
  status: 'generating' | 'completed' | 'failed';
  imageUrl?: string;
  timestamp: Date;
  cost?: number;
}

const ImageGenerationPage: React.FC = () => {
  const navigate = useNavigate();
  const { getApiKey } = useAPIKeys();
  
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('dall-e-3');
  const [selectedSize, setSelectedSize] = useState('1024x1024');
  const [selectedQuality, setSelectedQuality] = useState('standard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<ImageRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Available models and their configurations
  const imageModels = [
    {
      id: 'dall-e-3',
      name: 'DALL·E 3',
      provider: 'openai',
      sizes: ['1024x1024', '1024x1792', '1792x1024'],
      qualities: ['standard', 'hd'],
      costs: {
        'standard': { '1024x1024': 0.040, '1024x1792': 0.080, '1792x1024': 0.080 },
        'hd': { '1024x1024': 0.080, '1024x1792': 0.120, '1792x1024': 0.120 }
      }
    },
    {
      id: 'dall-e-2',
      name: 'DALL·E 2',
      provider: 'openai',
      sizes: ['256x256', '512x512', '1024x1024'],
      qualities: ['standard'],
      costs: {
        'standard': { '256x256': 0.016, '512x512': 0.018, '1024x1024': 0.020 }
      }
    }
  ];

  const getCurrentModel = () => imageModels.find(m => m.id === selectedModel);
  const currentModel = getCurrentModel();
  
  const getCurrentCost = () => {
    if (!currentModel) return 0;
    const qualityCosts = currentModel.costs[selectedQuality as keyof typeof currentModel.costs];
    if (!qualityCosts) return 0;
    return (qualityCosts as any)[selectedSize] || 0;
  };

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt for the image');
      return;
    }

    if (!currentModel) {
      setError('Please select a valid model');
      return;
    }

    const apiKey = getApiKey(currentModel.provider);
    if (!apiKey) {
      setError(`No API key found for ${currentModel.provider}. Please add your API key in settings.`);
      return;
    }

    setError(null);
    setIsGenerating(true);

    const imageRequest: ImageRequest = {
      id: Date.now().toString(),
      prompt: prompt.trim(),
      model: selectedModel,
      size: selectedSize,
      quality: selectedQuality,
      status: 'generating',
      timestamp: new Date(),
      cost: getCurrentCost()
    };

    // Add to images list
    setImages(prev => [imageRequest, ...prev]);

    try {
      // Call OpenAI DALL-E API
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt: prompt.trim(),
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
        // Update the image request with the result
        setImages(prev => prev.map(img => 
          img.id === imageRequest.id 
            ? { ...img, status: 'completed', imageUrl: data.data[0].url }
            : img
        ));
        
        // Clear the prompt
        setPrompt('');
      } else {
        throw new Error('No image URL received from API');
      }

    } catch (error: any) {
      console.error('Image generation error:', error);
      setError(`Failed to generate image: ${error.message}`);
      
      // Update status to failed
      setImages(prev => prev.map(img => 
        img.id === imageRequest.id 
          ? { ...img, status: 'failed' }
          : img
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `cenai-${prompt.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <TopNavigation currentPage="image-generation" />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light mb-2">AI Image Generation</h1>
          <p className="text-gray-400">Create stunning images with AI-powered models</p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6 flex items-center space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 flex-shrink-0" />
            <span className="text-red-300">{error}</span>
            {error.includes('API key') && (
              <button
                onClick={() => navigate('/api-keys')}
                className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors ml-auto"
              >
                <KeyIcon className="h-3 w-3" />
                <span>Add API Key</span>
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Generation Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 sticky top-8">
              <h2 className="text-xl font-medium mb-6 flex items-center space-x-2">
                <SparklesIcon className="h-5 w-5" />
                <span>Generate Image</span>
              </h2>

              {/* Prompt Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to create..."
                  className="w-full px-3 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                  rows={4}
                  disabled={isGenerating}
                />
              </div>

              {/* Model Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  disabled={isGenerating}
                >
                  {imageModels.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Size Selection */}
              {currentModel && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Size
                  </label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    disabled={isGenerating}
                  >
                    {currentModel.sizes.map(size => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quality Selection */}
              {currentModel && currentModel.qualities.length > 1 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Quality
                  </label>
                  <select
                    value={selectedQuality}
                    onChange={(e) => setSelectedQuality(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    disabled={isGenerating}
                  >
                    {currentModel.qualities.map(quality => (
                      <option key={quality} value={quality}>
                        {quality.charAt(0).toUpperCase() + quality.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Cost Display */}
              {currentModel && (
                <div className="mb-6 p-3 bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-300">
                    <div className="flex justify-between">
                      <span>Cost per image:</span>
                      <span className="font-medium">
                        ${getCurrentCost() || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={generateImage}
                disabled={!prompt.trim() || isGenerating}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
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

          {/* Generated Images */}
          <div className="lg:col-span-2">
            {images.length === 0 ? (
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-12 text-center">
                <PhotoIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-400 mb-2">No images generated yet</h3>
                <p className="text-gray-500">Enter a prompt and click generate to create your first AI image</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {images.map((image) => (
                  <div key={image.id} className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
                    {/* Image Display */}
                    <div className="aspect-square bg-gray-800 flex items-center justify-center">
                      {image.status === 'generating' && (
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto mb-3"></div>
                          <p className="text-gray-400">Generating...</p>
                        </div>
                      )}
                      
                      {image.status === 'completed' && image.imageUrl && (
                        <img
                          src={image.imageUrl}
                          alt={image.prompt}
                          className="w-full h-full object-cover"
                        />
                      )}
                      
                      {image.status === 'failed' && (
                        <div className="text-center text-red-400">
                          <ExclamationTriangleIcon className="h-8 w-8 mx-auto mb-2" />
                          <p>Generation failed</p>
                        </div>
                      )}
                    </div>

                    {/* Image Info */}
                    <div className="p-4">
                      <p className="text-sm text-gray-300 mb-2 line-clamp-2">{image.prompt}</p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <div className="flex items-center space-x-3">
                          <span>{image.model}</span>
                          <span>{image.size}</span>
                          <span>{image.quality}</span>
                        </div>
                        {image.cost && (
                          <span>${image.cost.toFixed(3)}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <ClockIcon className="h-3 w-3" />
                          <span>{image.timestamp.toLocaleTimeString()}</span>
                        </div>
                        
                        {image.status === 'completed' && image.imageUrl && (
                          <button
                            onClick={() => downloadImage(image.imageUrl!, image.prompt)}
                            className="flex items-center space-x-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
                          >
                            <ArrowDownTrayIcon className="h-3 w-3" />
                            <span>Download</span>
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
    </div>
  );
};

export default ImageGenerationPage;