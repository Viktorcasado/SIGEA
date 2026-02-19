import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Calendar, ShieldCheck, FileBarChart, History } from 'lucide-react';

const navLinks = [
  { to: '/gestor/painel', label: 'Painel', icon: LayoutDashboard },
  { to: '/gestor/eventos', label: 'Eventos', icon: Calendar },
  { to: '/gestor/vinculos', label: 'Vínculos', icon: ShieldCheck },
  { to: '/gestor/relatorios', label: 'Relatórios', icon: FileBarChart },
  { to: '/gestor/auditoria', label: 'Auditoria', icon: History },
];

export default function GestorLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <aside className="w-64 bg-white border-r border-gray-200 p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-8">Painel do Gestor</h2>
        <nav className="flex flex-col space-y-2">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <Icon className="w-5 h-5 mr-3" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
