"use client";

import { createContext, useState, useContext, ReactNode, FC, useEffect, useCallback } from 'react';
import { User, UserStatus } from '@/src/types';
import { supabase } from '@/src/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface UserContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata: any) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const deriveStatus = (userType: string | null, isOrganizer: boolean): UserStatus => {
  if (isOrganizer) return 'gestor';
  if (userType === 'aluno' || userType === 'servidor') return 'ativo_vinculado';
  return 'ativo_comunidade';
};

export const UserProvider: FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();
      
      if (profile && !error) {
        setUser({
          id: profile.id,
          nome: profile.full_name || supabaseUser.user_metadata?.full_name || 'Usuário',
          username: profile.full_name?.split(' ')[0].toLowerCase() || supabaseUser.email?.split('@')[0] || 'user',
          email: supabaseUser.email || '',
          perfil: profile.user_type || 'comunidade_externa',
          status: deriveStatus(profile.user_type, profile.is_organizer || false),
          is_organizer: profile.is_organizer || false,
          campus: profile.campus || '',
          matricula: profile.registration_number || '',
          avatar_url: profile.avatar_url || ''
        } as User);
      } else {
        setUser({
          id: supabaseUser.id,
          nome: supabaseUser.user_metadata?.full_name || 'Usuário',
          email: supabaseUser.email || '',
          perfil: 'comunidade_externa',
          status: 'ativo_comunidade',
          is_organizer: false,
          username: supabaseUser.email?.split('@')[0] || 'user'
        } as User);
      }
    } catch (err) {
      console.error("[UserContext] Erro ao buscar perfil:", err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Escuta mudanças de autenticação (inclui o estado inicial)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;
      
      setSession(currentSession);
      if (currentSession) {
        await fetchProfile(currentSession.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    });
    if (error) throw error;
  };

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
  };

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (err) {
      console.error("[UserContext] Erro no logout:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    const payload: any = {};
    if (updates.nome !== undefined) payload.full_name = updates.nome;
    if (updates.campus !== undefined) payload.campus = updates.campus;
    if (updates.matricula !== undefined) payload.registration_number = updates.matricula;
    if (updates.avatar_url !== undefined) payload.avatar_url = updates.avatar_url;
    if (updates.perfil !== undefined) payload.user_type = updates.perfil;
    if (updates.is_organizer !== undefined) payload.is_organizer = updates.is_organizer;

    const { error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', user.id);

    if (error) throw error;
    
    // Atualiza o estado local após o sucesso no banco
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  return (
    <UserContext.Provider value={{ user, session, login, signUp, loginWithGoogle, logout, updateProfile, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) throw new Error('useUser must be used within a UserProvider');
  return context;
};