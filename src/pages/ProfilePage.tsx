import React, { useState, useEffect } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { ArrowLeft, Save, Camera, UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Desenvolvido por Viktor Casado
// Projeto SIGEA – Sistema Institucional

const CAMPUS_LIST = [
    'Reitoria', 'Maceió', 'Satuba', 'Palmeira dos Índios', 'Arapiraca',
    'Penedo', 'Maragogi', 'Santana do Ipanema', 'Rio Largo', 'Coruripe',
    'Murici', 'São Miguel dos Campos', 'Piranhas', 'Viçosa', 'Batalha', 'Benedito Bentes'
];

export default function ProfilePage() {
    const { profile, updateProfile, signOut } = useAuth();
    const navigate = useNavigate();

    // Local state for editing
    const [name, setName] = useState('');
    const [campus, setCampus] = useState('');
    const [role, setRole] = useState('');
    const [photo, setPhoto] = useState('');
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (profile) {
            setName(profile.nome_completo || ''); // Usando nome da coluna correta
            setCampus(profile.campus || 'Reitoria');
            setRole(profile.tipo_usuario || 'EXTERNO');
            setPhoto(profile.foto_url || '');
        }
    }, [profile]);

    const handleSave = async () => {
        if (!profile) return;
        setLoading(true);
        setMsg(null);

        const updates = {
            nome_completo: name,
            campus: campus,
            tipo_usuario: role as any,
            foto_url: photo
        };

        const { error } = await updateProfile(updates);
        setLoading(false);

        if (error) {
            setMsg({ type: 'error', text: 'Erro ao salvar alterações.' });
        } else {
            setMsg({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8 pt-12 pb-24 md:pl-72 max-w-4xl mx-auto">
            <button onClick={() => navigate('/dashboard')} className="mb-6 flex items-center text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))]">
                <ArrowLeft className="mr-2" size={20} />
                Voltar
            </button>

            <h1 className="text-3xl font-bold mb-8">Editar Perfil</h1>

            <div className="glass-panel p-8 space-y-8">

                {/* Photo Upload Simulation */}
                <div className="flex flex-col items-center">
                    <div className="relative group cursor-pointer" onClick={() => {
                        const url = prompt("Cole a URL da sua foto (Host externo):", photo);
                        if (url) setPhoto(url);
                    }}>
                        <div className="h-28 w-28 rounded-full bg-gray-200 border-4 border-white shadow-sm overflow-hidden flex items-center justify-center relative">
                            {photo ? (
                                <img src={photo} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-3xl font-bold text-gray-400">{name?.charAt(0)}</span>
                            )}
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <UploadCloud className="text-white" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full text-white border-2 border-white shadow-md">
                            <Camera size={16} />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold ml-1">Nome Completo</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="glass-input p-3 w-full border rounded-xl bg-white/50 focus:bg-white transition-all"
                            placeholder="Seu nome completo"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold ml-1">Email (Institucional)</label>
                        <input
                            type="text"
                            value={profile?.email || ''}
                            disabled
                            className="p-3 w-full opacity-60 cursor-not-allowed bg-gray-100 rounded-xl border-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold ml-1">Campus / Unidade</label>
                            <select
                                value={campus}
                                onChange={e => setCampus(e.target.value)}
                                className="p-3 w-full border rounded-xl bg-white/50 focus:bg-white"
                            >
                                {CAMPUS_LIST.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold ml-1">Vínculo (Tipo de Usuário)</label>
                            <select
                                value={role}
                                onChange={e => setRole(e.target.value)}
                                className="p-3 w-full border rounded-xl bg-white/50 focus:bg-white"
                            >
                                <option value="ALUNO">Aluno</option>
                                <option value="SERVIDOR">Servidor</option>
                                <option value="PROFESSOR">Professor</option>
                                <option value="EXTERNO">Comunidade Externa</option>
                            </select>
                        </div>
                    </div>
                </div>

                {msg && (
                    <div className={`p-3 rounded-xl text-center font-medium text-sm ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {msg.text}
                    </div>
                )}

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full btn-primary flex items-center justify-center space-x-2 h-12"
                >
                    {loading ? <div className="animate-spin h-5 w-5 border-2 border-white/50 rounded-full border-t-white"></div> : (
                        <>
                            <Save size={18} />
                            <span>Salvar Alterações</span>
                        </>
                    )}
                </button>

                <div className="pt-8 border-t mt-4">
                    <button onClick={() => { signOut(); }} className="w-full text-red-500 font-medium hover:bg-red-50 p-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                        Sair da Conta
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-4">SIGEA v4.0.0 • IFAL</p>
                </div>

            </div>
        </div>
    );
}
