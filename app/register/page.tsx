
'use client';

import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CAMPUS_LIST = [
  "IFAL - Campus Maceió", "IFAL - Campus Arapiraca", "IFAL - Campus Palmeira dos Índios",
  "IFAL - Campus Satuba", "IFAL - Campus Marechal Deodoro", "IFAL - Campus Santana do Ipanema"
];

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [campus, setCampus] = useState(CAMPUS_LIST[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { name, campus, role: 'PARTICIPANT' },
          emailRedirectTo: `${window.location.origin}/login`,
        }
      });

      if (authError) throw authError;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-white dark:bg-[#09090b] text-center">
        <div className="size-24 bg-[#10b981]/10 rounded-[2.5rem] flex items-center justify-center text-[#10b981] mb-8 animate-in zoom-in">
          <span className="material-symbols-outlined text-5xl">mail</span>
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tight mb-4">Verifique seu e-mail</h2>
        <p className="text-sm font-bold text-zinc-500 uppercase tracking-tight max-w-xs leading-relaxed">
          Enviamos um link de confirmação para o endereço informado. Verifique sua caixa de entrada.
        </p>
        <Link href="/login" className="mt-12 text-[11px] font-black text-[#10b981] uppercase tracking-[0.2em]">Voltar ao Login</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white font-sans overflow-y-auto no-scrollbar">
      <main className="flex-1 flex flex-col px-8 py-16 max-w-sm mx-auto w-full justify-center space-y-12">
        <header className="space-y-4">
          <h1 className="text-[44px] font-black tracking-tighter uppercase leading-none">Cadastro</h1>
          <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 leading-relaxed uppercase tracking-tight">
            Crie sua conta institucional para participar e organizar eventos.
          </p>
        </header>

        <form onSubmit={handleRegister} className="space-y-8">
          {error && (
            <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-black text-red-500 text-center">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Nome Completo</label>
              <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full h-18 px-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-3xl text-sm font-bold outline-none focus:ring-4 focus:ring-[#10b981]/10 transition-all uppercase" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">E-mail</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-18 px-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-3xl text-sm font-bold outline-none focus:ring-4 focus:ring-[#10b981]/10 transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Campus Oficial</label>
              <select value={campus} onChange={(e) => setCampus(e.target.value)} className="w-full h-18 px-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-3xl text-sm font-bold outline-none focus:ring-4 focus:ring-[#10b981]/10 transition-all appearance-none">
                {CAMPUS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Nova Senha</label>
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-18 px-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-3xl text-sm font-bold outline-none focus:ring-4 focus:ring-[#10b981]/10 transition-all" />
            </div>
          </div>

          <button disabled={loading} className="w-full h-20 bg-[#10b981] text-white font-black rounded-Apple shadow-2xl shadow-[#10b981]/30 flex items-center justify-center uppercase text-[11px] tracking-[0.25em] active:scale-95 transition-all disabled:opacity-50">
            {loading ? <div className="size-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Finalizar Cadastro'}
          </button>
        </form>

        <footer className="text-center">
          <Link href="/login">
            <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Já possui conta? Faça Login</span>
          </Link>
        </footer>
      </main>
    </div>
  );
}
