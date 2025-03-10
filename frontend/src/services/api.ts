import { MockApiService } from './mockApi';

const API_BASE_URL = 'http://localhost:8000';
const USE_MOCK_API = true; // Set to false when backend is stable

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (USE_MOCK_API) {
      console.log('🔧 Using mock API for development');
      return this.handleMockRequest(endpoint, options);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed, falling back to mock:', error);
      return this.handleMockRequest(endpoint, options);
    }
  }

  private async handleMockRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const method = options.method || 'GET';
    
    if (endpoint === '/login' && method === 'POST') {
      const body = JSON.parse(options.body as string);
      return MockApiService.login(body.email, body.password);
    }
    
    if (endpoint === '/galaxies' && method === 'GET') {
      return MockApiService.getGalaxies();
    }
    
    if (endpoint.startsWith('/chat') && method === 'GET') {
      return MockApiService.getChatHistory();
    }
    
    if (endpoint.startsWith('/chat') && method === 'POST') {
      const body = JSON.parse(options.body as string);
      return MockApiService.sendMessage(body.message);
    }
    
    throw new Error(`Mock endpoint not implemented: ${method} ${endpoint}`);
  }

  async login(email: string, password: string) {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getGalaxies() {
    return this.request('/galaxies');
  }

  async getChatHistory() {
    return this.request('/chat/history');
  }

  async sendMessage(message: string) {
    return this.request('/chat/send', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async getProfile() {
    return this.request('/profile');
  }

  async updateProfile(data: any) {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export default new ApiService();