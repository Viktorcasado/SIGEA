
import React, { useState } from 'react';
import { supabase, handleSupabaseError } from '../supabaseClient.ts';
import { CAMPUS_LIST } from '../constants.tsx';

interface LoginProps {
  onLogin: (demo?: boolean) => void;
  onBack?: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

type AuthView = 'SIGN_IN' | 'SIGN_UP' | 'FORGOT_PASSWORD';

const Login: React.FC<LoginProps> = ({ onLogin, onBack, darkMode, setDarkMode }) => {
  const [view, setView] = useState<AuthView>('SIGN_IN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [campus, setCampus] = useState(CAMPUS_LIST[0]);

  const handleGovBr = () => {
    const GOV_BR_URL = `https://sso.staging.acesso.gov.br/authorize?response_type=code&client_id=sigea.ifal.edu.br&scope=openid+profile+email&redirect_uri=${encodeURIComponent('https://api.sigea.ifal.edu.br/auth/govbr/callback')}`;
    window.location.href = GOV_BR_URL;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (view === 'SIGN_IN') {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      } else if (view === 'SIGN_UP') {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            data: { name, campus, role: 'PARTICIPANT' },
            emailRedirectTo: window.location.origin
          }
        });
        if (err) throw err;
        setMessage("Perfil criado! Verifique seu e-mail institucional para validar o acesso.");
        setView('SIGN_IN');
      } else if (view === 'FORGOT_PASSWORD') {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email);
        if (err) throw err;
        setMessage("Link de recuperação enviado com sucesso.");
      }
    } catch (err: any) {
      setError(handleSupabaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleBackNavigation = () => {
    if (view !== 'SIGN_IN') {
      setView('SIGN_IN');
      setError(null);
      setMessage(null);
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-white animate-in fade-in duration-700 overflow-y-auto no-scrollbar transition-all">
      
      {/* Botão de Voltar Premium - Apple Style */}
      <button 
        onClick={handleBackNavigation}
        className="absolute top-12 left-8 size-14 flex items-center justify-center rounded-[1.4rem] bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 text-slate-900 dark:text-white shadow-2xl shadow-black/5 active:scale-90 btn-ios-active z-[100] transition-all"
      >
        <span className="material-symbols-outlined text-[20px] font-bold">arrow_back_ios_new</span>
      </button>

      <div className="w-full max-w-sm space-y-12 py-12 page-transition">
        <header className="text-center space-y-3">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
            Acesso Institucional
          </div>
          <h1 className="text-[72px] font-[950] tracking-[-0.08em] leading-none text-slate-900 dark:text-white">
            SI<span className="text-primary drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]">GEA</span>
          </h1>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-zinc-600">
            {view === 'SIGN_IN' ? 'Instituto Federal de Alagoas' : 
             view === 'SIGN_UP' ? 'Novo Registro Acadêmico' : 
             'Recuperar Identidade'}
          </p>
        </header>

        {message && (
          <div className="p-6 bg-primary/10 border border-primary/20 rounded-[2rem] text-[11px] font-black text-primary uppercase text-center animate-in zoom-in duration-300">
            {message}
          </div>
        )}

        {error && (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-[11px] font-black text-red-400 uppercase text-center animate-in shake duration-500">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {view === 'SIGN_IN' && (
            <>
              <button 
                onClick={handleGovBr}
                className="w-full h-16 bg-white border border-slate-200 rounded-3xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-sm hover:border-[#004088]/50 btn-ios-active"
              >
                <span className="text-[#004088] font-bold text-sm">Entrar com</span>
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Gov.br_logo.svg/1024px-Gov.br_logo.svg.png" 
                  alt="gov.br" 
                  className="h-6 mt-0.5" 
                />
              </button>

              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-[1px] bg-slate-200 dark:bg-zinc-800"></div>
                <span className="text-[9px] font-black text-slate-300 dark:text-zinc-700 uppercase tracking-[0.3em]">Ou SIGEA ID</span>
                <div className="flex-1 h-[1px] bg-slate-200 dark:bg-zinc-800"></div>
              </div>
            </>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {view === 'SIGN_UP' && (
              <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">person</span>
                  <input 
                    required 
                    type="text" 
                    placeholder="NOME COMPLETO" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full h-18 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 rounded-3xl pl-16 pr-6 text-xs font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all text-slate-900 dark:text-white"
                  />
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">school</span>
                  <select 
                    value={campus}
                    onChange={e => setCampus(e.target.value)}
                    className="w-full h-18 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 rounded-3xl pl-16 pr-6 text-xs font-bold outline-none text-slate-500 dark:text-zinc-400 appearance-none shadow-sm"
                  >
                    {CAMPUS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div className="relative">
              <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">alternate_email</span>
              <input 
                required 
                type="email" 
                placeholder="E-MAIL INSTITUCIONAL" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-18 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 rounded-3xl pl-16 pr-6 text-xs font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all text-slate-900 dark:text-white"
              />
            </div>
            
            {view !== 'FORGOT_PASSWORD' && (
              <div className="relative">
                <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">lock</span>
                <input 
                  required 
                  type="password" 
                  placeholder="SENHA" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full h-18 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 rounded-3xl pl-16 pr-6 text-xs font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all text-slate-900 dark:text-white"
                />
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full h-20 bg-primary text-white font-black rounded-[2.2rem] shadow-2xl shadow-primary/30 flex items-center justify-center uppercase text-[12px] tracking-[0.2em] btn-ios-active transition-all disabled:opacity-50 mt-4"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processando...</span>
                </div>
              ) : (
                view === 'SIGN_IN' ? "Entrar no Sistema" : 
                view === 'SIGN_UP' ? "Confirmar Registro" : 
                "Solicitar Nova Senha"
              )}
            </button>
          </form>
        </div>

        <footer className="flex flex-col gap-6 items-center pt-6">
          {view === 'SIGN_IN' ? (
            <div className="flex flex-col items-center gap-4">
              <button onClick={() => setView('FORGOT_PASSWORD')} className="text-[11px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest hover:text-primary transition-colors">Perdeu o acesso?</button>
              <button onClick={() => setView('SIGN_UP')} className="text-[11px] font-[900] text-primary uppercase tracking-[0.2em] border-b-2 border-primary/20 pb-1">Criar Nova Conta</button>
            </div>
          ) : (
            <button 
              onClick={() => setView('SIGN_IN')}
              className="text-[11px] font-black text-primary uppercase tracking-widest flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">login</span>
              Já tenho acesso
            </button>
          )}
          
          <div className="pt-8 opacity-20">
             <div className="flex items-center gap-4 text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-[0.4em]">
                <span>IFAL</span>
                <div className="size-1 bg-primary rounded-full"></div>
                <span>SIGEA 2.5</span>
             </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Login;
