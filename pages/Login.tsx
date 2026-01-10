
import React, { useState, useEffect } from 'react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [canUseBiometrics, setCanUseBiometrics] = useState(false);

  useEffect(() => {
    // Detecta se é mobile app via UserAgent ou bridge Flutter
    const isApp = (window as any).flutter_inappwebview || navigator.userAgent.includes('SigeaMobile');
    if (isApp && window.PublicKeyCredential) {
      setCanUseBiometrics(localStorage.getItem('sigea_biometry_enabled') === 'true');
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (view === 'SIGN_IN') {
        const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (err) throw err;
        onLogin();
      } else if (view === 'SIGN_UP') {
        const { error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { 
            data: { name: name.trim(), campus, role: 'PARTICIPANT', user_type: 'ALUNO' },
            emailRedirectTo: `${window.location.origin}/login`
          }
        });
        if (err) throw err;
        setView('CHECK_EMAIL');
      } else if (view === 'FORGOT_PASSWORD') {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
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

  const handleBiometricLogin = async () => {
    setLoading(true);
    // Bridge com Flutter local_auth
    if ((window as any).SigeaNative) {
      try {
        const success = await (window as any).SigeaNative.authenticateBiometrics();
        if (success) onLogin();
      } catch (e) {
        setError("Falha na autenticação biométrica nativa.");
      }
    } else {
      // Simulação para Web/Dev
      setTimeout(() => { setLoading(false); onLogin(); }, 1000);
    }
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [campus, setCampus] = useState(CAMPUS_LIST[0]);

  if (view === 'CHECK_EMAIL') {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center p-8 bg-white dark:bg-[#09090b] animate-in zoom-in-95">
        <div className="size-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mb-8">
          <span className="material-symbols-outlined text-4xl">mail</span>
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight mb-4">E-mail Enviado</h2>
        <p className="text-xs font-bold text-zinc-500 text-center uppercase tracking-widest max-w-xs leading-relaxed">
          Verifique sua caixa de entrada institucional para confirmar sua conta ou redefinir sua senha.
        </p>
        <button onClick={() => setView('SIGN_IN')} className="mt-12 text-primary font-black uppercase text-[10px] tracking-widest">Voltar para o Início</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white animate-in fade-in overflow-y-auto no-scrollbar">
      <header className="p-6 flex items-center justify-between shrink-0">
        <button onClick={() => view === 'SIGN_IN' ? onBack?.() : setView('SIGN_IN')} className="size-12 flex items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-900 text-zinc-500 border border-zinc-100 dark:border-white/5"><span className="material-symbols-outlined font-black">arrow_back</span></button>
        <span className="text-primary font-black text-lg tracking-tighter">SIGEA IFAL</span>
      </header>

      <main className="flex-1 flex flex-col px-8 pb-20 max-w-md mx-auto justify-center w-full">
        <div className="space-y-12">
          <header className="space-y-4">
            <h1 className="text-[48px] font-[1000] tracking-tighter uppercase leading-[0.8]">
              {view === 'SIGN_IN' ? 'Portal' : (view === 'SIGN_UP' ? 'Novo' : 'Recuperar')}
              <br /><span className="text-primary">{view === 'FORGOT_PASSWORD' ? 'Senha' : 'Acesso'}</span>
            </h1>
            <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.3em]">
              Sistema de Gestão de Eventos Acadêmicos
            </p>
          </header>

          <form onSubmit={handleAuth} className="space-y-8">
            {error && <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-black text-red-500 text-center">{error}</div>}

            <div className="space-y-5">
              {view === 'SIGN_UP' && (
                <input required type="text" placeholder="NOME COMPLETO" value={name} onChange={e => setName(e.target.value)} className="w-full h-18 bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-white/5 rounded-2xl px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all uppercase" />
              )}
              <input required type="email" placeholder="E-MAIL INSTITUCIONAL" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-18 bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-white/5 rounded-2xl px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all lowercase" />
              {view !== 'FORGOT_PASSWORD' && (
                <div className="relative">
                  <input required type={showPassword ? "text" : "password"} placeholder="SENHA" value={password} onChange={e => setPassword(e.target.value)} className="w-full h-18 bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-white/5 rounded-2xl px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"><span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span></button>
                </div>
              )}
            </div>

            <button disabled={loading} className="w-full h-20 bg-primary text-white font-[1000] rounded-[2rem] shadow-2xl shadow-primary/30 uppercase text-[12px] tracking-[0.2em] active:scale-95 transition-all flex items-center justify-center">
              {loading ? <div className="size-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : (view === 'SIGN_IN' ? 'Entrar Agora' : 'Confirmar')}
            </button>
          </form>

          {view === 'SIGN_IN' && canUseBiometrics && (
            <button onClick={handleBiometricLogin} className="w-full py-4 border-2 border-primary/20 rounded-2xl flex items-center justify-center gap-3 text-primary font-black text-[10px] uppercase tracking-widest animate-in fade-in">
              <span className="material-symbols-outlined">fingerprint</span> Acesso Biométrico
            </button>
          )}

          <footer className="text-center space-y-6">
            {view === 'SIGN_IN' && <button onClick={() => setView('FORGOT_PASSWORD')} className="text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-primary transition-colors">Esqueci meus dados de acesso</button>}
            <button onClick={() => setView(view === 'SIGN_IN' ? 'SIGN_UP' : 'SIGN_IN')} className="w-full text-primary font-[1000] uppercase text-[11px] tracking-widest">
              {view === 'SIGN_IN' ? 'Criar nova conta institucional' : 'Já tenho uma conta'}
            </button>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Login;
