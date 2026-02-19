import { Outlet } from 'react-router-dom';
import BottomBar from './BottomBar';

export default function Layout() {
  return (
    <div className="bg-gray-50 min-h-screen font-sans pb-24">
      <main className="max-w-4xl mx-auto p-4">
        <Outlet />
      </main>
      <BottomBar />
    </div>
  );
}
