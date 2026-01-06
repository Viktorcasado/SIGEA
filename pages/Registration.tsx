
import React, { useState } from 'react';
import { CAMPUS_LIST } from '../constants';
import { Event } from '../types';
import { supabase } from '../supabaseClient';
import { logActivity } from '../utils/logger';

interface RegistrationProps {
  navigateTo: (page: string, eventId?: string | null) => void;
  eventId: string | null;
  events: Event[];
  user: any;
  unreadNotifications: number;
  addNotification: (userId: string, title: string, text: string) => void;
}

const Registration: React.FC<RegistrationProps> = ({ navigateTo, eventId, events, user, unreadNotifications, addNotification }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [campus, setCampus] = useState('');
  const [name, setName] = useState(user?.user_metadata?.full_name || '');

  const event = events.find(e => e.id === eventId) || events[0];

  if (!event) return null;

  const handleConfirmRegistration = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('registrations').insert([
        {
          event_id: event.id,
          user_id: user.id,
          user_name: name,
          user_email: user.email,
          user_campus: campus,
          status: 'Pendente',
        }
      ]);

      if (error) throw error;

      await logActivity(user.id, 'EVENT_REGISTER', `Inscrição no evento: ${event.title}`, { eventId: event.id, campus });

      if ((window as any).addNotification) {
        await (window as any).addNotification(user.id, 'Inscrição Confirmada!', `Você agora está inscrito em: ${event.title}`);
      }

      navigateTo('home');
      alert('Inscrição realizada com sucesso!');
    } catch (err: any) {
      alert('Erro ao realizar inscrição: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col w-full pb-32 min-h-screen bg-background-light dark:bg-background-dark">
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md border-b-2 border-slate-200 dark:border-gray-800 transition-colors">
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={() => navigateTo('details', event.id)} className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full text-slate-900 dark:text-gray-200 font-bold">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-widest">Inscrição</h1>
          <div className="w-10"></div>
        </div>
        <div className="h-2 w-full bg-slate-200 dark:bg-gray-800">
          <div
            className="h-full bg-primary rounded-r-full transition-all duration-500 shadow-[0_0_15px_rgba(19,91,236,0.4)]"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      <main className="flex-1 p-4">
        <div className="bg-white dark:bg-surface-dark rounded-3xl p-4 mb-8 flex gap-4 border-2 border-slate-300 dark:border-gray-800 shadow-lg">
          <div className="size-20 rounded-2xl bg-cover bg-center shrink-0 border border-slate-200" style={{ backgroundImage: `url(${event.imageUrl})` }}></div>
          <div className="flex flex-col justify-center min-w-0">
            <span className="text-[10px] font-black text-primary bg-primary/10 px-2.5 py-1 rounded-full w-fit mb-2 uppercase tracking-widest">{event.type}</span>
            <h2 className="text-sm font-black text-slate-950 dark:text-white truncate uppercase">{event.title}</h2>
          </div>
        </div>

        {step === 1 && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center font-black">1</div>
              <h3 className="text-lg font-black text-slate-950 dark:text-white">Seus Dados</h3>
            </div>
            <div className="space-y-5">
              <label className="block space-y-2">
                <span className="text-xs font-black text-slate-700 dark:text-gray-400 uppercase ml-1">Nome Completo</span>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-5 bg-white dark:bg-surface-dark border-2 border-slate-300 rounded-3xl focus:ring-4 focus:ring-primary/20 outline-none text-sm shadow-md"
                  placeholder="Seu nome"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-black text-slate-700 dark:text-gray-400 uppercase ml-1">Campus de Origem</span>
                <select
                  className="w-full p-5 pr-12 bg-white dark:bg-surface-dark border-2 border-slate-300 rounded-3xl outline-none text-sm shadow-md appearance-none font-bold"
                  value={campus}
                  onChange={e => setCampus(e.target.value)}
                >
                  <option value="">Selecione o Campus</option>
                  {CAMPUS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center font-black">2</div>
              <h3 className="text-lg font-black text-slate-950 dark:text-white">Vínculo</h3>
            </div>
            <div className="space-y-4">
              {['Estudante IFAL', 'Servidor IFAL', 'Externo'].map((opt, idx) => (
                <label key={idx} className="flex items-center p-5 rounded-3xl border-2 cursor-pointer bg-white dark:bg-surface-dark border-slate-300 dark:border-gray-800">
                  <input type="radio" name="vinculo" className="size-6 text-primary mr-5" defaultChecked={idx === 0} />
                  <p className="text-sm font-black text-slate-950 dark:text-white uppercase">{opt}</p>
                </label>
              ))}
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center font-black">3</div>
              <h3 className="text-lg font-black text-slate-950 dark:text-white">Confirmação</h3>
            </div>
            <div className="bg-white dark:bg-surface-dark p-6 rounded-[2.5rem] border-2 border-slate-300 dark:border-gray-800 shadow-xl space-y-6">
              <div className="flex flex-col items-center text-center gap-2 mb-4">
                <span className="material-symbols-outlined text-green-600 text-6xl">check_circle</span>
                <p className="font-black text-slate-950 dark:text-white">Tudo pronto!</p>
                <p className="text-xs text-slate-600 font-bold uppercase">Confirme para garantir sua vaga.</p>
              </div>
            </div>
          </section>
        )}
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md border-t-2 border-slate-200 dark:border-gray-800 p-5 z-50 shadow-2xl max-w-md mx-auto h-[90px]">
        <div className="flex gap-4 h-full">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} className="flex-1 border-2 border-slate-300 rounded-3xl font-black text-xs uppercase">Voltar</button>
          )}
          <button
            disabled={loading}
            onClick={() => step < 3 ? setStep(s => s + 1) : handleConfirmRegistration()}
            className="flex-[2] bg-primary text-white font-black rounded-3xl uppercase text-xs flex items-center justify-center gap-2"
          >
            {loading ? <span className="material-symbols-outlined animate-spin">sync</span> : (step < 3 ? 'Continuar' : 'Confirmar')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Registration;
