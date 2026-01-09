
'use client';

import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) throw authError;

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white font-sans transition-colors duration-500">
      <main className="flex-1 flex flex-col px-8 pb-12 max-w-sm mx-auto w-full justify-center space-y-12">
        <header className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-3xl font-black tracking-tighter uppercase leading-none">
              SI<span className="text-[#10b981]">GEA</span>
            </span>
          </div>
          <h1 className="text-[44px] font-black tracking-tighter uppercase leading-none">Login</h1>
          <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 leading-relaxed uppercase tracking-tight max-w-[280px]">
            Acesse o portal institucional SIGEA para gerenciar seus eventos acadêmicos.
          </p>
        </header>

        <form onSubmit={handleLogin} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          {error && (
            <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-black text-red-500 text-center">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">E-mail Institucional</label>
              <input 
                required 
                type="email" 
                placeholder="nome@ifal.edu.br" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-18 px-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-3xl text-sm font-bold outline-none focus:ring-4 focus:ring-[#10b981]/10 transition-all"
              />
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
              <input 
                required 
                type="password" 
                placeholder="********" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-18 px-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-3xl text-sm font-bold outline-none focus:ring-4 focus:ring-[#10b981]/10 transition-all"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full h-20 bg-[#10b981] text-white font-black rounded-Apple shadow-2xl shadow-[#10b981]/30 flex items-center justify-center uppercase text-[11px] tracking-[0.25em] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? <div className="size-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Entrar no Sistema'}
          </button>
        </form>

        <footer className="text-center pt-10 space-y-6 animate-in fade-in duration-1000 delay-300">
          <Link href="/forgot-password" title="Recuperar senha">
            <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest hover:text-[#10b981] transition-colors">
              Esqueceu a senha?
            </span>
          </Link>
          <div className="pt-4">
            <Link href="/register">
              <span className="text-[11px] font-black text-[#10b981] uppercase tracking-[0.15em]">
                Não possui acesso? Cadastre-se
              </span>
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
