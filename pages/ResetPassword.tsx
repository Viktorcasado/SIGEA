
import React, { useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '../supabaseClient.ts';

interface ResetPasswordProps {
  navigateTo: (page: string) => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ navigateTo }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const checkAuthFlow = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const hasToken = window.location.hash.includes('access_token') || 
                       window.location.search.includes('type=recovery');

      if (!session && !hasToken) {
        setError("O link expirou ou é inválido. Por favor, solicite um novo acesso.");
      }
      setIsVerifying(false);
    };
    checkAuthFlow();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('A nova senha deve ter no mínimo 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.updateUser({ password });
      if (resetError) throw resetError;

      setSuccess(true);
      setTimeout(() => {
        window.location.href = window.location.origin;
      }, 3000);
    } catch (err: any) {
      setError(handleSupabaseError(err));
    } finally {
      setLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-[#09090b] flex flex-col items-center justify-center">
        <div className="size-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-6 text-[10px] font-black text-primary uppercase tracking-widest">Validating Token...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white animate-in slide-in-from-right duration-500 overflow-y-auto no-scrollbar">
      <header className="p-6 flex items-center justify-between sticky top-0 z-10">
        <button 
          onClick={() => window.location.href = window.location.origin}
          className="size-12 flex items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-500 active:scale-90 transition-all"
        >
          <span className="material-symbols-outlined font-black">arrow_back</span>
        </button>
        <span className="material-symbols-outlined text-zinc-300 dark:text-zinc-800">help</span>
      </header>

      <main className="flex-1 flex flex-col px-8 pb-12 max-w-sm mx-auto w-full justify-center">
        <div className="space-y-12">
          <header className="space-y-4">
            <h1 className="text-[44px] font-[1000] tracking-tighter uppercase leading-none">
              Create new <span className="text-primary">password</span>
            </h1>
            <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 leading-relaxed uppercase tracking-tight max-w-[280px]">
              Sua nova senha deve ser diferente das senhas utilizadas anteriormente.
            </p>
          </header>

          {success ? (
            <div className="p-10 bg-primary/5 border border-primary/20 rounded-[3rem] text-center space-y-6 animate-in zoom-in">
              <div className="size-24 bg-primary rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-primary/40">
                <span className="material-symbols-outlined text-white text-5xl">verified</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tight">Senha Alterada!</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Aguarde o redirecionamento institucional...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-8">
              {error && (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-[10px] font-black text-red-500 text-center animate-in shake leading-relaxed">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2 relative group">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative">
                    <input 
                      required 
                      type={showPassword ? "text" : "password"} 
                      autoFocus
                      placeholder="********" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full h-18 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-[1.5rem] px-6 text-sm font-bold outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPassword ? 'visibility' : 'visibility_off'}
                      </span>
                    </button>
                  </div>
                  <p className={`text-[9px] font-black uppercase tracking-widest ml-1 transition-colors ${password.length >= 8 ? 'text-primary' : 'text-zinc-400'}`}>Must be at least 8 characters.</p>
                </div>

                <div className="space-y-2 relative group">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Confirm Password</label>
                  <div className="relative">
                    <input 
                      required 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="********" 
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full h-18 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-[1.5rem] px-6 text-sm font-bold outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showConfirmPassword ? 'visibility' : 'visibility_off'}
                      </span>
                    </button>
                  </div>
                  <p className={`text-[9px] font-black uppercase tracking-widest ml-1 transition-colors ${confirmPassword && password === confirmPassword ? 'text-primary' : 'text-zinc-400'}`}>Both passwords must match.</p>
                </div>
              </div>

              <button 
                disabled={loading}
                className="w-full h-20 bg-primary text-white font-black rounded-[2.2rem] shadow-xl shadow-primary/20 flex items-center justify-center uppercase text-[11px] tracking-[0.25em] active:scale-95 transition-all disabled:opacity-50 mt-4"
              >
                {loading ? (
                  <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;
