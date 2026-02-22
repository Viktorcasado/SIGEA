import { Outlet } from 'react-router-dom';
import BottomBar from './BottomBar';
import Sidebar from './Sidebar';
import { usePlatform } from '@/src/hooks/usePlatform';

export default function Layout() {
  const { isMobile, isIos } = usePlatform();

  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col lg:flex-row">
      {/* Sidebar visível apenas no Desktop */}
      <Sidebar />

      <main className={`flex-1 flex flex-col ${isMobile ? (isIos ? 'pb-28' : 'pb-20') : ''}`}>
        <div className="max-w-5xl mx-auto w-full p-4 lg:p-10">
          <Outlet />
        </div>
      </main>

      {/* BottomBar visível apenas no Mobile */}
      {isMobile && <BottomBar />}
    </div>
  );
}