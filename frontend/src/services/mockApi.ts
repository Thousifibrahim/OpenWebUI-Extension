// Mock API service for development when backend is unavailable
export class MockApiService {
  private static delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async login(email: string, password: string) {
    await this.delay(500); // Simulate network delay
    
    console.log('🔐 Mock login attempt:', { email, password });
    
    const validCredentials = {
      'admin@platform5.com': 'admin123',
      'user@platform5.com': 'user123'
    };

    console.log('✅ Valid credentials:', validCredentials);
    
    if (validCredentials[email as keyof typeof validCredentials] === password) {
      const response = {
        token: `mock-jwt-token-${Date.now()}`,
        user: {
          email,
          role: email.includes('admin') ? 'admin' : 'user'
        }
      };
      console.log('✅ Login successful:', response);
      return response;
    } else {
      console.error('❌ Invalid credentials provided');
      throw new Error('Invalid credentials');
    }
  }

  static async getGalaxies() {
    await this.delay(300);
    
    return [
      {
        id: 1,
        name: "Personal Galaxy",
        status: "connected",
        description: "Your personal AI workspace for individual tasks and creativity",
        aiCount: 5,
        lastActivity: new Date().toISOString(),
        icon: "🌟",
        color: "from-purple-500 to-pink-500",
        category: "Personal"
      },
      {
        id: 2,
        name: "Team Galaxy",
        status: "connected", 
        description: "Collaborative AI environment for team projects and brainstorming",
        aiCount: 12,
        lastActivity: new Date(Date.now() - 3600000).toISOString(),
        icon: "👥",
        color: "from-blue-500 to-cyan-500",
        category: "Collaboration"
      },
      {
        id: 3,
        name: "Research Galaxy",
        status: "connecting",
        description: "Advanced research and development with specialized AI models",
        aiCount: 8,
        lastActivity: new Date(Date.now() - 7200000).toISOString(),
        icon: "🔬",
        color: "from-green-500 to-emerald-500",
        category: "Research"
      },
      {
        id: 4,
        name: "Creative Galaxy",
        status: "connected",
        description: "Unleash your creativity with AI-powered writing, art, and design",
        aiCount: 15,
        lastActivity: new Date(Date.now() - 900000).toISOString(),
        icon: "🎨",
        color: "from-orange-500 to-red-500",
        category: "Creativity"
      },
      {
        id: 5,
        name: "Code Galaxy",
        status: "connected",
        description: "Development and programming assistance with multiple languages",
        aiCount: 7,
        lastActivity: new Date(Date.now() - 1800000).toISOString(),
        icon: "💻",
        color: "from-slate-500 to-gray-600",
        category: "Development"
      }
    ];
  }

  static async getChatHistory() {
    await this.delay(200);
    
    return [
      {
        id: 1,
        message: "Welcome to Platform 5! How can I assist you today?",
        sender: "ai",
        timestamp: new Date(Date.now() - 1000).toISOString()
      },
      {
        id: 2,
        message: "Hello! I'd like to explore the galaxy features.",
        sender: "user",
        timestamp: new Date(Date.now() - 500).toISOString()
      }
    ];
  }

  static async sendMessage(message: string) {
    await this.delay(800);
    
    const responses = [
      "That's an interesting question! Let me help you with that.",
      "I understand what you're looking for. Here's what I can tell you...",
      "Great question! Based on your galaxy data, I recommend...",
      "Let me analyze that for you and provide the best solution.",
      "I can definitely help you with that. Here's my analysis..."
    ];

    return {
      id: Date.now(),
      message: responses[Math.floor(Math.random() * responses.length)],
      sender: "ai",
      timestamp: new Date().toISOString()
    };
  }
}