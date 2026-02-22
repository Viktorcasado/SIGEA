"use client";

import { createContext, useState, useContext, ReactNode, FC, useEffect } from 'react';
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

export const UserProvider: FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const deriveStatus = (userType: string | null, isOrganizer: boolean): UserStatus => {
    if (isOrganizer) return 'gestor';
    if (userType === 'aluno' || userType === 'servidor') return 'ativo_vinculado';
    return 'ativo_comunidade';
  };

  const fetchProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();
      
      if (profile) {
        setUser({
          id: profile.id,
          nome: profile.full_name || supabaseUser.user_metadata?.full_name || 'Usuário',
          nome_certificado: profile.certificate_full_name || profile.full_name || '',
          email: supabaseUser.email || '',
          perfil: profile.user_type || 'comunidade_externa',
          status: deriveStatus(profile.user_type, profile.is_organizer || false),
          is_organizer: profile.is_organizer || false,
          campus: profile.campus || '',
          matricula: profile.registration_number || '',
          avatar_url: profile.avatar_url || supabaseUser.user_metadata?.avatar_url || ''
        } as User);
      }
    } catch (err) {
      console.error("[UserContext] Erro ao buscar perfil:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      
      if (isMounted) {
        if (initialSession) {
          setSession(initialSession);
          setUser({
            id: initialSession.user.id,
            nome: initialSession.user.user_metadata?.full_name || 'Usuário',
            email: initialSession.user.email || '',
            perfil: 'comunidade_externa',
            status: 'ativo_comunidade',
            is_organizer: false,
            avatar_url: initialSession.user.user_metadata?.avatar_url || ''
          } as User);
          
          fetchProfile(initialSession.user);
        }
        setLoading(false);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (isMounted) {
        setSession(currentSession);
        if (currentSession) {
          setUser(prev => ({
            ...(prev || {}),
            id: currentSession.user.id,
            nome: currentSession.user.user_metadata?.full_name || prev?.nome || 'Usuário',
            email: currentSession.user.email || '',
            avatar_url: currentSession.user.user_metadata?.avatar_url || prev?.avatar_url || ''
          } as User));
          
          fetchProfile(currentSession.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const { error } = await supabase.from('profiles').update({
      full_name: updates.nome,
      certificate_full_name: updates.nome_certificado,
      campus: updates.campus,
      registration_number: updates.matricula,
      avatar_url: updates.avatar_url,
      user_type: updates.perfil,
      is_organizer: updates.is_organizer
    }).eq('id', user.id);
    if (error) throw error;
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