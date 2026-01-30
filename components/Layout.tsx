import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNavBar from './BottomNavBar';
import { useUser } from '../contexts/UserContext';

const Layout: React.FC = () => {
  const { user } = useUser();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f8fafc]">
      {/* Sidebar - Desktop Only */}
      {isDesktop && <Sidebar />}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative pb-20 lg:pb-0 overflow-x-hidden">
        <div className="max-w-7xl mx-auto w-full p-4 lg:p-8 animate-fade">
          <Outlet />
        </div>
      </main>

      {/* Bottom Nav - Mobile Only */}
      {!isDesktop && <BottomNavBar />}
    </div>
  );
};

export default Layout;