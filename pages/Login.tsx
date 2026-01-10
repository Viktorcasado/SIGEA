
import React, { useState } from 'react';
import { supabase, handleSupabaseError } from '../supabaseClient.ts';
import { CAMPUS_LIST } from '../constants.tsx';

interface LoginProps {
  onLogin: () => void;
  onBack?: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onBack }) => {
  const [view, setView] = useState<'SIGN_IN' | 'SIGN_UP'>('SIGN_IN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [campus, setCampus] = useState(CAMPUS_LIST[0]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (view === 'SIGN_IN') {
        const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { name, campus, role: 'PARTICIPANT' } }
        });
        if (err) throw err;
        alert("Verifique seu e-mail para confirmar o cadastro.");
      }
      onLogin();
    } catch (err: any) {
      setError(handleSupabaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white animate-in fade-in overflow-y-auto">
      <header className="p-6 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="size-12 flex items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 shadow-sm active:scale-90 transition-all">
          <span className="material-symbols-outlined font-black">arrow_back</span>
        </button>
        <span className="text-primary font-black text-2xl tracking-tighter">SIGEA</span>
      </header>

      <main className="flex-1 flex flex-col px-6 pb-20 max-w-sm mx-auto justify-center w-full space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-black uppercase leading-[0.85] tracking-tighter">
            {view === 'SIGN_IN' ? 'Acesso' : 'Novo'}<br />
            <span className="text-primary">Portal</span>
          </h1>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-black text-red-500 text-center uppercase tracking-widest">{error}</div>}
          
          <div className="space-y-4">
            {view === 'SIGN_UP' && (
              <input required type="text" placeholder="NOME" value={name} onChange={e => setName(e.target.value.toUpperCase())} className="w-full h-16 bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-white/5 rounded-2xl px-6 font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
            )}
            <input required type="email" placeholder="E-MAIL" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-16 bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-white/5 rounded-2xl px-6 font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
            <input required type="password" placeholder="SENHA" value={password} onChange={e => setPassword(e.target.value)} className="w-full h-16 bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-white/5 rounded-2xl px-6 font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
          </div>

          <button disabled={loading} className="w-full h-18 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 uppercase text-xs tracking-widest active:scale-95 transition-all">
            {loading ? "..." : (view === 'SIGN_IN' ? "Entrar" : "Criar Conta")}
          </button>
        </form>

        <button onClick={() => setView(view === 'SIGN_IN' ? 'SIGN_UP' : 'SIGN_IN')} className="text-center text-primary font-black uppercase text-[10px] tracking-widest">
          {view === 'SIGN_IN' ? "Criar conta" : "Já tenho conta"}
        </button>
      </main>
    </div>
  );
};

export default Login;
