
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
  const [biometrySupported, setBiometrySupported] = useState(false);
  const [isBiometryEnabled, setIsBiometryEnabled] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [campus, setCampus] = useState(CAMPUS_LIST[0]);

  useEffect(() => {
    // Verifica suporte a biometria
    if (window.PublicKeyCredential) {
      setBiometrySupported(true);
      setIsBiometryEnabled(localStorage.getItem('sigea_biometry_enabled') === 'true');
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const origin = window.location.origin;
    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (view === 'SIGN_IN') {
        const { error: err } = await supabase.auth.signInWithPassword({ 
          email: normalizedEmail, 
          password 
        });
        if (err) throw err;
        onLogin();
      } else if (view === 'SIGN_UP') {
        const { error: err } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: { 
            data: { name: name.trim(), campus, role: 'PARTICIPANT' },
            emailRedirectTo: origin
          }
        });
        if (err) throw err;
        setView('CHECK_EMAIL');
      } else if (view === 'FORGOT_PASSWORD') {
        const { error: err } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
          redirectTo: `${origin}/reset-password`,
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
    if (window.navigator.vibrate) window.navigator.vibrate(50);
    
    // Simulação do desafio biométrico do navegador (FaceID/Digital)
    // Em produção, navigator.credentials.get()
    setTimeout(() => {
      setLoading(false);
      onLogin(); // Autenticação simulada baseada no token de confiança local
    }, 1500);
  };

  const handleGovBrLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google', 
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (err: any) {
      setError("O acesso gov.br está temporariamente indisponível. Use seu e-mail de acesso.");
    } finally {
      setLoading(false);
    }
  };

  if (view === 'CHECK_EMAIL') {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center p-8 bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white animate-in zoom-in-95 duration-500">
        <div className="w-full max-sm flex flex-col items-center text-center space-y-12">
          <div className="size-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary mb-2 shadow-inner ring-1 ring-primary/20">
            <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
          </div>
          <div className="space-y-4">
            <h2 className="text-[34px] font-black tracking-tight uppercase leading-none">Verifique seu E-mail</h2>
            <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 leading-relaxed uppercase tracking-tight px-6">
              Enviamos um link de confirmação para o endereço informado. Verifique também sua caixa de spam.
            </p>
          </div>
          <div className="w-full space-y-4 pt-4">
            <button onClick={() => window.open('mailto:', '_blank')} className="w-full h-18 bg-primary text-white font-black rounded-3xl shadow-2xl shadow-primary/30 active:scale-95 transition-all uppercase text-[11px] tracking-[0.2em]">Abrir Caixa de Entrada</button>
            <button onClick={() => setView('SIGN_IN')} className="w-full py-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-primary transition-colors">Voltar ao Início</button>
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
        <div className="space-y-10">
          <header className="space-y-4">
            <h1 className="text-[44px] lg:text-[54px] font-[1000] tracking-tighter uppercase leading-[0.85] text-slate-900 dark:text-white">
              {view === 'SIGN_IN' ? 'Portal de Acesso' : (view === 'SIGN_UP' ? 'Novo Cadastro' : 'Recuperar Acesso')}
            </h1>
            <p className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 leading-relaxed uppercase tracking-widest max-w-[320px]">
              {view === 'SIGN_IN' ? 'Conecte-se com sua identidade digital oficial ou e-mail pessoal.' : 'Aberto a estudantes, servidores e cidadãos da comunidade externa.'}
            </p>
          </header>

          <div className="space-y-8">
            {view === 'SIGN_IN' && (
              <div className="space-y-5">
                <button 
                  onClick={handleGovBrLogin}
                  disabled={loading}
                  className="w-full h-20 bg-[#004b82] hover:bg-[#00365d] text-white rounded-[2.5rem] lg:rounded-apple shadow-2xl shadow-blue-900/30 flex items-center justify-center gap-5 transition-all active:scale-95 disabled:opacity-50 group border-b-4 border-blue-950"
                >
                  <div className="size-12 bg-white rounded-2xl flex items-center justify-center p-2 group-hover:rotate-6 transition-transform">
                    <img src="https://zefvlzfkqsxhzjtwmtmj.supabase.co/storage/v1/object/public/assets/govbr-logo.png" alt="gov.br" className="w-full h-auto" />
                  </div>
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Entrar com o</span>
                    <span className="text-[18px] font-black tracking-tighter uppercase">gov.br</span>
                  </div>
                </button>
                
                {isBiometryEnabled && (
                  <button 
                    onClick={handleBiometricLogin}
                    disabled={loading}
                    className="w-full h-20 bg-primary/10 border-2 border-primary/20 text-primary rounded-[2.5rem] flex items-center justify-center gap-4 transition-all active:scale-95 animate-in zoom-in"
                  >
                    <span className="material-symbols-outlined text-3xl">fingerprint</span>
                    <span className="text-[13px] font-black uppercase tracking-widest">Acesso Biométrico</span>
                  </button>
                )}

                <div className="flex items-center gap-5 px-2">
                  <div className="h-px flex-1 bg-zinc-100 dark:bg-white/5"></div>
                  <span className="text-[9px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-[0.4em]">Ou por e-mail</span>
                  <div className="h-px flex-1 bg-zinc-100 dark:bg-white/5"></div>
                </div>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-6">
              {error && (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-[10px] font-black text-red-500 text-center animate-in shake">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {view === 'SIGN_UP' && (
                  <div className="space-y-1.5 group">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">Nome Completo</label>
                    <input required type="text" placeholder="Nome Sobrenome" value={name} onChange={e => setName(e.target.value)} className="w-full h-16 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-3xl px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all uppercase" />
                  </div>
                )}

                <div className="space-y-1.5 group">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">E-mail</label>
                  <input required type="email" placeholder="exemplo@email.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-16 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-3xl px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all lowercase" />
                </div>
                
                {view !== 'FORGOT_PASSWORD' && (
                  <div className="space-y-1.5 group">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">Senha</label>
                    <div className="relative">
                      <input required type={showPassword ? "text" : "password"} placeholder="********" value={password} onChange={e => setPassword(e.target.value)} className="w-full h-16 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-3xl px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 size-12 flex items-center justify-center text-zinc-400 hover:text-primary transition-colors active:scale-90"><span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span></button>
                    </div>
                  </div>
                )}
              </div>

              <button disabled={loading} className="w-full h-20 bg-primary text-white font-black rounded-[2.5rem] lg:rounded-apple shadow-2xl shadow-primary/30 flex items-center justify-center uppercase text-[11px] tracking-[0.25em] active:scale-95 transition-all disabled:opacity-50 hover:brightness-105">
                {loading ? <div className="size-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (view === 'SIGN_IN' ? 'Entrar Agora' : (view === 'SIGN_UP' ? 'Criar Cadastro' : 'Enviar Link'))}
              </button>
            </form>
          </div>

          <footer className="text-center pt-2 flex flex-col gap-6">
            {view === 'SIGN_IN' && (
              <button onClick={() => setView('FORGOT_PASSWORD')} className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.1em] hover:text-primary transition-colors">Esqueci meus dados de acesso</button>
            )}
            <button onClick={() => setView(view === 'SIGN_IN' ? 'SIGN_UP' : 'SIGN_IN')} className="text-[10px] font-black text-primary uppercase tracking-[0.15em] hover:underline underline-offset-8 decoration-2">
              {view === 'SIGN_IN' ? 'Não possui conta? Cadastre-se aqui' : 'Já possui cadastro? Clique para logar'}
            </button>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Login;
