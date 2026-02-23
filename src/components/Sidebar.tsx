"use client";

import { NavLink, Link } from 'react-router-dom';
import { Home, Compass, Award, User, Bell, LogOut, LogIn } from 'lucide-react';
import { useUser } from '@/src/contexts/UserContext';

export default function Sidebar() {
  const { user, logout } = useUser();

  const navItems = [
    { path: '/', label: 'Início', icon: Home },
    { path: '/explorar', label: 'Explorar', icon: Compass },
    { path: '/certificados', label: 'Certificados', icon: Award, protected: true },
    { path: '/notificacoes', label: 'Notificações', icon: Bell, protected: true },
    { path: '/perfil', label: 'Meu Perfil', icon: User, protected: true },
  ];

  const filteredItems = navItems.filter(item => !item.protected || user);

  return (
    <aside className="hidden lg:flex flex-col w-72 glass-panel h-[calc(100vh-2rem)] sticky top-4 m-4 rounded-[2.5rem] p-8">
      <div className="mb-12 px-2">
        <Link to="/" className="text-3xl font-black text-gray-900 tracking-tighter">
          SIGEA<span className="text-indigo-600">.</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-3">
        {filteredItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-105' 
                  : 'text-gray-600 hover:bg-white/40 hover:text-gray-900'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="pt-6 border-t border-black/5">
        {user ? (
          <>
            <div className="flex items-center gap-3 px-2 mb-6">
              <div className="relative">
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.nome} 
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-md">
                    {user.nome.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="font-black text-sm text-gray-900 truncate">{user.nome}</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider truncate">{user.perfil}</span>
              </div>
            </div>
            <button 
              onClick={logout}
              className="flex items-center gap-4 px-5 py-4 w-full rounded-2xl font-bold text-red-500 hover:bg-red-50/50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </>
        ) : (
          <Link 
            to="/login"
            className="flex items-center gap-4 px-5 py-4 w-full rounded-2xl font-bold text-indigo-600 bg-white/50 hover:bg-white transition-all shadow-sm"
          >
            <LogIn className="w-5 h-5" />
            Entrar na Conta
          </Link>
        )}
      </div>
    </aside>
  );
}