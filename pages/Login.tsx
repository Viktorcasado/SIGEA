
import React, { useState } from 'react';
import { supabase, handleSupabaseError } from '../supabaseClient.ts';
import { CAMPUS_LIST } from '../constants.tsx';

interface LoginProps {
  onLogin: () => void;
  onBack?: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

type AuthView = 'SIGN_IN' | 'SIGN_UP' | 'FORGOT_PASSWORD' | 'CHECK_EMAIL';

const Login: React.FC<LoginProps> = ({ onLogin, onBack }) => {
  const [view, setView] = useState<AuthView>('SIGN_IN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [campus, setCampus] = useState(CAMPUS_LIST[0]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const origin = window.location.origin;
    const siteUrl = `${origin}/reset-password`;

    try {
      if (view === 'SIGN_IN') {
        const { error: err } = await supabase.auth.signInWithPassword({ 
          email: email.trim(), 
          password 
        });
        if (err) throw err;
        onLogin();
      } else if (view === 'SIGN_UP') {
        const { error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { 
            data: { name, campus, role: 'PARTICIPANT' },
            emailRedirectTo: origin
          }
        });
        if (err) throw err;
        setView('CHECK_EMAIL');
      } else if (view === 'FORGOT_PASSWORD') {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: siteUrl,
        });
        if (err) throw err;
        setView('CHECK_EMAIL');
      }
    } catch (err: any) {
      setError(handleSupabaseError(err));
    } finally {
      setLoading(false);
    }
  };

  if (view === 'CHECK_EMAIL') {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center p-8 bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white animate-in zoom-in-95 duration-500">
        <div className="w-full max-w-sm flex flex-col items-center text-center space-y-12">
          <div className="size-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary mb-2 shadow-inner ring-1 ring-primary/20">
            <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-[34px] font-black tracking-tight uppercase leading-none">Verifique o E-mail</h2>
            <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 leading-relaxed uppercase tracking-tight px-6">
              As instruções institucionais foram enviadas para o seu endereço de e-mail.
            </p>
          </div>

          <div className="w-full space-y-4 pt-4">
            <button 
              onClick={() => window.open('mailto:', '_blank')}
              className="w-full h-18 bg-primary text-white font-black rounded-3xl shadow-2xl shadow-primary/30 active:scale-95 transition-all uppercase text-[11px] tracking-[0.2em]"
            >
              Abrir Caixa de Entrada
            </button>
            <button 
              onClick={() => setView('SIGN_IN')}
              className="w-full py-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-primary transition-colors"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white animate-in fade-in overflow-y-auto no-scrollbar">
      <header className="p-8 flex items-center justify-between sticky top-0 z-10 max-w-5xl mx-auto w-full">
        <button 
          onClick={() => view === 'SIGN_IN' ? (onBack?.()) : setView('SIGN_IN')}
          className="size-14 lg:size-12 flex items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-900 text-zinc-500 active:scale-90 transition-all border border-zinc-100 dark:border-white/5"
        >
          <span className="material-symbols-outlined font-black">arrow_back</span>
        </button>
        <span className="text-primary font-black text-lg tracking-tighter uppercase">SIGEA</span>
      </header>

      <main className="flex-1 flex flex-col px-8 pb-12 max-w-sm lg:max-w-md mx-auto w-full justify-center">
        <div className="space-y-12">
          <header className="space-y-4">
            <h1 className="text-[48px] lg:text-[54px] font-[1000] tracking-tighter uppercase leading-[0.85] text-slate-900 dark:text-white">
              {view === 'SIGN_IN' ? 'Portal de Acesso' : (view === 'SIGN_UP' ? 'Novo Cadastro' : 'Resetar Senha')}
            </h1>
            <p className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 leading-relaxed uppercase tracking-widest max-w-[300px]">
              {view === 'FORGOT_PASSWORD' 
                ? 'Insira seu e-mail do IFAL para redefinir credenciais.' 
                : 'Acesse o sistema oficial de gestão acadêmica do Instituto Federal de Alagoas.'}
            </p>
          </header>

          <form onSubmit={handleAuth} className="space-y-10">
            {error && (
              <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-[10px] font-black text-red-500 text-center animate-in shake">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {view === 'SIGN_UP' && (
                <div className="space-y-2 relative group">
                  <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Nome Completo</label>
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full h-20 lg:h-18 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-3xl px-6 text-sm font-bold outline-none focus:ring-8 focus:ring-primary/5 transition-all uppercase" />
                </div>
              )}

              <div className="space-y-2 relative group">
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">E-mail Institucional</label>
                <input required type="email" placeholder="nome@ifal.edu.br" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-20 lg:h-18 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-3xl px-6 text-sm font-bold outline-none focus:ring-8 focus:ring-primary/5 transition-all lowercase" />
              </div>
              
              {view !== 'FORGOT_PASSWORD' && (
                <div className="space-y-2 relative group">
                  <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
                  <input required type="password" placeholder="********" value={password} onChange={e => setPassword(e.target.value)} className="w-full h-20 lg:h-18 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-3xl px-6 text-sm font-bold outline-none focus:ring-8 focus:ring-primary/5 transition-all" />
                </div>
              )}
            </div>

            <button 
              disabled={loading} 
              className="w-full h-20 bg-primary text-white font-black rounded-[2.5rem] lg:rounded-Apple shadow-2xl shadow-primary/30 flex items-center justify-center uppercase text-[11px] tracking-[0.25em] active:scale-95 transition-all mt-4 disabled:opacity-50 hover:scale-[1.02]"
            >
              {loading ? (
                <div className="size-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                view === 'SIGN_IN' ? 'Entrar Agora' : (view === 'SIGN_UP' ? 'Cadastrar' : 'Recuperar Acesso')
              )}
            </button>
          </form>

          <footer className="text-center pt-8 flex flex-col gap-6">
            {view === 'SIGN_IN' && (
              <button 
                onClick={() => setView('FORGOT_PASSWORD')}
                className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.1em] hover:text-primary transition-colors"
              >
                Esqueci meus dados de acesso
              </button>
            )}
            <button 
              onClick={() => setView(view === 'SIGN_IN' ? 'SIGN_UP' : 'SIGN_IN')} 
              className="text-[11px] font-black text-primary uppercase tracking-[0.15em] hover:underline underline-offset-4"
            >
              {view === 'SIGN_IN' ? 'Não possui acesso? Registre-se aqui' : 'Já possui cadastro? Clique para logar'}
            </button>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Login;
