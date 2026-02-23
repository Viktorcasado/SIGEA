import { NavLink } from 'react-router-dom';
import { Home, Compass, Award, User, LogIn } from 'lucide-react';
import { useUser } from '@/src/contexts/UserContext';

export default function BottomBar() {
  const { user } = useUser();
  
  const navItems = [
    { path: '/', label: 'Início', icon: Home },
    { path: '/explorar', label: 'Explorar', icon: Compass },
    { path: '/certificados', label: 'Certificados', icon: Award, protected: true },
    { path: user ? '/perfil' : '/login', label: user ? 'Perfil' : 'Entrar', icon: user ? User : LogIn },
  ];

  const filteredItems = navItems.filter(item => !item.protected || user);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe pt-2">
      <div className="glass-panel rounded-[2rem] flex items-center justify-around h-16 mb-4 shadow-2xl shadow-black/5 overflow-hidden">
        {filteredItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ${
                isActive 
                  ? 'text-indigo-600 scale-110' 
                  : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            <div className={`relative p-1 ${isActive ? 'after:content-[""] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-indigo-600 after:rounded-full' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-black mt-1 uppercase tracking-widest">
              {label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}