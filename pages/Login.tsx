
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

    const siteUrl = `${window.location.origin}/reset-password`;

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
            emailRedirectTo: window.location.origin
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

  // Renderização da tela de sucesso/e-mail (Imagem 2)
  if (view === 'CHECK_EMAIL') {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center p-8 bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white animate-in zoom-in-95 duration-500">
        <div className="w-full max-w-sm flex flex-col items-center text-center space-y-8">
          <div className="size-24 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-2 shadow-inner">
            <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-black tracking-tight uppercase">Verifique seu e-mail</h2>
            <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 leading-relaxed uppercase tracking-tight">
              Enviamos as instruções de recuperação <br /> para o seu e-mail institucional.
            </p>
          </div>

          <div className="w-full space-y-4 pt-4">
            <button 
              onClick={() => window.open('mailto:', '_blank')}
              className="w-full h-18 bg-primary text-white font-black rounded-3xl shadow-xl shadow-primary/20 active:scale-95 transition-all uppercase text-[10px] tracking-[0.2em]"
            >
              Abrir App de E-mail
            </button>
            <button 
              onClick={() => setView('SIGN_IN')}
              className="w-full py-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-primary transition-colors"
            >
              Confirmar mais tarde
            </button>
          </div>

          <footer className="pt-12 text-[9px] font-black text-zinc-300 dark:text-zinc-800 uppercase tracking-[0.3em] leading-loose">
            Não recebeu? Verifique o spam <br /> ou <button onClick={() => setView('FORGOT_PASSWORD')} className="text-primary hover:underline">tente outro e-mail</button>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white animate-in fade-in overflow-y-auto no-scrollbar">
      <header className="p-6 flex items-center justify-between sticky top-0 z-10">
        <button 
          onClick={() => view === 'SIGN_IN' ? (onBack?.()) : setView('SIGN_IN')}
          className="size-12 flex items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-500 active:scale-90 transition-all"
        >
          <span className="material-symbols-outlined font-black">arrow_back</span>
        </button>
        <span className="material-symbols-outlined text-zinc-300 dark:text-zinc-800">help</span>
      </header>

      <main className="flex-1 flex flex-col px-8 pb-12 max-w-sm mx-auto w-full justify-center">
        <div className="space-y-10">
          <header className="space-y-3">
            <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">
              {view === 'SIGN_IN' ? 'Login' : (view === 'SIGN_UP' ? 'Cadastro' : 'Reset password')}
            </h1>
            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 leading-relaxed uppercase tracking-tight">
              {view === 'FORGOT_PASSWORD' 
                ? 'Insira o e-mail associado à sua conta e enviaremos as instruções para resetar sua senha.' 
                : 'Acesse o portal institucional SIGEA do IFAL.'}
            </p>
          </header>

          <form onSubmit={handleAuth} className="space-y-6">
            {error && (
              <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-black text-red-500 text-center animate-in shake">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {view === 'SIGN_UP' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Nome Completo</label>
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full h-16 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-2xl px-6 text-sm font-bold outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all uppercase" />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">E-mail Institucional</label>
                <input required type="email" placeholder="mcraigw@outlook.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-16 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-2xl px-6 text-sm font-bold outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all lowercase" />
              </div>
              
              {view !== 'FORGOT_PASSWORD' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
                  <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full h-16 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-2xl px-6 text-sm font-bold outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all" />
                </div>
              )}
            </div>

            <button 
              disabled={loading} 
              className="w-full h-18 bg-primary text-white font-black rounded-3xl shadow-xl shadow-primary/20 flex items-center justify-center uppercase text-[11px] tracking-[0.2em] active:scale-95 transition-all mt-4 disabled:opacity-50"
            >
              {loading ? (
                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                view === 'SIGN_IN' ? 'Entrar no Sistema' : (view === 'SIGN_UP' ? 'Criar Minha Conta' : 'Enviar Instruções')
              )}
            </button>
          </form>

          {view === 'SIGN_IN' && (
            <div className="text-center">
              <button 
                onClick={() => setView('FORGOT_PASSWORD')}
                className="text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-primary transition-colors"
              >
                Esqueceu a senha?
              </button>
            </div>
          )}

          <footer className="text-center pt-8">
            <button 
              onClick={() => setView(view === 'SIGN_IN' ? 'SIGN_UP' : 'SIGN_IN')} 
              className="text-[11px] font-black text-primary uppercase tracking-[0.15em]"
            >
              {view === 'SIGN_IN' ? 'Não possui acesso? Cadastre-se' : 'Já possui cadastro? Faça Login'}
            </button>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Login;
