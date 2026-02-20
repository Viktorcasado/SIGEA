import { NavLink } from 'react-router-dom';
import { Home, Compass, Award, User } from 'lucide-react';

export default function BottomBar() {
  const navItems = [
    { path: '/', label: 'Início', icon: Home },
    { path: '/explorar', label: 'Explorar', icon: Compass },
    { path: '/certificados', label: 'Certificados', icon: Award },
    { path: '/perfil', label: 'Perfil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-around z-50 h-16">
      {navItems.map(({ path, label, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          end={path === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive 
                ? 'text-indigo-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`
          }
        >
          <Icon className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1 uppercase">
            {label}
          </span>
        </NavLink>
      ))}
    </nav>
  );
}