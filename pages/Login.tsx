
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
  const [biometricSupported, setBiometricSupported] = useState(false);

  useEffect(() => {
    const checkBiometrics = async () => {
      if (typeof window !== 'undefined' && window.PublicKeyCredential) {
        try {
          const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setBiometricSupported(available);
        } catch (e) {
          setBiometricSupported(false);
        }
      }
    };
    checkBiometrics();
  }, []);

  const handleBiometricLogin = async () => {
    if (!biometricSupported) return;
    
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const lastUser = session?.user;
      if (lastUser) {
        const isBioActive = localStorage.getItem(`sigea_bio_enabled_${lastUser.id}`) === 'true';
        if (!isBioActive) {
          setError("Biometria não ativada. Ative-a no seu perfil após o login manual.");
          setLoading(false);
          return;
        }
      }

      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const options: CredentialRequestOptions = {
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: "required",
          allowCredentials: [] 
        },
        mediation: 'optional'
      };

      // Chamada garantida no contexto do navegador
      const credential = await window.navigator.credentials.get(options);
      
      if (credential) {
        if (session) {
          onLogin();
        } else {
          setError("Sessão não encontrada. Realize o login com e-mail uma vez para vincular seu dispositivo.");
        }
      }
    } catch (err: any) {
      console.error("Erro Biométrico:", err);
      if (err.name === 'SecurityError' || err.message.includes('feature is not enabled')) {
        setError("Acesso biométrico bloqueado por política de segurança (iframe). Use o link direto do app para ativar.");
      } else if (err.name !== 'NotAllowedError') {
        setError("Erro na autenticação biométrica do dispositivo.");
      }
    } finally {
      setLoading(false);
    }
  };

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
      }
    } catch (err: any) {
      setError(handleSupabaseError(err));
    } finally {
      setLoading(false);
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
        <h2 className="text-2xl font-black uppercase tracking-tight mb-4 text-zinc-900 dark:text-white">E-mail Enviado</h2>
        <p className="text-xs font-bold text-zinc-500 text-center uppercase tracking-widest max-w-xs leading-relaxed">Verifique sua caixa de entrada institucional.</p>
        <button onClick={() => setView('SIGN_IN')} className="mt-12 text-primary font-black uppercase text-[10px] tracking-widest">Voltar</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white animate-in fade-in overflow-y-auto no-scrollbar">
      <header className="p-6 flex items-center justify-between shrink-0">
        <button onClick={() => view === 'SIGN_IN' ? onBack?.() : setView('SIGN_IN')} className="size-12 flex items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-900 text-zinc-500 border border-zinc-100 dark:border-white/5 shadow-sm active:scale-90 transition-all">
          <span className="material-symbols-outlined font-black">arrow_back</span>
        </button>
        <span className="text-primary font-[1000] text-2xl tracking-tighter uppercase">SIGEA</span>
      </header>

      <main className="flex-1 flex flex-col px-6 pb-20 max-w-[440px] mx-auto justify-center w-full">
        <div className="space-y-12">
          <header className="space-y-4 text-center">
            <h1 className="text-[54px] font-[1000] tracking-tighter uppercase leading-[0.85]">
              {view === 'SIGN_IN' ? 'Portal de' : 'Novo'}
              <br /><span className="text-primary">Acesso</span>
            </h1>
            <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.4em]">Sistema de Eventos Acadêmicos</p>
          </header>

          <form onSubmit={handleAuth} className="space-y-8">
            {error && (
              <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-[10px] font-black text-red-500 text-center animate-in shake">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {view === 'SIGN_UP' && (
                <div className="space-y-3">
                  <label className="text-[12px] font-black text-zinc-400 uppercase tracking-widest ml-4">Nome Completo</label>
                  <input required type="text" placeholder="JOÃO SILVA" value={name} onChange={e => setName(e.target.value)} className="w-full h-20 bg-slate-50 dark:bg-zinc-900 border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] px-8 text-lg font-bold outline-none focus:border-primary/30 focus:ring-8 focus:ring-primary/5 transition-all uppercase text-zinc-900 dark:text-white" />
                </div>
              )}
              
              <div className="space-y-3">
                <label className="text-[12px] font-black text-zinc-400 uppercase tracking-widest ml-4">E-mail Institucional</label>
                <input required type="email" placeholder="nome@ifal.edu.br" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-20 bg-slate-50 dark:bg-zinc-900 border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] px-8 text-lg font-bold outline-none focus:border-primary/30 focus:ring-8 focus:ring-primary/5 transition-all text-zinc-900 dark:text-white" />
              </div>

              <div className="space-y-3">
                <label className="text-[12px] font-black text-zinc-400 uppercase tracking-widest ml-4">Sua Senha</label>
                <div className="relative">
                  <input required type={showPassword ? "text" : "password"} placeholder="********" value={password} onChange={e => setPassword(e.target.value)} className="w-full h-20 bg-slate-50 dark:bg-zinc-900 border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] px-8 text-lg font-bold outline-none focus:border-primary/30 focus:ring-8 focus:ring-primary/5 transition-all text-zinc-900 dark:text-white" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-8 top-1/2 -translate-y-1/2 text-zinc-400 active:scale-90 transition-transform">
                    <span className="material-symbols-outlined text-[30px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button disabled={loading} className="w-full h-20 bg-primary text-white font-[1000] rounded-[2.5rem] shadow-2xl shadow-primary/30 uppercase text-[14px] tracking-[0.2em] active:scale-95 transition-all flex items-center justify-center">
                {loading ? <div className="size-8 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : 'Entrar no Sistema'}
              </button>

              {view === 'SIGN_IN' && biometricSupported && (
                <button 
                  type="button"
                  onClick={handleBiometricLogin}
                  className="w-full h-20 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-2 border-zinc-100 dark:border-white/5 rounded-[2.5rem] flex items-center justify-center gap-4 transition-all active:scale-95 shadow-lg shadow-black/5"
                >
                  <span className="material-symbols-outlined text-3xl text-primary">fingerprint</span>
                  <span className="text-[11px] font-black uppercase tracking-widest">Acesso com FaceID / Digital</span>
                </button>
              )}
            </div>
          </form>

          <footer className="text-center space-y-10 pt-6">
            <button onClick={() => setView(view === 'SIGN_IN' ? 'SIGN_UP' : 'SIGN_IN')} className="w-full text-primary font-[1000] uppercase text-[12px] tracking-widest">
              {view === 'SIGN_IN' ? 'Criar nova conta institucional' : 'Já possuo uma conta cadastrada'}
            </button>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Login;
