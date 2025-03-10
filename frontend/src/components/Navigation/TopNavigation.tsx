import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/store';
import {
  SparklesIcon,
  CogIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  HomeIcon,
  PlusIcon,
  PhotoIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface TopNavigationProps {
  currentPage?: string;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ currentPage }) => {
  const { user, logout } = useStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="border-b border-gray-800 bg-black/95 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Nav */}
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <SparklesIcon className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold">CenAI</h1>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/dashboard"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === 'dashboard'
                    ? 'bg-white text-black'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <HomeIcon className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              
              <Link
                to="/status"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === 'status'
                    ? 'bg-white text-black'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <CogIcon className="h-4 w-4" />
                <span>System Status</span>
              </Link>
            </nav>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <Link
              to="/settings"
              className={`p-2 rounded-lg transition-all duration-200 ${
                currentPage === 'settings'
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              title="Settings"
            >
              <CogIcon className="h-5 w-5" />
            </Link>
            
            {/* User Avatar and Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800 transition-all duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-white font-medium text-sm">{user?.email}</p>
                  <p className="text-gray-400 text-xs">{user?.role}</p>
                </div>
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-700 md:hidden">
                    <p className="text-white font-medium text-sm">{user?.email}</p>
                    <p className="text-gray-400 text-xs">{user?.role}</p>
                  </div>
                  
                  <Link
                    to="/settings"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <CogIcon className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                  
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;