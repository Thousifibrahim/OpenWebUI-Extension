import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TopNavigation from '../components/Navigation/TopNavigation';
import { useStore } from '../store/store';
import {
  ChatBubbleLeftRightIcon,
  TrashIcon,
  ArrowRightIcon,
  ClockIcon,
  UserIcon,
  SparklesIcon,
  ArchiveBoxIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface ConversationSummary {
  id: string;
  galaxyId: string;
  galaxyName: string;
  title: string;
  lastMessage: string;
  lastUpdated: Date;
  messageCount: number;
  totalTokens?: number;
  totalCost?: number;
  preview: string;
}

const ConversationHistoryPage: React.FC = () => {
  const { galaxies, user } = useStore();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGalaxy, setSelectedGalaxy] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'messages' | 'cost'>('date');

  useEffect(() => {
    loadConversationHistory();
  }, []);

  const loadConversationHistory = () => {
    const conversationSummaries: ConversationSummary[] = [];
    
    // Load all conversation histories from localStorage
    galaxies.forEach(galaxy => {
      const chatKey = `chat_${galaxy.id}`;
      const savedMessages = localStorage.getItem(chatKey);
      
      if (savedMessages) {
        try {
          const messages = JSON.parse(savedMessages);
          if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            const firstUserMessage = messages.find((m: any) => m.role === 'user');
            
            // Calculate totals
            const totalTokens = messages.reduce((sum: number, msg: any) => sum + (msg.tokens || 0), 0);
            const totalCost = messages.reduce((sum: number, msg: any) => sum + (msg.cost || 0), 0);
            
            // Create title from first user message
            const title = firstUserMessage ? 
              firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '') :
              'Conversation';
            
            conversationSummaries.push({
              id: chatKey,
              galaxyId: galaxy.id.toString(),
              galaxyName: galaxy.name,
              title,
              lastMessage: lastMessage.content.substring(0, 100) + (lastMessage.content.length > 100 ? '...' : ''),
              lastUpdated: new Date(lastMessage.timestamp),
              messageCount: messages.length,
              totalTokens,
              totalCost,
              preview: firstUserMessage ? firstUserMessage.content.substring(0, 200) : ''
            });
          }
        } catch (error) {
          console.error(`Error loading conversation for galaxy ${galaxy.id}:`, error);
        }
      }
    });

    setConversations(conversationSummaries);
  };

  const deleteConversation = (conversationId: string) => {
    if (window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      localStorage.removeItem(conversationId);
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    }
  };

  const exportConversation = (conversationId: string) => {
    const savedMessages = localStorage.getItem(conversationId);
    if (savedMessages) {
      const messages = JSON.parse(savedMessages);
      const conversation = conversations.find(c => c.id === conversationId);
      
      const exportData = {
        title: conversation?.title || 'Conversation',
        galaxy: conversation?.galaxyName || 'Unknown',
        exportDate: new Date().toISOString(),
        messages: messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          model: msg.model,
          tokens: msg.tokens,
          cost: msg.cost
        }))
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cenai-conversation-${conversation?.title.replace(/[^a-zA-Z0-9]/g, '_') || 'export'}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Filter and sort conversations
  const filteredConversations = conversations
    .filter(conv => {
      const matchesSearch = conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          conv.galaxyName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGalaxy = selectedGalaxy === 'all' || conv.galaxyId === selectedGalaxy;
      return matchesSearch && matchesGalaxy;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.lastUpdated.getTime() - a.lastUpdated.getTime();
        case 'messages':
          return b.messageCount - a.messageCount;
        case 'cost':
          return (b.totalCost || 0) - (a.totalCost || 0);
        default:
          return 0;
      }
    });

  const totalCost = conversations.reduce((sum, conv) => sum + (conv.totalCost || 0), 0);
  const totalMessages = conversations.reduce((sum, conv) => sum + conv.messageCount, 0);
  const totalTokens = conversations.reduce((sum, conv) => sum + (conv.totalTokens || 0), 0);

  return (
    <div className="min-h-screen bg-black text-white">
      <TopNavigation currentPage="history" />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light mb-2">Conversation History</h1>
          <p className="text-gray-400">Review and manage your AI conversations</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold">{conversations.length}</p>
                <p className="text-sm text-gray-400">Conversations</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <SparklesIcon className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold">{totalMessages.toLocaleString()}</p>
                <p className="text-sm text-gray-400">Total Messages</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <ArchiveBoxIcon className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold">{totalTokens.toLocaleString()}</p>
                <p className="text-sm text-gray-400">Total Tokens</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">💰</span>
              <div>
                <p className="text-2xl font-bold">${totalCost.toFixed(3)}</p>
                <p className="text-sm text-gray-400">Total Cost</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Galaxy Filter */}
            <select
              value={selectedGalaxy}
              onChange={(e) => setSelectedGalaxy(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Galaxies</option>
              {galaxies.map(galaxy => (
                <option key={galaxy.id} value={galaxy.id.toString()}>
                  {galaxy.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'messages' | 'cost')}
              className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="date">Sort by Date</option>
              <option value="messages">Sort by Messages</option>
              <option value="cost">Sort by Cost</option>
            </select>
          </div>
        </div>

        {/* Conversations List */}
        {filteredConversations.length === 0 ? (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-12 text-center">
            <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">
              {conversations.length === 0 ? 'No conversations yet' : 'No conversations match your search'}
            </h3>
            <p className="text-gray-500 mb-6">
              {conversations.length === 0 
                ? 'Start chatting with AI to see your conversation history here'
                : 'Try adjusting your search terms or filters'
              }
            </p>
            {conversations.length === 0 && (
              <Link
                to="/chat/1"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg transition-colors"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                <span>Start Your First Chat</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredConversations.map((conversation) => (
              <div key={conversation.id} className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium">{conversation.title}</h3>
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                        {conversation.galaxyName}
                      </span>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {conversation.preview}
                    </p>
                    
                    <div className="flex items-center space-x-6 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-3 w-3" />
                        <span>{conversation.lastUpdated.toLocaleDateString()} {conversation.lastUpdated.toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ChatBubbleLeftRightIcon className="h-3 w-3" />
                        <span>{conversation.messageCount} messages</span>
                      </div>
                      {conversation.totalTokens && (
                        <div className="flex items-center space-x-1">
                          <SparklesIcon className="h-3 w-3" />
                          <span>{conversation.totalTokens.toLocaleString()} tokens</span>
                        </div>
                      )}
                      {conversation.totalCost && (
                        <div className="flex items-center space-x-1">
                          <span>💰</span>
                          <span>${conversation.totalCost.toFixed(4)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-6">
                    <Link
                      to={`/chat/${conversation.galaxyId}`}
                      className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
                    >
                      <ArrowRightIcon className="h-4 w-4" />
                      <span>Continue</span>
                    </Link>
                    
                    <button
                      onClick={() => exportConversation(conversation.id)}
                      className="flex items-center space-x-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                    >
                      <ArchiveBoxIcon className="h-4 w-4" />
                      <span>Export</span>
                    </button>
                    
                    <button
                      onClick={() => deleteConversation(conversation.id)}
                      className="flex items-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationHistoryPage;