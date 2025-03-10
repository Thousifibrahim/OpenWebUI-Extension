import { useState, useEffect } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  provider?: string;
  tokens?: number;
  cost?: number;
}

export interface AIProvider {
  id: string;
  name: string;
  baseUrl: string;
  models: AIModel[];
  requiresApiKey: boolean;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  maxTokens: number;
  costPer1kTokens: {
    input: number;
    output: number;
  };
  description: string;
  capabilities: string[];
}

// Hook for managing API keys
export const useAPIKeys = () => {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedKeys = localStorage.getItem('cenai_api_keys');
    if (savedKeys) {
      try {
        const keys = JSON.parse(savedKeys);
        setApiKeys(keys);
      } catch (error) {
        console.error('Error loading API keys:', error);
      }
    }
  }, []);

  const setApiKey = (provider: string, key: string) => {
    const newKeys = { ...apiKeys, [provider]: key };
    setApiKeys(newKeys);
    localStorage.setItem('cenai_api_keys', JSON.stringify(newKeys));
  };

  const getApiKey = (provider: string) => {
    return apiKeys[provider];
  };

  const removeApiKey = (provider: string) => {
    const newKeys = { ...apiKeys };
    delete newKeys[provider];
    setApiKeys(newKeys);
    localStorage.setItem('cenai_api_keys', JSON.stringify(newKeys));
  };

  return { apiKeys, setApiKey, getApiKey, removeApiKey };
};

// AI Service for making actual API calls
export class AIService {
  private static instance: AIService;
  
  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private providers: AIProvider[] = [
    {
      id: 'openai',
      name: 'OpenAI',
      baseUrl: 'https://api.openai.com/v1',
      requiresApiKey: true,
      models: [
        {
          id: 'gpt-4o',
          name: 'GPT-4o',
          provider: 'openai',
          maxTokens: 4096,
          costPer1kTokens: { input: 0.03, output: 0.06 },
          description: 'Most capable GPT-4 model',
          capabilities: ['text', 'code', 'reasoning']
        },
        {
          id: 'gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          provider: 'openai',
          maxTokens: 4096,
          costPer1kTokens: { input: 0.001, output: 0.002 },
          description: 'Fast and cost-effective',
          capabilities: ['text', 'code', 'chat']
        }
      ]
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      baseUrl: 'https://api.anthropic.com/v1',
      requiresApiKey: true,
      models: [
        {
          id: 'claude-3-opus-20240229',
          name: 'Claude 3 Opus',
          provider: 'anthropic',
          maxTokens: 4096,
          costPer1kTokens: { input: 0.015, output: 0.075 },
          description: 'Most capable Claude model',
          capabilities: ['text', 'reasoning', 'analysis']
        },
        {
          id: 'claude-3-sonnet-20240229',
          name: 'Claude 3 Sonnet',
          provider: 'anthropic',
          maxTokens: 4096,
          costPer1kTokens: { input: 0.003, output: 0.015 },
          description: 'Balanced Claude model',
          capabilities: ['text', 'reasoning', 'code']
        }
      ]
    },
    {
      id: 'openrouter',
      name: 'OpenRouter',
      baseUrl: 'https://openrouter.ai/api/v1',
      requiresApiKey: true,
      models: [
        {
          id: 'anthropic/claude-3-opus',
          name: 'Claude 3 Opus (OpenRouter)',
          provider: 'openrouter',
          maxTokens: 4096,
          costPer1kTokens: { input: 0.015, output: 0.075 },
          description: 'Claude 3 Opus via OpenRouter',
          capabilities: ['text', 'reasoning', 'analysis']
        },
        {
          id: 'openai/gpt-4',
          name: 'GPT-4 (OpenRouter)',
          provider: 'openrouter',
          maxTokens: 8192,
          costPer1kTokens: { input: 0.03, output: 0.06 },
          description: 'GPT-4 via OpenRouter',
          capabilities: ['text', 'code', 'reasoning']
        },
        {
          id: 'meta-llama/llama-3.1-70b-instruct',
          name: 'Llama 3.1 70B',
          provider: 'openrouter',
          maxTokens: 4096,
          costPer1kTokens: { input: 0.0009, output: 0.0009 },
          description: 'Meta Llama 3.1 70B model',
          capabilities: ['text', 'code', 'reasoning']
        }
      ]
    }
  ];

  getProviders(): AIProvider[] {
    return this.providers;
  }

  getModels(): AIModel[] {
    return this.providers.flatMap(p => p.models);
  }

  getModelsByProvider(providerId: string): AIModel[] {
    const provider = this.providers.find(p => p.id === providerId);
    return provider?.models || [];
  }

  async sendMessage(
    messages: ChatMessage[],
    model: AIModel,
    apiKey: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
    } = {}
  ): Promise<ChatMessage> {
    const provider = this.providers.find(p => p.id === model.provider);
    if (!provider) {
      throw new Error(`Provider ${model.provider} not found`);
    }

    const { temperature = 0.7, maxTokens = 2048, stream = false } = options;

    try {
      let response: Response;
      
      if (model.provider === 'openai' || model.provider === 'openrouter') {
        response = await fetch(`${provider.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            ...(model.provider === 'openrouter' && {
              'HTTP-Referer': 'https://cenai.app',
              'X-Title': 'CenAI'
            })
          },
          body: JSON.stringify({
            model: model.id,
            messages: messages.map(m => ({
              role: m.role,
              content: m.content
            })),
            temperature,
            max_tokens: maxTokens,
            stream
          })
        });
      } else if (model.provider === 'anthropic') {
        // Format for Anthropic API
        const systemMessage = messages.find(m => m.role === 'system');
        const chatMessages = messages.filter(m => m.role !== 'system');
        
        response = await fetch(`${provider.baseUrl}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: model.id,
            messages: chatMessages.map(m => ({
              role: m.role,
              content: m.content
            })),
            max_tokens: maxTokens,
            temperature,
            ...(systemMessage && { system: systemMessage.content })
          })
        });
      } else {
        throw new Error(`Unsupported provider: ${model.provider}`);
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      let content: string;
      if (model.provider === 'anthropic') {
        content = data.content[0]?.text || '';
      } else {
        content = data.choices[0]?.message?.content || '';
      }

      return {
        id: Date.now().toString(),
        role: 'assistant',
        content,
        timestamp: new Date(),
        model: model.id,
        provider: model.provider,
        tokens: data.usage?.total_tokens,
        cost: this.calculateCost(data.usage?.prompt_tokens || 0, data.usage?.completion_tokens || 0, model)
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  }

  private calculateCost(inputTokens: number, outputTokens: number, model: AIModel): number {
    const inputCost = (inputTokens / 1000) * model.costPer1kTokens.input;
    const outputCost = (outputTokens / 1000) * model.costPer1kTokens.output;
    return inputCost + outputCost;
  }

  async testApiKey(provider: string, apiKey: string): Promise<boolean> {
    const providerConfig = this.providers.find(p => p.id === provider);
    if (!providerConfig) return false;

    try {
      if (provider === 'openai' || provider === 'openrouter') {
        const response = await fetch(`${providerConfig.baseUrl}/models`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            ...(provider === 'openrouter' && {
              'HTTP-Referer': 'https://cenai.app',
              'X-Title': 'CenAI'
            })
          }
        });
        return response.ok;
      } else if (provider === 'anthropic') {
        // For Anthropic, we'll try a minimal message
        const response = await fetch(`${providerConfig.baseUrl}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            messages: [{ role: 'user', content: 'Hi' }],
            max_tokens: 1
          })
        });
        return response.ok || response.status === 400; // 400 might be validation error but key is valid
      }
      
      return false;
    } catch {
      return false;
    }
  }
}

export default AIService;