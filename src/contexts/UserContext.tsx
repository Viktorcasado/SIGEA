"use client";

import { createContext, useState, useContext, ReactNode, FC, useEffect, useCallback, useRef } from 'react';
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
  const isInitialMount = useRef(true);

  const fetchProfile = useCallback(async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();
      
      if (error) throw error;

      const basicUser: User = {
        id: supabaseUser.id,
        nome: profile?.full_name || supabaseUser.user_metadata?.full_name || 'Usuário',
        email: supabaseUser.email || '',
        avatar_url: profile?.avatar_url || supabaseUser.user_metadata?.avatar_url || '',
        perfil: profile?.user_type || 'comunidade_externa',
        status: deriveStatus(profile?.user_type, profile?.is_organizer || false),
        is_organizer: profile?.is_organizer || false,
        username: supabaseUser.email?.split('@')[0] || 'user',
        campus: profile?.campus || '',
        matricula: profile?.registration_number || ''
      };

      setUser(basicUser);
    } catch (err) {
      console.error("[UserContext] Erro ao buscar perfil:", err);
      setUser({
        id: supabaseUser.id,
        nome: supabaseUser.user_metadata?.full_name || 'Usuário',
        email: supabaseUser.email || '',
        perfil: 'comunidade_externa',
        status: 'ativo_comunidade',
        is_organizer: false
      } as User);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      if (!isInitialMount.current) return;
      isInitialMount.current = false;

      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (initialSession) {
          setSession(initialSession);
          await fetchProfile(initialSession.user);
        }
      } catch (error) {
        console.error("[UserContext] Erro na inicialização:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (currentSession) {
          setSession(currentSession);
          await fetchProfile(currentSession.user);
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    });
    if (error) {
      setLoading(false);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: { 
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    if (error) throw error;
  };

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } finally {
      setUser(null);
      setSession(null);
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const { error } = await supabase.from('profiles').update({
      full_name: updates.nome,
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