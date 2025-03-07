import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiService from '../services/api';

// Types
interface User {
  id?: number;
  email: string;
  role: string;
  full_name?: string;
  is_active?: boolean;
  created_at?: string;
}

interface Galaxy {
  id: number;
  name: string;
  description: string;
  status: string;
  aiCount?: number;
  lastActivity?: string;
  icon?: string;
  color?: string;
  category?: string;
}

interface Message {
  id: number;
  message: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

// Store Interface
interface AppStore {
  // Auth State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;
  isLoading: boolean;

  // UI State
  isDarkMode: boolean;
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;

  // Galaxy State
  galaxies: Galaxy[];
  currentGalaxy: Galaxy | null;
  galaxyLoading: boolean;
  galaxyError: string | null;
  galaxiesLoaded: boolean;

  // Chat State
  messages: Message[];
  chatLoading: boolean;
  chatError: string | null;

  // Server State
  serverConnected: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  initializeAuth: () => Promise<void>;
  checkServerConnection: () => Promise<void>;
  
  // Galaxy Actions
  loadGalaxies: () => Promise<void>;
  setCurrentGalaxy: (galaxy: Galaxy) => void;
  createGalaxy: (galaxyData: Partial<Galaxy>) => Promise<Galaxy>;
  
  // Chat Actions
  loadChatHistory: () => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  
  // UI Actions
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  clearErrors: () => void;
}

// Create Store
export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      token: null,
      isAuthenticated: false,
      authLoading: false,
      authError: null,
      isLoading: false,
      
      // UI State
      isDarkMode: true,
      sidebarOpen: true,
      mobileMenuOpen: false,
      
      // Galaxy State
      galaxies: [
        {
          id: 1,
          name: 'General AI Assistant',
          description: 'A versatile AI companion for general tasks and conversations',
          status: 'active',
          aiCount: 3,
          lastActivity: new Date().toISOString(),
          icon: '🤖',
          color: 'blue',
          category: 'General'
        },
        {
          id: 2,
          name: 'Code Helper',
          description: 'Specialized AI for programming and development tasks',
          status: 'active',
          aiCount: 2,
          lastActivity: new Date().toISOString(),
          icon: '💻',
          color: 'green',
          category: 'Development'
        },
        {
          id: 3,
          name: 'Creative Studio',
          description: 'AI assistant for creative writing, art, and design',
          status: 'active',
          aiCount: 4,
          lastActivity: new Date().toISOString(),
          icon: '🎨',
          color: 'purple',
          category: 'Creative'
        }
      ],
      currentGalaxy: null,
      galaxyLoading: false,
      galaxyError: null,
      galaxiesLoaded: false,
      
      // Chat State
      messages: [],
      chatLoading: false,
      chatError: null,
      
      // Server State
      serverConnected: true,

      // Auth Actions
      login: async (email: string, password: string) => {
        set({ authLoading: true, authError: null });
        
        try {
          const data = await apiService.login(email, password);
          
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            authLoading: false,
            authError: null,
          });
        } catch (error) {
          console.error('Login failed:', error);
          set({
            authLoading: false,
            authError: error instanceof Error ? error.message : 'Login failed',
            isAuthenticated: false,
            user: null,
            token: null,
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          galaxies: [],
          currentGalaxy: null,
          galaxiesLoaded: false,
          messages: [],
        });
      },

      initializeAuth: async () => {
        set({ isLoading: true });
        // In a real app, this would check for valid tokens, refresh them, etc.
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
        set({ isLoading: false });
      },

      checkServerConnection: async () => {
        try {
          // In a real app, this would ping the server
          await new Promise(resolve => setTimeout(resolve, 200));
          set({ serverConnected: true });
        } catch {
          set({ serverConnected: false });
        }
      },

      // Galaxy Actions
      loadGalaxies: async () => {
        const state = get();
        
        if (state.galaxyLoading || state.galaxiesLoaded) {
          return;
        }

        set({ galaxyLoading: true, galaxyError: null });

        try {
          const galaxies = await apiService.getGalaxies();
          
          set({
            galaxies,
            galaxyLoading: false,
            galaxyError: null,
            galaxiesLoaded: true,
          });
        } catch (error) {
          console.error('Error loading galaxies:', error);
          set({
            galaxyLoading: false,
            galaxyError: error instanceof Error ? error.message : 'Failed to load galaxies',
          });
        }
      },

      setCurrentGalaxy: (galaxy: Galaxy) => {
        set({ currentGalaxy: galaxy });
      },

      createGalaxy: async (galaxyData: Partial<Galaxy>) => {
        set({ galaxyLoading: true, galaxyError: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const newGalaxy: Galaxy = {
            id: Date.now(),
            name: galaxyData.name || 'New Galaxy',
            description: galaxyData.description || 'A new AI galaxy',
            status: 'connected',
            aiCount: 0,
            lastActivity: new Date().toISOString(),
            icon: galaxyData.icon || '🌌',
            color: galaxyData.color || 'from-blue-500 to-purple-500',
            category: galaxyData.category || 'General',
          };
          
          const state = get();
          set({
            galaxies: [...state.galaxies, newGalaxy],
            galaxyLoading: false,
            galaxyError: null,
          });
          
          return newGalaxy;
        } catch (error) {
          set({
            galaxyLoading: false,
            galaxyError: error instanceof Error ? error.message : 'Failed to create galaxy',
          });
          throw error;
        }
      },

      // Chat Actions
      loadChatHistory: async () => {
        set({ chatLoading: true, chatError: null });
        
        try {
          const messages = await apiService.getChatHistory();
          set({
            messages,
            chatLoading: false,
            chatError: null,
          });
        } catch (error) {
          set({
            chatLoading: false,
            chatError: error instanceof Error ? error.message : 'Failed to load chat history',
          });
        }
      },

      sendMessage: async (message: string) => {
        const state = get();
        
        // Add user message immediately
        const userMessage: Message = {
          id: Date.now(),
          message,
          sender: 'user',
          timestamp: new Date().toISOString(),
        };
        
        set({
          messages: [...state.messages, userMessage],
          chatLoading: true,
        });
        
        try {
          const aiResponse = await apiService.sendMessage(message);
          
          set({
            messages: [...get().messages, aiResponse],
            chatLoading: false,
          });
        } catch (error) {
          set({
            chatLoading: false,
            chatError: error instanceof Error ? error.message : 'Failed to send message',
          });
        }
      },

      // UI Actions
      toggleDarkMode: () => {
        set((state) => ({ isDarkMode: !state.isDarkMode }));
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      toggleMobileMenu: () => {
        set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen }));
      },

      clearErrors: () => {
        set({ authError: null, galaxyError: null, chatError: null });
      },
    }),
    {
      name: 'platform5-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isDarkMode: state.isDarkMode,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);