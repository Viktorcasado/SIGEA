"use client";

import { NavLink, useLocation } from 'react-router-dom';
import { Home, Compass, Award, User } from 'lucide-react';
import { motion } from 'motion/react';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/explorar', label: 'Explore', icon: Compass },
  { path: '/certificados', label: 'Shop', icon: Award }, // Usando Award para representar conquistas/certificados
];

export default function BottomBar() {
  const location = useLocation();

  return (
    <div className="fixed bottom-8 left-0 right-0 flex justify-center px-6 z-50">
      <nav className="bg-white/40 backdrop-blur-xl border border-white/20 rounded-full p-2 flex items-center gap-1 shadow-2xl shadow-indigo-500/10">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
          
          return (
            <NavLink
              key={path}
              to={path}
              className="relative flex items-center justify-center px-6 py-3 rounded-full transition-all duration-300 group"
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-white rounded-full shadow-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="relative flex flex-col items-center gap-1">
                <Icon 
                  className={`w-6 h-6 transition-colors duration-300 ${
                    isActive ? 'text-indigo-600' : 'text-gray-500 group-hover:text-gray-700'
                  }`} 
                />
                <span className={`text-[10px] font-bold transition-colors duration-300 ${
                  isActive ? 'text-indigo-600' : 'text-gray-500 group-hover:text-gray-700'
                }`}>
                  {label}
                </span>
              </div>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}