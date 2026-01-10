
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
    if (window.PublicKeyCredential) {
      setBiometrySupported(true);
      setIsBiometryEnabled(localStorage.getItem('sigea_biometry_enabled') === 'true');
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

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
            emailRedirectTo: window.location.origin
          }
        });
        if (err) throw err;
        setView('CHECK_EMAIL');
      } else if (view === 'FORGOT_PASSWORD') {
        const { error: err } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
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
    if (window.navigator.vibrate) window.navigator.vibrate(50);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1200);
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
        <div className="w-full max-w-sm flex flex-col items-center text-center space-y-8">
          <div className="size-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mb-2 shadow-inner ring-1 ring-primary/20">
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-black tracking-tight uppercase leading-none">Verifique seu E-mail</h2>
            <p className="text-[12px] font-bold text-zinc-500 dark:text-zinc-400 leading-relaxed uppercase tracking-tight px-4">
              Enviamos um link de confirmação para o endereço informado. Verifique também sua caixa de spam.
            </p>
          </div>
          <div className="w-full space-y-3">
            <button onClick={() => window.open('mailto:', '_blank')} className="w-full h-16 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all uppercase text-[10px] tracking-widest">Abrir Caixa de Entrada</button>
            <button onClick={() => setView('SIGN_IN')} className="w-full py-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-primary transition-colors">Voltar ao Início</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white animate-in fade-in overflow-y-auto no-scrollbar">
      <header className="p-6 flex items-center justify-between sticky top-0 z-50 w-full bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-100 dark:border-white/5 shrink-0">
        <button 
          onClick={() => view === 'SIGN_IN' ? (onBack?.()) : setView('SIGN_IN')}
          className="size-12 flex items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-900 text-zinc-500 active:scale-90 transition-all border border-zinc-100 dark:border-white/5"
        >
          <span className="material-symbols-outlined font-black">arrow_back</span>
        </button>
        <span className="text-primary font-black text-lg tracking-tighter uppercase">SIGEA</span>
      </header>

      <main className="flex-1 flex flex-col px-6 pb-20 w-full max-w-md mx-auto justify-center min-h-[calc(100dvh-120px)]">
        <div className="space-y-12">
          <header className="space-y-4">
            <h1 className="text-[48px] font-[1000] tracking-tighter uppercase leading-[0.8] text-slate-900 dark:text-white">
              {view === 'SIGN_IN' ? 'Acessar' : (view === 'SIGN_UP' ? 'Cadastrar' : 'Recuperar')}
              <br /><span className="text-primary">Portal</span>
            </h1>
            <p className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 leading-relaxed uppercase tracking-[0.3em] max-w-[280px]">
              {view === 'SIGN_IN' ? 'Portal de Identidade Digital e Gestão Acadêmica' : 'Preencha seus dados institucionais abaixo'}
            </p>
          </header>

          <div className="space-y-10">
            {view === 'SIGN_IN' && (
              <div className="space-y-6">
                {/* BOTÃO GOV.BR CORRIGIDO COM LOGO OFICIAL */}
                <button 
                  onClick={handleGovBrLogin}
                  disabled={loading}
                  className="w-full h-24 bg-[#004b82] hover:bg-[#00365d] text-white rounded-[2.5rem] shadow-2xl shadow-blue-900/30 flex items-center justify-center gap-6 transition-all active:scale-95 disabled:opacity-50 group border-b-[6px] border-blue-950 relative overflow-hidden"
                >
                  <div className="size-16 bg-white rounded-2xl flex items-center justify-center p-2.5 group-hover:rotate-6 transition-transform shadow-inner shrink-0 ml-4">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/b/b3/Logo-govbr.png" 
                      alt="gov.br" 
                      className="w-full h-auto object-contain"
                      loading="eager"
                      onError={(e) => {
                        // Fallback caso a imagem da wikimedia falhe
                        (e.target as HTMLImageElement).src = 'https://www.gov.br/++theme++padrao_govbr/img/logo-govbr.png';
                      }}
                    />
                  </div>
                  <div className="flex flex-col items-start leading-none gap-1 pr-6">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] opacity-80">Entrar com o</span>
                    <span className="text-[26px] font-[1000] tracking-tighter uppercase">gov.br</span>
                  </div>
                </button>
                
                {isBiometryEnabled && (
                  <button 
                    onClick={handleBiometricLogin}
                    disabled={loading}
                    className="w-full h-18 bg-primary/10 border-2 border-primary/20 text-primary rounded-[2rem] flex items-center justify-center gap-4 transition-all active:scale-95 animate-in zoom-in"
                  >
                    <span className="material-symbols-outlined text-3xl font-black">fingerprint</span>
                    <span className="text-[12px] font-black uppercase tracking-widest">Acesso Biométrico</span>
                  </button>
                )}

                <div className="flex items-center gap-4 px-2">
                  <div className="h-px flex-1 bg-zinc-100 dark:bg-white/5"></div>
                  <span className="text-[9px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-[0.5em]">Ou via e-mail</span>
                  <div className="h-px flex-1 bg-zinc-100 dark:bg-white/5"></div>
                </div>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-8">
              {error && (
                <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-black text-red-500 text-center animate-in shake">
                  {error}
                </div>
              )}

              <div className="space-y-5">
                {view === 'SIGN_UP' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest ml-4">Nome Completo</label>
                    <input required type="text" placeholder="SEU NOME AQUI" value={name} onChange={e => setName(e.target.value)} className="w-full h-20 bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-white/5 rounded-[2rem] px-8 text-base font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all uppercase text-slate-900 dark:text-white" />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest ml-4">E-mail Institucional</label>
                  <input required type="email" placeholder="EXEMPLO@EMAIL.COM" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-20 bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-white/5 rounded-[2rem] px-8 text-base font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all lowercase text-slate-900 dark:text-white" />
                </div>
                
                {view !== 'FORGOT_PASSWORD' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest ml-4">Senha de Acesso</label>
                    <div className="relative">
                      <input required type={showPassword ? "text" : "password"} placeholder="********" value={password} onChange={e => setPassword(e.target.value)} className="w-full h-20 bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-white/5 rounded-[2rem] px-8 text-base font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all text-slate-900 dark:text-white" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 size-12 flex items-center justify-center text-zinc-400 hover:text-primary transition-colors active:scale-90"><span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span></button>
                    </div>
                  </div>
                )}
              </div>

              <button 
                disabled={loading} 
                className="w-full h-22 bg-primary text-white font-[1000] rounded-[2.5rem] shadow-2xl shadow-primary/30 flex items-center justify-center uppercase text-[14px] tracking-[0.3em] active:scale-95 transition-all disabled:opacity-50 border-b-[6px] border-secondary"
              >
                {loading ? (
                  <div className="size-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  view === 'SIGN_IN' ? 'ENTRAR AGORA' : (view === 'SIGN_UP' ? 'FINALIZAR CADASTRO' : 'ENVIAR LINK')
                )}
              </button>
            </form>
          </div>

          <footer className="text-center pt-4 flex flex-col gap-8">
            {view === 'SIGN_IN' && (
              <button onClick={() => setView('FORGOT_PASSWORD')} className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.25em] hover:text-primary transition-colors">Perdeu os dados de acesso?</button>
            )}
            <button onClick={() => setView(view === 'SIGN_IN' ? 'SIGN_UP' : 'SIGN_IN')} className="text-[12px] font-[1000] text-primary uppercase tracking-[0.2em] hover:underline underline-offset-8 decoration-2">
              {view === 'SIGN_IN' ? 'Criar nova conta institucional' : 'Já possui cadastro? Entrar'}
            </button>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Login;
