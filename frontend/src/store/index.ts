import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Types
interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

interface Galaxy {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  system_prompt: string;
  is_active: boolean;
  created_at: string;
}

interface Conversation {
  id: number;
  title: string;
  galaxy_id: number;
  created_at: string;
  updated_at: string;
}

// Store Interface
interface AppStore {
  // Auth State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;

  // Galaxy State
  galaxies: Galaxy[];
  currentGalaxy: Galaxy | null;
  galaxyLoading: boolean;
  galaxyError: string | null;
  galaxiesLoaded: boolean; // Flag to prevent multiple loads

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loadGalaxies: () => Promise<void>;
  setCurrentGalaxy: (galaxy: Galaxy) => void;
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
      galaxies: [],
      currentGalaxy: null,
      galaxyLoading: false,
      galaxyError: null,
      galaxiesLoaded: false,

      // Actions
      login: async (email: string, password: string) => {
        set({ authLoading: true, authError: null });
        
        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            throw new Error('Invalid credentials');
          }

          const data = await response.json();
          
          set({
            user: data.user,
            token: data.access_token,
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
        });
      },

      loadGalaxies: async () => {
        const state = get();
        
        // Prevent multiple calls and only load if not already loaded
        if (state.galaxyLoading || state.galaxiesLoaded) {
          return;
        }

        set({ galaxyLoading: true, galaxyError: null });

        try {
          const response = await fetch(`${API_BASE_URL}/galaxies`, {
            headers: {
              'Content-Type': 'application/json',
              ...(state.token ? { 'Authorization': `Bearer ${state.token}` } : {}),
            },
          });

          if (!response.ok) {
            throw new Error('Failed to load galaxies');
          }

          const galaxies = await response.json();
          
          set({
            galaxies,
            galaxyLoading: false,
            galaxyError: null,
            galaxiesLoaded: true, // Mark as loaded
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

      clearErrors: () => {
        set({ authError: null, galaxyError: null });
      },
    }),
    {
      name: 'cenai-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);