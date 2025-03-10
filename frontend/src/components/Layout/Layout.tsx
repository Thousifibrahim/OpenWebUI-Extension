import React from 'react';
// import Sidebar from './Sidebar';
// import Header from './Header';
// import { useStore } from '../../store/store';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // const { sidebarOpen, mobileMenuOpen } = useStore();

  return (
    <div className="min-h-screen bg-black flex">
      {/* Disabled legacy layout - using TopNavigation instead */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

export default Layout;