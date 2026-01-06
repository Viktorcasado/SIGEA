
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

interface ReportsProps {
  navigateTo: (page: string) => void;
}

const Reports: React.FC<ReportsProps> = ({ navigateTo }) => {
  const [stats, setStats] = useState({
    todayRegistrations: 0,
    totalCheckins: 0,
    totalEvents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Inscrições de hoje
      const { count: todayCount } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Total de check-ins
      const { count: checkinCount } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Confirmado');

      // Total de eventos
      const { count: eventCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      setStats({
        todayRegistrations: todayCount || 0,
        totalCheckins: checkinCount || 0,
        totalEvents: eventCount || 0
      });
      setLoading(false);
    };

    fetchReports();
  }, []);

  return (
    <div className="flex flex-col w-full min-h-screen bg-background-light dark:bg-background-dark pb-36">
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md border-b-2 border-slate-200 dark:border-gray-800 p-4 flex items-center justify-between">
        <button onClick={() => navigateTo('home')} className="size-11 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
          <span className="material-symbols-outlined font-black">arrow_back</span>
        </button>
        <h2 className="text-sm font-black uppercase tracking-[0.2em]">Relatórios Analíticos</h2>
        <button className="size-11 flex items-center justify-center rounded-full text-primary">
          <span className="material-symbols-outlined">download</span>
        </button>
      </header>

      <main className="p-6 space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Inscrições Hoje</p>
            <p className="text-3xl font-black text-primary">{loading ? '...' : stats.todayRegistrations}</p>
            <div className="flex items-center gap-1 text-[9px] text-green-500 font-black mt-2">
              <span className="material-symbols-outlined text-[12px]">trending_up</span>
              NOVO RECORDE
            </div>
          </div>
          <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Check-ins Totais</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{loading ? '...' : stats.totalCheckins}</p>
            <div className="flex items-center gap-1 text-[9px] text-slate-500 font-black mt-2">
              EFETIVADOS
            </div>
          </div>
        </div>

        <section className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border-2 border-slate-200 dark:border-slate-700 shadow-lg space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Fluxo de Inscrições</h3>
          <div className="h-40 flex items-end justify-between gap-2 px-2">
            {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-primary/20 rounded-t-xl relative group transition-all"
                  style={{ height: `${h}%` }}
                >
                  <div
                    className="absolute bottom-0 w-full bg-primary rounded-t-xl transition-all"
                    style={{ height: `${h / 2}%` }}
                  ></div>
                </div>
                <span className="text-[8px] font-black text-slate-400">D{i + 1}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Relatórios por Demanda</h3>
          <div className="space-y-3">
            {[
              { label: 'Participantes por Campus', ext: 'XLSX' },
              { label: 'Lista de Chamada Geral', ext: 'PDF' },
              { label: 'Métricas de Permanência', ext: 'CSV' }
            ].map((r, i) => (
              <button key={i} className="w-full flex items-center justify-between p-5 bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-200 dark:border-slate-700 active:scale-[0.98] transition-all">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-primary border border-slate-200">
                    <span className="material-symbols-outlined">description</span>
                  </div>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase">{r.label}</span>
                </div>
                <span className="text-[9px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full">{r.ext}</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Reports;
