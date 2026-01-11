import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';

// Desenvolvido por Viktor Casado
// Projeto SIGEA – Sistema Institucional

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        // Ensure we have a session (user clicked email link)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                setMsg({ type: 'error', text: 'Link inválido ou expirado.' });
            }
        });
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password: password });
        setLoading(false);

        if (error) {
            setMsg({ type: 'error', text: 'Erro ao atualizar senha.' });
        } else {
            setMsg({ type: 'success', text: 'Senha atualizada com sucesso!' });
            setTimeout(() => navigate('/dashboard'), 2000);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[hsl(var(--color-background))]">
            <div className="glass-panel p-8 w-full max-w-md space-y-6">
                <h1 className="text-2xl font-bold text-center">Nova Senha</h1>

                {msg && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {msg.type === 'success' ? <CheckCircle /> : <AlertCircle />}
                        <span>{msg.text}</span>
                    </div>
                )}

                <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold ml-1">Digite sua nova senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 text-[hsl(var(--color-text-muted))]" size={18} />
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="pl-10 h-12 bg-white/50 border-white/10 w-full rounded-xl"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary h-12 font-bold"
                    >
                        {loading ? 'Salvando...' : 'DEFINIR SENHA'}
                    </button>
                </form>
            </div>
        </div>
    );
}
