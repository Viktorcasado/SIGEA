import { Outlet } from 'react-router-dom';
import BottomBar from './BottomBar';
import Sidebar from './Sidebar';
import { usePlatform } from '@/src/hooks/usePlatform';
import { motion } from 'motion/react';

export default function Layout() {
  const { isMobile, isIos } = usePlatform();

  return (
    <div className="relative min-h-screen font-sans bg-gray-50">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar visível apenas no Desktop */}
        <Sidebar />

        <main className={`flex-1 flex flex-col ${isMobile ? (isIos ? 'pb-28' : 'pb-20') : ''}`}>
          <div className="max-w-5xl mx-auto w-full p-4 lg:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>

        {/* BottomBar visível apenas no Mobile */}
        {isMobile && <BottomBar />}
      </div>
    </div>
  );
}