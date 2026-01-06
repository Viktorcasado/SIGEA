import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient.ts';
import { Event } from '../types.ts';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface CheckInProps {
  navigateTo: (page: string) => void;
  events?: Event[];
}

const CheckIn: React.FC<CheckInProps> = ({ navigateTo, events = [] }) => {
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastCheckIns, setLastCheckIns] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [isScannerActive, setIsScannerActive] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
    }
  }, [events]);

  useEffect(() => {
    if (selectedEventId) {
      fetchRecentCheckIns();
      setIsScannerActive(true);
    }
  }, [selectedEventId]);

  // Manejo do Scanner
  useEffect(() => {
    if (isScannerActive && selectedEventId) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scannerRef.current.render(onScanSuccess, onScanFailure);
    } else if (scannerRef.current) {
      scannerRef.current.clear().catch(err => console.error("Erro ao limpar scanner", err));
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Erro cleanup scanner", err));
      }
    };
  }, [isScannerActive, selectedEventId]);

  const onScanSuccess = (decodedText: string) => {
    // Para o scanner após sucesso para não disparar multiplas vezes
    setIsScannerActive(false);
    processCheckIn(decodedText);
  };

  const onScanFailure = (error: any) => {
    // Erros de "QR não encontrado" no frame são ignorados por padrão
  };

  const fetchRecentCheckIns = async () => {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('status', 'Presente')
      .eq('event_id', selectedEventId)
      .order('updated_at', { ascending: false })
      .limit(5);

    if (!error && data) {
      setLastCheckIns(data);
    }
  };

  const processCheckIn = async (identifier: string) => {
    if (!identifier.trim() || !selectedEventId) return;
    setLoading(true);
    setFeedback(null);

    try {
      // 1. Verificar se o participante está inscrito NESTE evento
      // O identificador pode ser o e-mail
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', selectedEventId)
        .or(`user_email.eq.${identifier.trim()},user_id.eq.${identifier.trim()}`)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setFeedback({ type: 'error', msg: 'Inscrição não encontrada para este participante.' });
        return;
      }

      if (data.status === 'Presente') {
        setFeedback({ type: 'error', msg: `${data.user_name} já realizou check-in.` });
        return;
      }

      // 2. Realizar o check-in (atualizar status para Presente)
      const { error: updateError } = await supabase
        .from('registrations')
        .update({
          status: 'Presente',
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id);

      if (updateError) throw updateError;

      setFeedback({ type: 'success', msg: `Check-in de ${data.user_name} realizado com sucesso!` });
      setSearchInput('');
      fetchRecentCheckIns();
    } catch (err: any) {
      console.error("Erro check-in:", err);
      setFeedback({ type: 'error', msg: 'Erro técnico ao processar check-in.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 dark:bg-[#0f172a] pb-24">
      <header className="flex items-center justify-between p-4 pt-8 shrink-0">
        <button onClick={() => navigateTo('home')} className="size-11 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 active:scale-95 transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex flex-col items-center text-center">
          <h2 className="text-lg font-black uppercase tracking-tighter">Validação de Entrada</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Câmera & Manual</p>
        </div>
        <div className="size-11"></div> {/* Spacer */}
      </header>

      <main className="flex-1 flex flex-col p-6 space-y-8">

        {/* Event Selection - Obrigatorio */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Evento Ativo</span>
          <select
            value={selectedEventId}
            onChange={e => setSelectedEventId(e.target.value)}
            className="w-full h-14 px-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-[1.5rem] outline-none font-bold text-sm shadow-sm focus:border-primary transition-all"
          >
            <option value="">Selecione para validar...</option>
            {events.map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        </div>

        {/* Camera Scanner */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest">Leitor de QR Code</h3>
            {isScannerActive && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30">
                <div className="size-1.5 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-[8px] font-black text-red-700 uppercase">Câmera Ligada</span>
              </div>
            )}
          </div>

          <div className="relative w-full aspect-square max-w-[400px] mx-auto bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
            {isScannerActive ? (
              <div id="qr-reader" className="w-full h-full"></div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
                <span className="material-symbols-outlined text-white/20 text-7xl mb-4">videocam_off</span>
                <button
                  onClick={() => setIsScannerActive(true)}
                  disabled={!selectedEventId}
                  className="px-6 py-3 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 uppercase text-[10px] tracking-widest active:scale-95 transition-all disabled:opacity-50"
                >
                  Ligar Câmera
                </button>
              </div>
            )}

            {/* Overlay de Guia (Só aparece se ativo) */}
            {isScannerActive && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="size-64 border-2 border-white/30 rounded-3xl relative">
                  <div className="absolute top-0 left-0 size-8 border-t-4 border-l-4 border-primary rounded-tl-xl"></div>
                  <div className="absolute top-0 right-0 size-8 border-t-4 border-r-4 border-primary rounded-tr-xl"></div>
                  <div className="absolute bottom-0 left-0 size-8 border-b-4 border-l-4 border-primary rounded-bl-xl"></div>
                  <div className="absolute bottom-0 right-0 size-8 border-b-4 border-r-4 border-primary rounded-br-xl"></div>
                </div>
              </div>
            )}
          </div>

          {isScannerActive && (
            <button
              onClick={() => setIsScannerActive(false)}
              className="w-full py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-red-500 transition-colors"
            >
              Câmera Ligada • Clique para desligar
            </button>
          )}
        </div>

        {/* Feedback Section */}
        {feedback && (
          <div className={`p-5 rounded-3xl border-2 animate-in zoom-in-95 duration-300 flex items-center gap-4 ${feedback.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
            <span className="material-symbols-outlined text-3xl">
              {feedback.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <p className="text-xs font-black uppercase leading-tight">{feedback.msg}</p>
          </div>
        )}

        {/* Manual Entry */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest px-1">Busca Manual</h3>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">mail</span>
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && processCheckIn(searchInput)}
                placeholder="aluno@ifal.edu.br"
                className="w-full h-16 pl-12 pr-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-[1.5rem] shadow-sm text-sm font-bold outline-none focus:border-primary transition-all"
              />
            </div>
            <button
              onClick={() => processCheckIn(searchInput)}
              disabled={loading || !selectedEventId || !searchInput}
              className="h-16 px-6 bg-slate-900 dark:bg-slate-700 text-white font-black rounded-[1.5rem] shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? <span className="material-symbols-outlined animate-spin">sync</span> : 'Validar'}
            </button>
          </div>
        </div>

        {/* Live History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest">Histórico Recente</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">{lastCheckIns.length} Confirmados</span>
          </div>
          <div className="space-y-3">
            {lastCheckIns.length > 0 ? lastCheckIns.map((item) => (
              <div key={item.id} className="group flex items-center gap-4 p-4 rounded-[1.5rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm animate-in fade-in slide-in-from-left-2 transition-all">
                <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg">
                  {item.user_name?.[0] || 'P'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-sm truncate uppercase tracking-tight text-slate-800 dark:text-white">{item.user_name}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase truncate">{item.user_email}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-900 dark:text-white">
                    {new Date(item.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <span className="text-[8px] font-bold text-green-500 uppercase">Check-in OK</span>
                </div>
              </div>
            )) : (
              <div className="py-12 flex flex-col items-center justify-center opacity-40">
                <span className="material-symbols-outlined text-5xl mb-2">history</span>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center">Nenhum check-in<br />neste evento</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
};

export default CheckIn;
