import { NavLink } from 'react-router-dom';
import { Home, Compass, Award, User, LayoutDashboard } from 'lucide-react';
import { useUser } from '@/src/contexts/UserContext';

export default function BottomBar() {
  const { user } = useUser();
  
  const navItems = [
    { path: '/', label: 'Início', icon: Home },
    { path: '/explorar', label: 'Explorar', icon: Compass },
    { path: '/certificados', label: 'Certificados', icon: Award },
  ];

  // Adiciona aba de Gestão se for organizador ou aluno (que pode criar eventos)
  if (user?.is_organizer || user?.perfil === 'aluno') {
    navItems.push({ path: '/gestor/painel', label: 'Gestão', icon: LayoutDashboard });
  }

  navItems.push({ path: '/perfil', label: 'Perfil', icon: User });

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 shadow-lg z-50">
      <div className="flex justify-around max-w-md mx-auto px-2">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full pt-3 pb-2 text-[10px] font-bold uppercase tracking-tighter transition-all duration-300 ${
                isActive 
                  ? 'text-indigo-600 scale-110' 
                  : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            <Icon className={`w-6 h-6 mb-1 transition-transform ${path === '/gestor/painel' ? 'text-emerald-500' : ''}`} />
            <span>{label}</span>
            {path === '/gestor/painel' && <div className="w-1 h-1 bg-emerald-500 rounded-full mt-0.5"></div>}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}