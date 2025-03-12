import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavigation from '../components/Navigation/TopNavigation';
import {
  KeyIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface APIKey {
  id: string;
  provider: string;
  name: string;
  key: string;
  masked: string;
  isValid: boolean;
  lastUsed?: string;
  createdAt: string;
}

const APIKeyManagement: React.FC = () => {
  const navigate = useNavigate();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKey, setNewKey] = useState({
    provider: 'openai',
    name: '',
    key: ''
  });
  const [showKey, setShowKey] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);

  const providers = [
    { id: 'openai', name: 'OpenAI', description: 'GPT-3.5, GPT-4, DALL-E' },
    { id: 'anthropic', name: 'Anthropic', description: 'Claude models' },
    { id: 'openrouter', name: 'OpenRouter', description: 'Access to multiple AI models' },
    { id: 'google', name: 'Google AI', description: 'Gemini models' },
    { id: 'cohere', name: 'Cohere', description: 'Command models' },
    { id: 'ollama', name: 'Ollama', description: 'Local AI models' }
  ];

  // Load API keys from localStorage
  useEffect(() => {
    const savedKeys = localStorage.getItem('cenai_api_keys');
    if (savedKeys) {
      setApiKeys(JSON.parse(savedKeys));
    }
  }, []);

  // Save API keys to localStorage
  const saveKeys = (keys: APIKey[]) => {
    setApiKeys(keys);
    localStorage.setItem('cenai_api_keys', JSON.stringify(keys));
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.substring(0, 4) + '•'.repeat(20) + key.substring(key.length - 4);
  };

  const validateKey = async (provider: string, key: string): Promise<boolean> => {
    // Mock validation - in real app this would test the API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple validation rules
    if (provider === 'openai' && !key.startsWith('sk-')) return false;
    if (provider === 'anthropic' && !key.startsWith('sk-ant-')) return false;
    if (key.length < 10) return false;
    
    return true;
  };

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newKey.name.trim() || !newKey.key.trim()) return;

    setTesting('new');
    
    try {
      const isValid = await validateKey(newKey.provider, newKey.key);
      
      const apiKey: APIKey = {
        id: Date.now().toString(),
        provider: newKey.provider,
        name: newKey.name.trim(),
        key: newKey.key.trim(),
        masked: maskKey(newKey.key.trim()),
        isValid,
        createdAt: new Date().toISOString()
      };

      saveKeys([...apiKeys, apiKey]);
      setNewKey({ provider: 'openai', name: '', key: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error validating API key:', error);
    } finally {
      setTesting(null);
    }
  };

  const handleDeleteKey = (id: string) => {
    if (window.confirm('Are you sure you want to delete this API key?')) {
      saveKeys(apiKeys.filter(key => key.id !== id));
    }
  };

  const handleTestKey = async (id: string) => {
    setTesting(id);
    
    const key = apiKeys.find(k => k.id === id);
    if (!key) return;

    try {
      const isValid = await validateKey(key.provider, key.key);
      
      const updatedKeys = apiKeys.map(k => 
        k.id === id 
          ? { ...k, isValid, lastUsed: new Date().toISOString() }
          : k
      );
      
      saveKeys(updatedKeys);
    } catch (error) {
      console.error('Error testing API key:', error);
    } finally {
      setTesting(null);
    }
  };

  const getProviderInfo = (providerId: string) => {
    return providers.find(p => p.id === providerId) || { name: providerId, description: '' };
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <TopNavigation currentPage="settings" />
      
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light mb-2">API Key Management</h1>
            <p className="text-gray-400">
              Configure your AI provider API keys to enable full functionality
            </p>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add API Key</span>
          </button>
        </div>

        {/* Add Key Form */}
        {showAddForm && (
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-medium mb-4">Add New API Key</h2>
            
            <form onSubmit={handleAddKey} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Provider
                  </label>
                  <select
                    value={newKey.provider}
                    onChange={(e) => setNewKey({ ...newKey, provider: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    {providers.map(provider => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name} - {provider.description}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name/Label
                  </label>
                  <input
                    type="text"
                    value={newKey.name}
                    onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                    placeholder="e.g., Main OpenAI Key"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={newKey.key}
                  onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
                  placeholder="Enter your API key"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={testing === 'new'}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {testing === 'new' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      <span>Validating...</span>
                    </>
                  ) : (
                    <>
                      <KeyIcon className="h-4 w-4" />
                      <span>Add Key</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* API Keys List */}
        <div className="space-y-4">
          {apiKeys.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <KeyIcon className="h-12 w-12 text-gray-600" />
              </div>
              <h3 className="text-2xl font-light mb-4">No API Keys Yet</h3>
              <p className="text-gray-400 mb-8">
                Add your first API key to start using AI providers
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-6 py-3 rounded-full font-medium transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add Your First API Key</span>
              </button>
            </div>
          ) : (
            apiKeys.map(apiKey => {
              const provider = getProviderInfo(apiKey.provider);
              
              return (
                <div
                  key={apiKey.id}
                  className="bg-gray-900 border border-gray-700 rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium">{apiKey.name}</h3>
                        <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-lg">
                          {provider.name}
                        </span>
                        {apiKey.isValid ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-2">
                          <span>Key:</span>
                          <code className="bg-gray-800 px-2 py-1 rounded">
                            {showKey === apiKey.id ? apiKey.key : apiKey.masked}
                          </code>
                          <button
                            onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)}
                            className="p-1 hover:text-white transition-colors"
                          >
                            {showKey === apiKey.id ? (
                              <EyeSlashIcon className="h-4 w-4" />
                            ) : (
                              <EyeIcon className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        
                        {apiKey.lastUsed && (
                          <span>
                            Last used: {new Date(apiKey.lastUsed).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleTestKey(apiKey.id)}
                        disabled={testing === apiKey.id}
                        className="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 rounded-lg text-sm transition-colors"
                      >
                        {testing === apiKey.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                        ) : (
                          <>
                            <CheckCircleIcon className="h-3 w-3" />
                            <span>Test</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleDeleteKey(apiKey.id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
                      >
                        <TrashIcon className="h-3 w-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-800 rounded-2xl p-8">
          <h2 className="text-2xl font-light mb-6">Getting API Keys</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {providers.slice(0, 4).map(provider => (
              <div key={provider.id} className="space-y-2">
                <h3 className="font-medium">{provider.name}</h3>
                <p className="text-sm text-gray-400">{provider.description}</p>
                <div className="text-xs text-gray-500">
                  {provider.id === 'openai' && 'Get your key at platform.openai.com'}
                  {provider.id === 'anthropic' && 'Get your key at console.anthropic.com'}
                  {provider.id === 'openrouter' && 'Get your key at openrouter.ai'}
                  {provider.id === 'google' && 'Get your key at ai.google.dev'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mt-12">
          <button
            onClick={() => navigate('/settings')}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            Back to Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default APIKeyManagement;