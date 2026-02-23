import { Outlet } from 'react-router-dom';
import BottomBar from './BottomBar';
import Sidebar from './Sidebar';
import { usePlatform } from '@/src/hooks/usePlatform';
import { motion } from 'motion/react';

export default function Layout() {
  const { isMobile, isIos } = usePlatform();

  return (
    <div className="relative min-h-screen font-sans overflow-x-hidden">
      {/* Background Liquid Blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="liquid-blob bg-indigo-400 w-[500px] h-[500px] -top-20 -left-20" />
        <div className="liquid-blob bg-purple-400 w-[400px] h-[400px] top-1/2 -right-20" />
        <div className="liquid-blob bg-pink-400 w-[300px] h-[300px] bottom-0 left-1/3" />
      </div>

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar visível apenas no Desktop */}
        <Sidebar />

        <main className={`flex-1 flex flex-col ${isMobile ? (isIos ? 'pb-28' : 'pb-20') : ''}`}>
          <div className="max-w-5xl mx-auto w-full p-4 lg:p-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
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