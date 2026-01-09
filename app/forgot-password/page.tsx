
'use client';

import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClientComponentClient();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white font-sans transition-colors duration-500">
      <main className="flex-1 flex flex-col px-8 pb-12 max-w-sm mx-auto w-full justify-center space-y-12">
        <header className="space-y-4">
          <h1 className="text-[44px] font-black tracking-tighter uppercase leading-none">Reset</h1>
          <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 leading-relaxed uppercase tracking-tight">
            Insira seu e-mail institucional e enviaremos as instruções para criar uma nova senha.
          </p>
        </header>

        {success ? (
          <div className="space-y-10 animate-in zoom-in duration-500">
            <div className="p-8 bg-[#10b981]/5 border border-[#10b981]/20 rounded-[2.5rem] text-center">
              <span className="material-symbols-outlined text-[#10b981] text-5xl mb-4">mark_email_read</span>
              <p className="text-sm font-bold text-[#10b981] uppercase tracking-tight">E-mail enviado com sucesso!</p>
            </div>
            <Link href="/login" className="w-full flex justify-center text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">Voltar ao Login</Link>
          </div>
        ) : (
          <form onSubmit={handleResetRequest} className="space-y-10">
            {error && (
              <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-black text-red-500 text-center">
                {error}
              </div>
            )}

            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">E-mail Cadastrado</label>
              <input 
                required 
                type="email" 
                placeholder="nome@ifal.edu.br" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-18 px-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-3xl text-sm font-bold outline-none focus:ring-4 focus:ring-[#10b981]/10 transition-all"
              />
            </div>

            <button 
              disabled={loading}
              className="w-full h-20 bg-[#10b981] text-white font-black rounded-Apple shadow-2xl shadow-[#10b981]/30 flex items-center justify-center uppercase text-[11px] tracking-[0.25em] active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? <div className="size-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Enviar Instruções'}
            </button>
            
            <div className="text-center pt-4">
              <Link href="/login" className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Lembrei a senha, voltar</Link>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
