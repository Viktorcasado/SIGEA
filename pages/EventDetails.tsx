
import React, { useState } from 'react';
import { Event } from '../types';

interface EventDetailsProps {
  navigateTo: (page: string, eventId?: string) => void;
  eventId: string | null;
  events: Event[];
}

const EventDetails: React.FC<EventDetailsProps> = ({ navigateTo, eventId, events }) => {
  const event = events.find(e => e.id === eventId) || events[0];
  const [tab, setTab] = useState<'sobre' | 'programacao'>('sobre');

  if (!event) return null;

  const handleSupport = () => {
    const phoneNumber = "5582996281235";
    const msg = encodeURIComponent(`Olá! Tenho uma dúvida sobre o evento "${event.title}" no SIGEA.`);
    window.open(`https://wa.me/${phoneNumber}?text=${msg}`, '_blank');
  };

  return (
    <div className="relative flex flex-col w-full pb-40 bg-background-light dark:bg-background-dark min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-white/90 dark:bg-surface-dark/90 backdrop-blur-md p-4 border-b border-gray-100 dark:border-gray-800">
        <button onClick={() => navigateTo('home')} className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-sm font-bold truncate flex-1 text-center px-4">Detalhes do Evento</h2>
        <button className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <span className="material-symbols-outlined">share</span>
        </button>
      </header>

      {/* Hero Image */}
      <div className="w-full h-[240px] relative">
        <div className="w-full h-full bg-center bg-cover" style={{ backgroundImage: `url(${event.imageUrl})` }}>
          <div className="absolute inset-0 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent opacity-90"></div>
        </div>
      </div>

      {/* Content */}
      <main className="flex flex-col px-5 -mt-16 z-20 relative gap-6">
        <div>
          <div className="flex gap-2 mb-3">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">Presencial</span>
            <span className="inline-flex items-center rounded-full bg-orange-100 dark:bg-orange-900/30 px-2.5 py-0.5 text-[10px] font-bold text-orange-700 dark:text-orange-400">Certificado {event.certificateHours}h</span>
          </div>
          <h1 className="text-2xl font-bold leading-tight mb-2 text-gray-900 dark:text-white">{event.title}</h1>
          <p className="text-gray-500 text-xs">Organizado por Pró-Reitoria de Pesquisa</p>
        </div>

        {/* Support Button */}
        <button
          onClick={handleSupport}
          className="flex items-center justify-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-2xl border-2 border-green-100 dark:border-green-800/30 font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-sm"
        >
          <svg viewBox="0 0 24 24" className="size-5 fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          Dúvidas? Fale conosco
        </button>

        {/* Info Cards */}
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 size-12">
              <span className="material-symbols-outlined">calendar_month</span>
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900 dark:text-white">{event.date}</p>
              <p className="text-xs text-gray-500">{event.time}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 size-12">
              <span className="material-symbols-outlined">location_on</span>
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900 dark:text-white">{event.location}</p>
              <p className="text-xs text-gray-500">{event.campus}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
          <button
            onClick={() => setTab('sobre')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${tab === 'sobre' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-gray-500'}`}
          >
            Sobre
          </button>
          <button
            onClick={() => setTab('programacao')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${tab === 'programacao' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-gray-500'}`}
          >
            Programação
          </button>
        </div>

        {tab === 'sobre' ? (
          <section className="space-y-4">
            <h3 className="text-lg font-bold">Descrição do Evento</h3>
            <div className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 space-y-3">
              <p>{event.description}</p>
              <p>Participe desta jornada de aprendizado intenso com os melhores professores e pesquisadores do IFAL.</p>
            </div>
          </section>
        ) : (
          <section className="space-y-6">
            <h3 className="text-lg font-bold">Programação</h3>
            <div className="relative space-y-6">
              <div className="absolute left-3.5 top-2 bottom-4 w-[2px] bg-gray-100 dark:bg-gray-800"></div>
              {[
                { time: '09:00', title: 'Cerimônia de Abertura', loc: 'Auditório Principal' },
                { time: '10:30', title: 'Palestra Magna: Futuro da Tecnologia', loc: 'Auditório Principal' },
                { time: '14:00', title: 'Workshops Práticos', loc: 'Laboratórios' }
              ].map((item, idx) => (
                <div key={idx} className="relative flex gap-4">
                  <div className="relative z-10 mt-1.5 size-2.5 rounded-full bg-primary ring-4 ring-background-light dark:ring-background-dark ml-[9px]"></div>
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{item.time}</span>
                    <h4 className="font-bold text-sm mt-1">{item.title}</h4>
                    <p className="text-xs text-gray-500">{item.loc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 p-4 px-6 z-50 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)] max-w-md mx-auto">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Valor</span>
          <span className="text-xl font-black text-primary">{event.price}</span>
        </div>
        <button
          onClick={() => navigateTo('register', event.id)}
          className="bg-primary hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-all flex items-center gap-2"
        >
          Inscrever-se
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default EventDetails;
