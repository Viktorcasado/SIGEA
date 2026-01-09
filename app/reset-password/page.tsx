
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * CONFIGURAÇÃO INSTITUCIONAL DO SUPABASE
 * Baseado nas credenciais do SIGEA | IFAL
 */
const SUPABASE_URL = 'https://zefvlzfkqsxhzjtwmtmj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplZnZsemZrcXN4aHpqdHdtdG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczOTIxMDIsImV4cCI6MjA4Mjk2ODEwMn0.daGEMLoPXLOMX9yQXdgwW8USESHqegPAJ-6cmKx8JTk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  }
});

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // 1. Validação do tipo de fluxo via URL
    const type = searchParams.get('type');
    if (type && type !== 'recovery') {
      setError('Este link de acesso não é válido para a recuperação de senha.');
    }
    
    // 2. Verificação de sessão de recuperação
    const checkRecoverySession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Se não houver sessão e nem token na URL (hash ou query), o link pode estar quebrado
      const hasAuthData = window.location.hash.includes('access_token') || 
                          window.location.search.includes('code=');
                          
      if (!session && !hasAuthData) {
        console.warn("Nenhum dado de autenticação detectado na URL.");
      }
    };
    
    checkRecoverySession();
  }, [searchParams]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações de Negócio Institucional
    if (password.length < 8) {
      setError('A segurança institucional exige uma senha de no mínimo 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas digitadas não coincidem. Verifique a confirmação.');
      return;
    }

    setLoading(true);

    try {
      // Atualiza o usuário na sessão de recovery atual
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      setSuccess(true);
      
      // Redirecionamento seguro após confirmação visual
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'Falha na comunicação com o servidor de autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#09090b] transition-colors duration-500 font-sans">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header SIGEA */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
             <div className="flex items-center gap-2 select-none">
                <span className="font-[900] tracking-[-0.06em] text-[36px] leading-none text-slate-900 dark:text-white">
                  SI<span className="text-[#10b981]">GEA</span>
                </span>
                <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-2"></div>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instituto Federal</span>
                  <span className="text-[9px] font-bold text-[#10b981] uppercase tracking-tighter">Portal de Segurança</span>
                </div>
             </div>
          </div>
          
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
            Nova <span className="text-[#10b981]">Senha</span>
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-tight max-w-[300px] mx-auto leading-relaxed">
            Sua nova senha deve ser diferente das utilizadas anteriormente no sistema.
          </p>
        </div>

        {/* Card de Ação */}
        <div className="bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/5 relative overflow-hidden">
          {success ? (
            <div className="text-center py-6 animate-in zoom-in duration-500">
              <div className="size-24 bg-[#10b981]/10 rounded-[2rem] flex items-center justify-center text-[#10b981] mx-auto mb-8 shadow-inner ring-1 ring-[#10b981]/20">
                <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Senha Alterada!</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Redirecionando para o login institucional...</p>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-8">
              {error && (
                <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-black text-red-500 text-center animate-in shake leading-relaxed">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2 relative group">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Nova Senha de Acesso</label>
                  <div className="relative">
                    <input 
                      required
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full h-18 px-6 bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-white/5 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-[#10b981]/10 transition-all dark:text-white placeholder:text-slate-300 dark:placeholder:text-zinc-700"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#10b981] transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPassword ? 'visibility' : 'visibility_off'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2 relative group">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Confirmar Senha</label>
                  <input 
                    required
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full h-18 px-6 bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-white/5 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-[#10b981]/10 transition-all dark:text-white placeholder:text-slate-300 dark:placeholder:text-zinc-700"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full h-20 bg-[#10b981] text-white font-black rounded-Apple shadow-2xl shadow-[#10b981]/30 flex items-center justify-center gap-3 uppercase text-[11px] tracking-[0.25em] active:scale-95 transition-all disabled:opacity-50 mt-4"
              >
                {loading ? (
                  <div className="size-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Confirmar Alteração
                    <span className="material-symbols-outlined text-2xl">lock_reset</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Links de Suporte */}
        <div className="text-center pt-6">
           <button 
             onClick={() => router.push('/login')}
             className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-[#10b981] transition-colors"
           >
             Cancelar e Voltar ao Login
           </button>
        </div>
        
        <footer className="text-center pt-16 flex flex-col items-center gap-2 opacity-30">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] dark:text-white">IFAL • SIGEA 2025</p>
          <div className="flex items-center gap-4 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
            <span>SISTEMA HOMOLOGADO</span>
            <div className="size-1 bg-slate-300 rounded-full"></div>
            <span>CERTIFICADO SSL ATIVO</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#09090b]">
        <div className="size-12 border-4 border-[#10b981]/20 border-t-[#10b981] rounded-full animate-spin"></div>
        <p className="mt-6 text-[10px] font-black text-[#10b981] uppercase tracking-[0.4em]">Carregando Módulo...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
