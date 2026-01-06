
import React, { useState } from 'react';
import Logo from '../components/Logo';
import { supabase } from '../supabaseClient';
import { logActivity } from '../utils/logger';

interface LoginProps {
  onLogin: (session?: any) => void;
}

type ViewState = 'login' | 'first-access';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [view, setView] = useState<ViewState>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('PARTICIPANT'); // Default role
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes('Email not confirmed')) {
          throw new Error('E-mail ainda não confirmado. Verifique sua caixa de entrada ou desative a confirmação no Painel do Supabase.');
        }
        throw authError;
      }
      if (data.session) {
        await logActivity(data.session.user.id, 'LOGIN', `Login realizado com sucesso via ${email}`);
      }
      onLogin(data.session);
    } catch (err: any) {
      console.error("Erro Auth:", err);
      setError(err.message || 'E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  const handleFirstAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          // Redireciona para a URL atual em vez de localhost
          emailRedirectTo: window.location.origin,
        }
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName,
          updated_at: new Date().toISOString(),
          role: role // Salva a role escolhida
        });
        await logActivity(data.user.id, 'PROFILE_UPDATE', 'Conta criada e perfil inicializado', { fullName });
      }

      setSuccess('Cadastro realizado! Se o link do e-mail der erro de "localhost", desative a confirmação de e-mail no Dashboard do Supabase (Auth > Settings).');

      // Se não houver necessidade de confirmação (estiver desativado no Supabase),
      // o usuário pode tentar logar imediatamente.
      setTimeout(() => setView('login'), 5000);
    } catch (err: any) {
      console.error("Erro no Cadastro:", err);
      setError(err.message || 'Erro ao realizar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark p-6 animate-in fade-in duration-500">
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full space-y-8">

        <div className="flex flex-col items-center space-y-4">
          <Logo className="h-12" />
          <div className="text-center">
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              {view === 'login' ? 'Portal do Participante' : 'Primeiro Acesso'}
            </h1>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              {view === 'login' ? 'Sistema de Gestão de Eventos • IFAL' : 'Crie sua conta no SIGEA'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-8 shadow-2xl border-2 border-slate-200 dark:border-slate-800 space-y-6 relative overflow-hidden">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-[10px] font-black uppercase text-center border border-red-100 animate-in shake duration-300">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 text-green-700 rounded-2xl text-[10px] font-black uppercase text-center border border-green-100 leading-relaxed">
              {success}
            </div>
          )}

          <form onSubmit={view === 'login' ? handleLoginSubmit : handleFirstAccessSubmit} className="space-y-4">
            {view === 'first-access' && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Nome Completo</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">person</span>
                  <input
                    required
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full p-4 pl-12 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-primary transition-all font-bold text-sm"
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>
            )}

            {view === 'first-access' && (
              <div className="space-y-2 animate-in slide-in-from-top-3">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Tipo de Conta</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('PARTICIPANT')}
                    className={`flex-1 p-3 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${role === 'PARTICIPANT' ? 'bg-blue-50 border-primary text-primary' : 'bg-white border-slate-200 text-slate-400'}`}
                  >
                    Aluno / Público
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('ORGANIZER')}
                    className={`flex-1 p-3 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${role === 'ORGANIZER' ? 'bg-blue-50 border-primary text-primary' : 'bg-white border-slate-200 text-slate-400'}`}
                  >
                    Organizador
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">E-mail Institucional</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">mail</span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-4 pl-12 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-primary transition-all font-bold text-sm"
                  placeholder="aluno@ifal.edu.br"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                {view === 'login' ? 'Sua Senha' : 'Crie uma Senha'}
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">lock</span>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full p-4 pl-12 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-primary transition-all font-bold text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 bg-primary hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-primary/30 uppercase tracking-widest text-xs transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin">sync</span>
              ) : (
                view === 'login' ? (
                  <>Entrar no Sistema <span className="material-symbols-outlined text-sm">login</span></>
                ) : (
                  <>Cadastrar no Portal <span className="material-symbols-outlined text-sm">how_to_reg</span></>
                )
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            {view === 'login' ? (
              <button
                onClick={() => setView('first-access')}
                className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
              >
                Primeiro acesso? Clique aqui para criar senha
              </button>
            ) : (
              <button
                onClick={() => setView('login')}
                className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:underline"
              >
                Já tem uma senha? Voltar para o login
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center pb-6">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">SIGEA • IFAL • v1.1.3</p>
      </div>
    </div>
  );
};

export default Login;
