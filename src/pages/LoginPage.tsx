import React, { useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { Lock, User as UserIcon, FileText, AlertCircle } from 'lucide-react';

// Desenvolvido por Viktor Casado
// Projeto SIGEA – Sistema Institucional

export default function LoginPage() {
    const { signInWithEmail, signInWithGovBr, authError } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await signInWithEmail(email, password);
        // Erros são tratados globalmente via authError, mas loading deve parar
        setLoading(false);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4"
            style={{
                background: `linear-gradient(135deg, hsl(var(--color-background)) 0%, hsl(var(--color-primary-light)) 100%)`
            }}>

            <div className="glass-panel p-8 w-full max-w-md flex flex-col items-center space-y-6 animate-fade-in border border-white/20 shadow-2xl">
                <div className="flex flex-col items-center">
                    <div className="h-24 w-24 rounded-2xl bg-white/20 flex items-center justify-center mb-4 shadow-inner backdrop-blur-md border border-white/10">
                        <FileText size={48} className="text-[hsl(var(--color-primary))]" />
                    </div>
                    <h1 className="text-3xl font-bold text-[hsl(var(--color-primary))] tracking-tight">SIGEA</h1>
                    <p className="text-sm font-medium text-[hsl(var(--color-text-muted))] mt-1 text-center">
                        Sistema Integrado de Gestão de<br />Eventos Acadêmicos
                    </p>
                </div>

                {authError && (
                    <div className="w-full bg-red-500/10 border border-red-500/20 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm">
                        <AlertCircle size={16} />
                        <span>{authError}</span>
                    </div>
                )}

                <form onSubmit={handleLogin} className="w-full space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-bold ml-1 text-[hsl(var(--color-text))]">Email ou CPF</label>
                        <div className="relative group">
                            <UserIcon className="absolute left-3 top-3.5 text-[hsl(var(--color-text-muted))] group-focus-within:text-[hsl(var(--color-primary))]" size={18} />
                            <input
                                type="email"
                                placeholder="nome@ifal.edu.br"
                                className="pl-10 h-12 bg-white/50 border-white/10 focus:bg-white/80 transition-all font-medium text-[hsl(var(--color-text))]"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold ml-1 text-[hsl(var(--color-text))]">Senha</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-3.5 text-[hsl(var(--color-text-muted))] group-focus-within:text-[hsl(var(--color-primary))]" size={18} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="pl-10 h-12 bg-white/50 border-white/10 focus:bg-white/80 transition-all font-medium text-[hsl(var(--color-text))]"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-xs px-1">
                        <a href="#" className="font-semibold text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] transition-colors">Primeiro Acesso?</a>
                        <button type="button" onClick={() => window.location.href = '/forgot-password'} className="font-bold text-[hsl(var(--color-primary-light))] hover:underline">Esqueci a senha</button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 btn-primary flex justify-center items-center shadow-lg hover:shadow-xl transition-all font-bold tracking-wide text-lg mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : 'ACESSAR SISTEMA'}
                    </button>
                </form>

                <div className="flex items-center w-full gap-4 my-2">
                    <div className="h-px bg-current opacity-10 flex-1"></div>
                    <span className="text-[10px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-widest">Login Institucional</span>
                    <div className="h-px bg-current opacity-10 flex-1"></div>
                </div>

                <button
                    onClick={signInWithGovBr}
                    className="w-full h-12 btn-glass flex items-center justify-center gap-3 hover:bg-white/40 transition-all group"
                >
                    <img src="https://www.gov.br/++theme++br.gov.portal/img/govbr-logo-large.png?v=2" alt="Gov.br" className="h-5 opacity-90 grayscale group-hover:grayscale-0 transition-all" />
                    <span className="font-bold text-[#1351B4]">Entrar com gov.br</span>
                </button>

            </div>

            <p className="fixed bottom-6 text-[10px] font-medium text-[hsl(var(--color-text)/0.5)]">
                Desenvolvido por Viktor Casado • Instituto Federal de Alagoas
            </p>
        </div>
    );
}
