
import React, { useState, useRef, useEffect } from 'react';

interface CheckInProps {
  navigateTo: (page: string) => void;
}

const CheckIn: React.FC<CheckInProps> = ({ navigateTo }) => {
  const [lastCheckIns, setLastCheckIns] = useState([
    { name: 'João da Silva', role: 'Estudante', time: '14:32', initials: 'JS', status: 'Sucesso' },
    { name: 'Maria Oliveira', role: 'Docente', time: '14:30', initials: 'MO', status: 'Sucesso' },
    { name: 'Carlos Lima', role: 'Visitante', time: '14:28', initials: 'CL', status: 'Sucesso' }
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraMode, setCameraMode] = useState<'user' | 'environment'>('environment');
  const [hasError, setHasError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const startCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    try {
      const constraints = {
        video: { facingMode: cameraMode, width: { ideal: 1280 }, height: { ideal: 720 } }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; }
      setHasError(null);
    } catch (err: any) {
      setHasError("Acesso à câmera negado. Verifique as permissões do navegador.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); }
    };
  }, [cameraMode]);

  const simulateScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanResult("VALIDADO");
      const newCheckIn = {
        name: 'Novo Participante',
        role: 'Estudante',
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        initials: 'NP',
        status: 'Sucesso'
      };
      setLastCheckIns([newCheckIn, ...lastCheckIns.slice(0, 2)]);
      setTimeout(() => setScanResult(null), 2000);
    }, 1500);
  };

  return (
    <div className="flex flex-col w-full h-screen bg-slate-50 dark:bg-zinc-950 overflow-hidden">
      <header className="flex items-center justify-between px-6 py-6 shrink-0 z-10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5">
        <button 
          onClick={() => navigateTo('home')} 
          className="size-12 flex items-center justify-center rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 text-slate-900 dark:text-white shadow-xl shadow-black/5 active:scale-90 transition-all"
        >
          <span className="material-symbols-outlined text-[18px] font-black">arrow_back_ios_new</span>
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-sm font-black uppercase tracking-tighter text-zinc-900 dark:text-white">Validador SIGEA</h2>
          <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Check-in em Tempo Real</p>
        </div>
        <button onClick={() => setCameraMode(cameraMode === 'user' ? 'environment' : 'user')} className="size-12 flex items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 text-slate-400 active:scale-90 transition-all border border-slate-100 dark:border-white/5">
          <span className="material-symbols-outlined text-[20px]">flip_camera_ios</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto no-scrollbar">
        <div onClick={simulateScan} className="relative w-full aspect-square bg-black rounded-[3rem] overflow-hidden shadow-2xl shrink-0 group ring-4 ring-white/10 cursor-pointer">
          {hasError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-zinc-900">
              <span className="material-symbols-outlined text-4xl text-red-500 mb-4">videocam_off</span>
              <p className="text-white text-[10px] font-black uppercase opacity-60 leading-relaxed">{hasError}</p>
              <button onClick={startCamera} className="mt-8 px-10 py-4 bg-primary text-white text-[10px] font-black rounded-2xl uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all">Tentar Novamente</button>
            </div>
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline muted className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${scanResult ? 'brightness-50 blur-sm' : ''}`} />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none"></div>
            </>
          )}

          {!hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className={`relative w-[240px] h-[240px] transition-transform duration-500 ${isScanning ? 'scale-110' : ''}`}>
                <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-3xl"></div>
                <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-3xl"></div>
                <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-3xl"></div>
                <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-3xl"></div>
                <div className={`absolute top-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_15px_#10b981] ${!scanResult ? 'animate-[scan_2s_linear_infinite]' : 'opacity-0'}`}></div>
              </div>
              {scanResult && (
                <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex flex-col items-center justify-center animate-in zoom-in duration-300">
                  <div className="size-24 rounded-full bg-white flex items-center justify-center shadow-2xl mb-4">
                    <span className="material-symbols-outlined text-primary text-5xl font-black">verified</span>
                  </div>
                  <h3 className="text-white text-xl font-black uppercase tracking-[0.3em]">VALIDADO</h3>
                  <p className="text-white/80 text-[10px] font-bold uppercase mt-2 tracking-widest">Entrada Liberada</p>
                </div>
              )}
              {!scanResult && (
                <div className="mt-16 px-6 py-3 rounded-full bg-black/40 backdrop-blur-2xl border border-white/10 flex items-center gap-3">
                  <span className={`size-2 rounded-full ${isScanning ? 'bg-primary animate-ping' : 'bg-white/40'}`}></span>
                  <p className="text-white text-[9px] font-black uppercase tracking-[0.2em]">{isScanning ? 'Lendo SIGEA Token...' : 'Posicione o QR Code'}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
             <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Atividade Atual</h3>
             <span className="text-[9px] font-black text-primary uppercase">Mesa Redonda #04</span>
          </div>
          <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 rounded-3xl flex items-center gap-4 shadow-sm">
             <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><span className="material-symbols-outlined">analytics</span></div>
             <div className="flex-1">
                <p className="text-[11px] font-black text-zinc-900 dark:text-white uppercase leading-none mb-1">Taxa de Presença</p>
                <div className="w-full bg-slate-50 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-2">
                   <div className="bg-primary h-full" style={{width: '68%'}}></div>
                </div>
             </div>
             <span className="text-[11px] font-black text-primary">68%</span>
          </div>
        </div>

        <div className="space-y-4 pb-12">
          <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 px-1">Check-ins Recentes</h3>
          <div className="space-y-2">
            {lastCheckIns.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 shadow-sm transition-all animate-in slide-in-from-left-4 duration-500">
                <div className="size-11 rounded-2xl bg-slate-50 dark:bg-zinc-800 text-slate-400 flex items-center justify-center font-black text-sm">{item.initials}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-xs truncate uppercase text-zinc-900 dark:text-white">{item.name}</p>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{item.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-zinc-500 uppercase">{item.time}</p>
                  <p className="text-[8px] font-black text-primary uppercase">SUCESSO</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckIn;
