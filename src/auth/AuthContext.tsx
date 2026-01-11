import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { Profile } from '@/types';

// Desenvolvido por Viktor Casado
// Projeto SIGEA – Sistema Institucional

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    signInWithEmail: (email: string, pass: string) => Promise<{ data: any; error: any }>;
    signInWithGovBr: () => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error: any }>;
    updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
    authError: string | null;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Mapeamento forçado para garantir consistência
const DEFAULT_PROFILE: Partial<Profile> = {
    campus: 'Reitoria',
    tipo_usuario: 'EXTERNO',
    papel: 'PARTICIPANT'
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);

    useEffect(() => {
        // Check initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setSession(session);
                setUser(session.user);
                syncProfile(session.user);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth State Change:', event);

            if (event === 'SIGNED_OUT') {
                setSession(null);
                setUser(null);
                setProfile(null);
                setLoading(false);
                return;
            }

            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                await syncProfile(session.user);
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const syncProfile = async (currentUser: User) => {
        try {
            // Busca perfil real no banco
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentUser.id)
                .single();

            if (data) {
                console.log('Perfil carregado:', data);
                setProfile(data as Profile);
            } else {
                console.warn('Perfil não encontrado no banco. Criando fallback...');

                // Dados do Auth
                const metaName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.name;
                const fallbackProfile: Partial<Profile> = {
                    id: currentUser.id,
                    email: currentUser.email!,
                    nome_completo: metaName || 'Usuário SIGEA',
                    ...DEFAULT_PROFILE
                };

                // Tenta inserir se não existir
                const { data: stringData, error: insertError } = await supabase
                    .from('profiles')
                    .upsert(fallbackProfile)
                    .select()
                    .single();

                if (stringData) {
                    setProfile(stringData as Profile);
                } else if (insertError) {
                    console.error("Erro crítico ao criar perfil:", insertError);
                    // Último recurso: estado local temporário para não bloquear login
                    setProfile(fallbackProfile as Profile);
                }
            }
        } catch (e) {
            console.error("Exceção no sync de perfil:", e);
        } finally {
            setLoading(false);
        }
    };

    const signInWithEmail = async (email: string, pass: string) => {
        setLoading(true);
        setAuthError(null);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: pass
        });

        if (error) {
            setAuthError('Credenciais inválidas. Verifique email e senha.');
            setLoading(false);
        }
        return { data, error };
    };

    const signInWithGovBr = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                queryParams: { access_type: 'offline', prompt: 'consent' },
                redirectTo: `${window.location.origin}/dashboard`
            }
        });
    };

    const signOut = async () => {
        setLoading(true);
        await supabase.auth.signOut();
        // Limpeza garantida
        setProfile(null);
        setUser(null);
        setSession(null);
        window.location.href = '/';
    };

    const resetPassword = async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        return { error };
    };

    const updateProfile = async (updates: Partial<Profile>) => {
        if (!user) return { error: 'No user' };

        // Optimistic UI Update
        setProfile(prev => prev ? { ...prev, ...updates } : null);

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);

        if (error) {
            console.error("Erro ao atualizar perfil:", error);
            // Revert sync force
            syncProfile(user);
        }
        return { error };
    };

    return (
        <AuthContext.Provider value={{
            session, user, profile, loading, authError,
            signInWithEmail, signInWithGovBr, signOut, resetPassword, updateProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
