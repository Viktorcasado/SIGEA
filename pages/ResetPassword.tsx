
import React, { useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '../supabaseClient.ts';
import Logo from '../components/Logo.tsx';

/**
 * URL DE CONFIGURAÇÃO NO SUPABASE:
 * Site URL: https://seu-dominio.vercel.app
 * Redirect URLs: https://seu-dominio.vercel.app/reset-password
 */

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

  useEffect(() => {
    const checkSession = async () => {
      // Supabase injeta o token na URL no fluxo de recovery
      const { data: { session } } = await supabase.auth.getSession();
      if (!session && !window.location.hash.includes('access_token')) {
        setError("Link de recuperação expirado ou inválido. Solicite um novo link.");
      }
      setIsVerifying(false);
    };
    checkSession();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError("As senhas não coincidem.");
    if (password.length < 8) return setError("A senha deve ter no mínimo 8 caracteres.");

    setLoading(true);
    setError(null);

    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      
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

  if (isVerifying) {
    return (
      <div className="fixed inset-0 bg-[#09090b] flex flex-col items-center justify-center">
        <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-4 text-[10px] font-black text-primary uppercase tracking-[0.3em]">Validando Acesso...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] animate-in fade-in">
      <header className="p-8 flex justify-center"><Logo size="lg" /></header>
      <main className="flex-1 flex flex-col px-8 pb-12 max-w-sm mx-auto w-full justify-center">
        <div className="space-y-10">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Nova <span className="text-primary">Senha</span></h1>
            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest leading-relaxed">Crie uma credencial institucional segura.</p>
          </div>

          {success ? (
            <div className="p-10 bg-primary/5 rounded-[3rem] border border-primary/20 text-center animate-in zoom-in">
              <span className="material-symbols-outlined text-primary text-5xl mb-4">verified</span>
              <p className="text-xs font-black uppercase text-zinc-900 dark:text-white">Senha Alterada com Sucesso!</p>
              <p className="text-[9px] text-zinc-400 mt-2">Redirecionando para login...</p>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-8">
              {error && <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-black text-red-500 text-center">{error}</div>}
              <div className="space-y-4">
                <input required type="password" placeholder="NOVA SENHA" value={password} onChange={e => setPassword(e.target.value)} className="w-full h-18 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-2xl px-6 font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                <input required type="password" placeholder="CONFIRMAR NOVA SENHA" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full h-18 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-2xl px-6 font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
              </div>
              <button disabled={loading} className="w-full h-20 bg-primary text-white font-black rounded-[2rem] shadow-2xl shadow-primary/30 uppercase text-[11px] tracking-widest">
                {loading ? "Processando..." : "Redefinir Senha Institucional"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;
