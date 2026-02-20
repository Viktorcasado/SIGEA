import { Outlet } from 'react-router-dom';
import BottomBar from './BottomBar';
import WhatsAppButton from './WhatsAppButton';

export default function Layout() {
  return (
    <div className="bg-gray-50 min-h-screen font-sans pb-20">
      <main className="max-w-4xl mx-auto p-4">
        <Outlet />
      </main>
      <WhatsAppButton />
      <BottomBar />
    </div>
  );
}