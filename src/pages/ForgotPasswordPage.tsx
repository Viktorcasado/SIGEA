import React, { useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Desenvolvido por Viktor Casado
// Projeto SIGEA – Sistema Institucional

export default function ForgotPasswordPage() {
    const { resetPassword } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await resetPassword(email);
        setLoading(false);

        if (error) {
            setStatus('error');
        } else {
            setStatus('success');
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[hsl(var(--color-background))]">
            <div className="glass-panel p-8 w-full max-w-md space-y-6">
                <button onClick={() => navigate(-1)} className="flex items-center text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] transition-colors">
                    <ArrowLeft className="mr-2" size={20} />
                    Voltar ao Login
                </button>

                <h1 className="text-2xl font-bold text-[hsl(var(--color-primary))]">Recuperar Senha</h1>
                <p className="text-sm text-[hsl(var(--color-text-muted))]">
                    Informe seu email institucional para receber o link de redefinição.
                </p>

                {status === 'success' ? (
                    <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-xl flex flex-col items-center text-center space-y-4 animate-fade-in">
                        <CheckCircle className="text-green-500 h-12 w-12" />
                        <p className="text-green-700 font-medium">Email enviado com sucesso!</p>
                        <p className="text-sm text-green-600">Verifique sua caixa de entrada e spam. O link expira em 1 hora.</p>
                        <button onClick={() => navigate('/')} className="btn-primary w-full mt-4">Voltar ao Login</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 text-[hsl(var(--color-text-muted))]" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu.email@ifal.edu.br"
                                    className="pl-10 h-12 bg-white/50 border-white/10 w-full rounded-xl"
                                />
                            </div>
                        </div>

                        {status === 'error' && (
                            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                                <AlertCircle size={16} />
                                <span>Erro ao enviar email. Verifique o endereço.</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary h-12 font-bold"
                        >
                            {loading ? 'Enviando...' : 'ENVIAR LINK'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
