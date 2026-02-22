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
    <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 h-screen sticky top-0 p-6">
      <div className="mb-10 px-2">
        <Link to="/" className="text-2xl font-black text-gray-900 tracking-tighter">
          SIGEA<span className="text-indigo-600">.</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-2">
        {filteredItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="pt-6 border-t border-gray-100">
        {user ? (
          <>
            <div className="flex items-center gap-3 px-2 mb-6">
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.nome} 
                  className="w-10 h-10 rounded-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  {user.nome.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-sm text-gray-900 truncate">{user.nome}</span>
                <span className="text-xs text-gray-500 truncate">{user.email}</span>
              </div>
            </div>
            <button 
              onClick={logout}
              className="flex items-center gap-4 px-4 py-3 w-full rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </>
        ) : (
          <Link 
            to="/login"
            className="flex items-center gap-4 px-4 py-3 w-full rounded-2xl font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all"
          >
            <LogIn className="w-5 h-5" />
            Entrar na Conta
          </Link>
        )}
      </div>
    </aside>
  );
}