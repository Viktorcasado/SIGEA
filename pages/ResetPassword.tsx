
import React, { useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '../supabaseClient.ts';
import Logo from '../components/Logo.tsx';

interface ResetPasswordProps {
  navigateTo: (page: string) => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ navigateTo }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState(true);

  useEffect(() => {
    // Escuta mudanças de auth para detectar o fluxo de recovery
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        console.log("Fluxo de recuperação de senha detectado.");
        setIsVerifyingToken(false);
      } else if (session) {
        setIsVerifyingToken(false);
      } else {
        // Se não houver sessão ou evento após 2 segundos, exibe erro
        setTimeout(() => setIsVerifyingToken(false), 2000);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        supabase.auth.signOut();
        navigateTo('login');
      }, 3000);
    } catch (err: any) {
      setError(handleSupabaseError(err));
    } finally {
      setLoading(false);
    }
  };

  if (isVerifyingToken) {
    return (
      <div className="fixed inset-0 bg-[#09090b] flex flex-col items-center justify-center p-8">
        <div className="size-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-6 text-[10px] font-black text-primary uppercase tracking-[0.4em]">Validando Token Institucional</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white font-sans animate-in fade-in duration-500">
      <header className="p-8 flex justify-center">
        <Logo size="lg" />
      </header>

      <main className="flex-1 flex flex-col px-8 pb-12 max-w-sm mx-auto w-full justify-center">
        <div className="space-y-12">
          <header className="space-y-4 text-center">
            <h1 className="text-[44px] font-[1000] tracking-tighter uppercase leading-none">
              Nova <span className="text-primary">Senha</span>
            </h1>
            <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 leading-relaxed uppercase tracking-tight">
              Crie uma credencial forte para proteger seus dados no IFAL.
            </p>
          </header>

          {success ? (
            <div className="p-10 bg-primary/5 border border-primary/20 rounded-[3rem] text-center space-y-6 animate-in zoom-in">
              <div className="size-20 bg-primary rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-primary/40">
                <span className="material-symbols-outlined text-white text-4xl">verified</span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">Sucesso!</h3>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Aguarde o redirecionamento para o login...</p>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-8">
              {error && (
                <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-black text-red-500 text-center animate-in shake">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2 group">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Nova Senha</label>
                  <input 
                    required 
                    type="password" 
                    placeholder="********" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-18 px-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-3xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>

                <div className="space-y-2 group">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Confirmar Senha</label>
                  <input 
                    required 
                    type="password" 
                    placeholder="********" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-18 px-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-3xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              <button 
                disabled={loading}
                className="w-full h-20 bg-primary text-white font-black rounded-[2rem] shadow-2xl shadow-primary/30 flex items-center justify-center uppercase text-[11px] tracking-[0.25em] active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="size-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'Redefinir Agora'
                )}
              </button>
            </form>
          )}
        </div>
      </main>
      
      <footer className="py-12 text-center opacity-30 text-[9px] font-black uppercase tracking-[0.5em]">
        SIGEA • RedFederal v2.5
      </footer>
    </div>
  );
};

export default ResetPassword;
