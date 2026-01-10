
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Validar se estamos no fluxo de recuperação correto
    const type = searchParams.get('type');
    if (type && type !== 'recovery') {
      setError('Este link não é válido para recuperação de senha.');
    }
  }, [searchParams]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('A nova senha deve ter no mínimo 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem. Verifique a confirmação.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white font-sans">
      <main className="flex-1 flex flex-col px-8 pb-12 max-w-sm mx-auto w-full justify-center space-y-12">
        <header className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex justify-center mb-6">
             <span className="font-black tracking-[-0.06em] text-3xl leading-none text-slate-900 dark:text-white uppercase">
               SI<span className="text-[#10b981]">GEA</span>
             </span>
          </div>
          <h1 className="text-3xl font-black text-center uppercase tracking-tighter">Nova <span className="text-[#10b981]">Senha</span></h1>
          <p className="text-sm font-medium text-center text-slate-500 dark:text-zinc-400 uppercase tracking-tight leading-relaxed">
            Crie uma senha forte para proteger seu acesso institucional.
          </p>
        </header>

        {success ? (
          <div className="p-10 bg-[#10b981]/5 border border-[#10b981]/20 rounded-[2.5rem] text-center space-y-6 animate-in zoom-in">
            <div className="size-20 bg-[#10b981] rounded-3xl flex items-center justify-center mx-auto shadow-xl">
              <span className="material-symbols-outlined text-white text-4xl">verified</span>
            </div>
            <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Senha atualizada! Redirecionando...</p>
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="w-full h-18 px-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-3xl text-sm font-bold outline-none focus:ring-4 focus:ring-[#10b981]/10 transition-all"
                />
              </div>

              <div className="space-y-2 group">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Confirmar Senha</label>
                <input 
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="********"
                  className="w-full h-18 px-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-3xl text-sm font-bold outline-none focus:ring-4 focus:ring-[#10b981]/10 transition-all"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full h-20 bg-[#10b981] text-white font-black rounded-Apple shadow-2xl shadow-[#10b981]/30 flex items-center justify-center uppercase text-[11px] tracking-[0.25em] active:scale-95 transition-all disabled:opacity-50 mt-4"
            >
              {loading ? <div className="size-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirmar Nova Senha'}
            </button>
          </form>
        )}

        <footer className="text-center pt-8 opacity-30 text-[9px] font-black uppercase tracking-[0.5em]">IFAL • SIGEA 2025</footer>
      </main>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="size-8 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
