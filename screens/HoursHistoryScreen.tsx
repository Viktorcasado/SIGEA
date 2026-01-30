import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useUser } from '../contexts/UserContext';
import { Registration } from '../types';
import { Clock, Award, CheckCircle2 } from 'lucide-react';

const HoursHistoryScreen: React.FC = () => {
  const { user } = useUser();
  const [history, setHistory] = useState<Registration[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('registrations')
          .select('*, events(*)')
          .eq('user_id', user.id)
          .eq('status', 'confirmed');

        if (error) throw error;

        const confirmedRegs = data as Registration[];
        setHistory(confirmedRegs);

        // Lógica de soma automática workload (Prompt Mestre)
        const total = confirmedRegs.reduce((acc, curr) => acc + (curr.events?.workload || 0), 0);
        setTotalHours(total);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-black text-[#1e293b] tracking-tight">Histórico de Horas</h1>
        <p className="text-gray-500 font-medium">Sua evolução acadêmica documentada</p>
      </header>

      {/* Contador Centralizado */}
      <div className="bg-gradient-to-br from-[#2e7d32] to-[#1b5e20] p-10 rounded-[32px] text-white shadow-2xl shadow-green-900/20 relative overflow-hidden text-center">
        <Clock size={120} className="absolute -right-8 -bottom-8 opacity-10 rotate-12" />
        <h2 className="text-sm font-black uppercase tracking-[0.2em] opacity-80 mb-2">Total de Carga Horária Válida</h2>
        <div className="text-7xl font-black tracking-tighter">
          {totalHours}<span className="text-2xl ml-2 opacity-60">horas</span>
        </div>
        <div className="mt-6 flex justify-center items-center space-x-2 text-sm font-bold bg-white/10 w-fit mx-auto px-4 py-2 rounded-full">
           <Award size={18} />
           <span>{history.length} Eventos Concluídos</span>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-800 px-2">Detalhamento por Evento</h3>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-400 font-medium">Nenhuma carga horária confirmada ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map(reg => (
            <div key={reg.id} className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <CheckCircle2 className="text-[#2e7d32]" size={20} />
                <div>
                   <h4 className="font-bold text-gray-900 leading-tight">{reg.events?.title}</h4>
                   <p className="text-xs text-gray-500 font-medium uppercase mt-1">{reg.events?.category}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-[#2e7d32]">+{reg.events?.workload}h</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HoursHistoryScreen;