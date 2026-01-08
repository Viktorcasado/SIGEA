
import React, { useState } from 'react';
import { supabase, handleSupabaseError } from '../supabaseClient.ts';
import { CAMPUS_LIST } from '../constants.tsx';

interface LoginProps {
  onLogin: (demo?: boolean) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

type AuthView = 'SIGN_IN' | 'SIGN_UP' | 'FORGOT_PASSWORD';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [view, setView] = useState<AuthView>('SIGN_IN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [campus, setCampus] = useState(CAMPUS_LIST[0]);

  const handleGovBr = () => {
    const redirectUrl = `https://api.sigea.ifal.edu.br/auth/govbr/callback`;
    const GOV_BR_URL = `https://sso.staging.acesso.gov.br/authorize?response_type=code&client_id=sigea.ifal.edu.br&scope=openid+profile+email&redirect_uri=${encodeURIComponent(redirectUrl)}`;
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
        setMessage("Conta criada! Verifique seu e-mail institucional para confirmar o acesso.");
        setView('SIGN_IN');
      } else if (view === 'FORGOT_PASSWORD') {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (err) throw err;
        setMessage("Se o e-mail existir em nossa base, um link de recuperação foi enviado.");
      }
    } catch (err: any) {
      setError(handleSupabaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-white animate-in fade-in duration-500 overflow-y-auto no-scrollbar transition-colors duration-500">
      <div className="w-full max-w-sm space-y-10">
        <header className="text-center space-y-2">
          <h1 className="text-[64px] font-[900] tracking-[-0.08em] leading-none mb-4 text-slate-900 dark:text-white">Sigea</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-zinc-600">Gestão de Eventos • IFAL</p>
        </header>

        {message && (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl text-[10px] font-black text-primary uppercase text-center animate-in zoom-in">
            {message}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-black text-red-400 uppercase text-center animate-in shake">
            {error}
          </div>
        )}

        <div className="space-y-6 flex flex-col items-center">
          <button 
            onClick={handleGovBr}
            className="w-full h-12 bg-white border border-[#004088]/30 rounded-full flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm hover:bg-zinc-50 hover:border-[#004088]"
          >
            <span className="text-[#004088] font-bold text-sm">Entrar com</span>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Gov.br_logo.svg/1024px-Gov.br_logo.svg.png" 
              alt="gov.br" 
              className="h-5 mt-0.5" 
            />
          </button>

          <div className="w-full flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-slate-200 dark:bg-zinc-800"></div>
            <span className="text-[9px] font-black text-slate-400 dark:text-zinc-700 uppercase tracking-widest whitespace-nowrap">acesso institucional</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-zinc-800"></div>
          </div>

          <form onSubmit={handleAuth} className="w-full space-y-4">
            {view === 'SIGN_UP' && (
              <div className="space-y-4 animate-in slide-in-from-top-2">
                <input 
                  required 
                  type="text" 
                  placeholder="NOME COMPLETO" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full h-14 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 rounded-2xl px-6 text-xs font-bold outline-none focus:border-primary/50 transition-all text-slate-900 dark:text-white shadow-sm"
                />
                <select 
                  value={campus}
                  onChange={e => setCampus(e.target.value)}
                  className="w-full h-14 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 rounded-2xl px-6 text-xs font-bold outline-none text-slate-500 dark:text-zinc-400 appearance-none shadow-sm"
                >
                  {CAMPUS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}

            <input 
              required 
              type="email" 
              placeholder="E-MAIL" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full h-14 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 rounded-2xl px-6 text-xs font-bold outline-none focus:border-primary/50 transition-all text-slate-900 dark:text-white shadow-sm"
            />
            
            {view !== 'FORGOT_PASSWORD' && (
              <input 
                required 
                type="password" 
                placeholder="SENHA" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full h-14 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 rounded-2xl px-6 text-xs font-bold outline-none focus:border-primary/50 transition-all text-slate-900 dark:text-white shadow-sm"
              />
            )}

            <button 
              disabled={loading}
              className="w-full h-16 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center uppercase text-[11px] tracking-widest active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? <div className="size-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 
               view === 'SIGN_IN' ? "Entrar" : 
               view === 'SIGN_UP' ? "Criar Conta" : 
               "Recuperar Senha"}
            </button>
          </form>
        </div>

        <footer className="flex flex-col gap-6 items-center">
          <div className="flex flex-col items-center gap-2">
            {view === 'SIGN_IN' ? (
              <>
                <button onClick={() => setView('FORGOT_PASSWORD')} className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors">Esqueci minha senha</button>
                <button onClick={() => setView('SIGN_UP')} className="text-[10px] font-black text-primary uppercase tracking-widest">Não tem conta? Cadastre-se</button>
              </>
            ) : (
              <button onClick={() => setView('SIGN_IN')} className="text-[10px] font-black text-primary uppercase tracking-widest">Voltar para o Login</button>
            )}
          </div>
          
          <div className="flex items-center gap-8 pt-4 border-t border-slate-100 dark:border-white/5 w-full justify-center">
            <button 
              onClick={() => onLogin(true)}
              className="text-[9px] font-black text-slate-400 dark:text-zinc-700 uppercase tracking-[0.3em] hover:text-slate-600 dark:hover:text-zinc-500 flex items-center gap-2 transition-all active:scale-90"
            >
              <span className="material-symbols-outlined text-[18px]">visibility</span>
              Visitante
            </button>
            <button 
              onClick={() => onLogin(true)}
              className="text-[9px] font-black text-slate-400 dark:text-zinc-700 uppercase tracking-[0.3em] hover:text-primary dark:hover:text-primary flex items-center gap-2 transition-all active:scale-90"
            >
              <span className="material-symbols-outlined text-[18px]">key</span>
              Admin
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Login;
