// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// User Types
export interface User {
  id: number;
  email: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  default_galaxy?: string;
  default_model?: string;
  theme: 'dark' | 'light';
  budget_limit: number;
  notifications: boolean;
  auto_save: boolean;
  preferred_providers?: string[];
  performance_preference?: 'fast' | 'balanced' | 'premium';
}

// Galaxy Types
export interface Galaxy {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  is_default: boolean;
  is_custom: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  settings: GalaxySettings;
}

export interface GalaxySettings {
  preferred_models: string[];
  auto_title: boolean;
  save_history: boolean;
  context_length: number;
}

// Conversation Types
export interface Conversation {
  id: number;
  galaxy_id: number;
  title: string;
  summary?: string;
  is_archived: boolean;
  is_starred: boolean;
  created_at: string;
  updated_at: string;
  total_messages: number;
  total_tokens: number;
  total_cost: number;
  metadata: ConversationMetadata;
}

export interface ConversationMetadata {
  models_used: string[];
  primary_model?: string;
  context_files: string[];
  tags: string[];
}

// Message Types
export interface Message {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  content_type: 'text' | 'code' | 'image' | 'file';
  model_used?: string;
  provider?: string;
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  cost?: number;
  response_time?: number;
  created_at: string;
  message_metadata: MessageMetadata;
}

export interface MessageMetadata {
  edited: boolean;
  regenerated: boolean;
  rating?: number;
  attachments: string[];
  context_used: string[];
}

// Template Types
export interface Template {
  id: number;
  galaxy_id: number;
  name: string;
  description?: string;
  prompt_template: string;
  tags: string[];
  category?: string;
  is_public: boolean;
  is_featured: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
  variables: TemplateVariable[];
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'textarea' | 'select' | 'number';
  label: string;
  required: boolean;
  default?: string;
  options?: string[];
  placeholder?: string;
}

// AI Model Types
export interface AIModel {
  id: string;
  name: string;
  provider: string;
  cost_per_1k_input: number;
  cost_per_1k_output: number;
  max_tokens: number;
  context_window: number;
  capabilities: string[];
  best_for: string[];
  performance_level: 'fast' | 'balanced' | 'premium';
  supports_streaming: boolean;
  supports_functions: boolean;
  description: string;
}

export interface ModelRecommendation {
  model: AIModel;
  score: number;
  reasoning: string;
}

// API Key Types
export interface APIKey {
  id: number;
  provider: string;
  key_name: string;
  masked_key: string;
  created_at: string;
  last_used?: string;
  total_requests: number;
  total_cost: number;
  is_active: boolean;
}

// Usage Analytics Types
export interface UsageStats {
  total_requests: number;
  total_tokens: number;
  total_cost: number;
  provider_breakdown: Record<string, ProviderUsage>;
  model_breakdown: Record<string, ModelUsage>;
  galaxy_breakdown: Record<string, GalaxyUsage>;
  time_period: string;
}

export interface ProviderUsage {
  requests: number;
  tokens: number;
  cost: number;
  percentage: number;
}

export interface ModelUsage {
  requests: number;
  tokens: number;
  cost: number;
  avg_response_time: number;
}

export interface GalaxyUsage {
  requests: number;
  tokens: number;
  cost: number;
  conversations: number;
}

// Chat Types
export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  provider?: string;
  tokens?: number;
  cost?: number;
  streaming?: boolean;
  error?: string;
}

export interface ChatSession {
  id: string;
  galaxy_id: number;
  messages: ChatMessage[];
  title: string;
  model: string;
  provider: string;
  created_at: Date;
  updated_at: Date;
}

// UI State Types
export interface UIState {
  sidebar_collapsed: boolean;
  current_galaxy?: string;
  current_conversation?: string;
  loading: boolean;
  error?: string;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary';
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
}

export interface APIKeyForm {
  provider: string;
  api_key: string;
  key_name?: string;
}

export interface ConversationForm {
  title: string;
  galaxy_id: number;
  initial_message?: string;
}

// Theme Types
export interface ThemeConfig {
  name: string;
  primary: string;
  background: string;
  surface: string;
  text: string;
  accent: string;
}

// Navigation Types
export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  badge?: string | number;
  external?: boolean;
}

export interface GalaxyNavItem extends NavItem {
  galaxy: Galaxy;
  color: string;
}

// Search Types
export interface SearchResult {
  type: 'conversation' | 'message' | 'template';
  id: string;
  title: string;
  content: string;
  galaxy?: string;
  created_at: string;
  relevance: number;
}

export interface SearchFilters {
  galaxy?: string;
  date_range?: {
    start: Date;
    end: Date;
  };
  content_type?: string[];
  min_relevance?: number;
}

// Export/Import Types
export interface ExportOptions {
  format: 'json' | 'markdown' | 'pdf' | 'csv';
  include_metadata: boolean;
  date_range?: {
    start: Date;
    end: Date;
  };
  galaxies?: string[];
}

export interface ImportData {
  conversations: Conversation[];
  messages: Message[];
  templates: Template[];
  metadata: {
    version: string;
    exported_at: string;
    total_items: number;
  };
}