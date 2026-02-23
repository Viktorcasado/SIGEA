import { NavLink } from 'react-router-dom';
import { Home, Compass, Award, User, LogIn } from 'lucide-react';
import { usePlatform } from '@/src/hooks/usePlatform';
import { useUser } from '@/src/contexts/UserContext';

export default function BottomBar() {
  const { isIos } = usePlatform();
  const { user } = useUser();
  
  const navItems = [
    { path: '/', label: 'Início', icon: Home },
    { path: '/explorar', label: 'Explorar', icon: Compass },
    { path: '/certificados', label: 'Certificados', icon: Award, protected: true },
    { path: user ? '/perfil' : '/login', label: user ? 'Perfil' : 'Entrar', icon: user ? User : LogIn },
  ];

  const filteredItems = navItems.filter(item => !item.protected || user);

  return (
    <nav className={`fixed bottom-4 left-4 right-4 glass-panel rounded-[2rem] flex items-center justify-around z-50 overflow-hidden ${isIos ? 'pb-4 h-20' : 'h-16'}`}>
      {filteredItems.map(({ path, label, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          end={path === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full transition-all duration-500 ${
              isActive 
                ? 'text-indigo-600 scale-110' 
                : 'text-gray-400 hover:text-gray-600'
            }`
          }
        >
          <div className={`relative p-1 ${isActive ? 'after:content-[""] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-indigo-600 after:rounded-full' : ''}`}>
            <Icon className="w-6 h-6" />
          </div>
          <span className="text-[9px] font-black mt-1 uppercase tracking-widest">
            {label}
          </span>
        </NavLink>
      ))}
    </nav>
  );
}