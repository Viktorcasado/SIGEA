import React from 'react';
import PageHeader from '../components/PageHeader';

interface SecurityScreenProps {
  onBack: () => void;
}

const SecurityScreen: React.FC<SecurityScreenProps> = ({ onBack }) => {
  return (
    <div>
      <PageHeader title="Segurança" onBack={onBack} />
      
      <main className="p-6 space-y-6">
        <div className="space-y-4">
            <div>
                <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha Atual</label>
                <input 
                    type="password" 
                    id="current-password"
                    className="w-full bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl p-3 border border-transparent focus:outline-none focus:ring-2 focus:ring-ifal-green"
                    placeholder="********"
                />
            </div>
            <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nova Senha</label>
                <input 
                    type="password" 
                    id="new-password"
                    className="w-full bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl p-3 border border-transparent focus:outline-none focus:ring-2 focus:ring-ifal-green"
                    placeholder="********"
                />
            </div>
             <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar Nova Senha</label>
                <input 
                    type="password" 
                    id="confirm-password"
                    className="w-full bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl p-3 border border-transparent focus:outline-none focus:ring-2 focus:ring-ifal-green"
                    placeholder="********"
                />
            </div>
        </div>
        <button className="w-full bg-ifal-green text-white font-semibold py-3 rounded-xl hover:bg-emerald-600 transition-colors">
            Salvar Alterações
        </button>
      </main>
    </div>
  );
};

export default SecurityScreen;