"use client";

import { createContext, useState, useContext, ReactNode, FC, useEffect } from 'react';
import { User, UserStatus } from '@/src/types';
import { supabase } from '@/src/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface UserContextType {
  user: User | null;
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
  const [loading, setLoading] = useState(true);

  const deriveStatus = (userType: string | null, isOrganizer: boolean): UserStatus => {
    if (isOrganizer) return 'gestor';
    if (userType === 'aluno' || userType === 'servidor') return 'ativo_vinculado';
    return 'ativo_comunidade';
  };

  const fetchProfile = async (supabaseUser: SupabaseUser | null) => {
    try {
      if (supabaseUser) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .maybeSingle();
        
        if (error) {
          console.error('[UserContext] Erro ao buscar perfil:', error);
          setUser(null);
        } else if (!profile) {
           // Criar perfil se não existir (comum em logins sociais)
           const fullName = supabaseUser.user_metadata.full_name || supabaseUser.user_metadata.name || 'Usuário';
           const { data: newProfile, error: upsertError } = await supabase
            .from('profiles')
            .upsert({
              id: supabaseUser.id,
              full_name: fullName,
              user_type: 'comunidade_externa',
              avatar_url: supabaseUser.user_metadata.avatar_url || supabaseUser.user_metadata.picture
            })
            .select()
            .single();
           
           if (newProfile) {
             setUser({
               id: newProfile.id,
               nome: newProfile.full_name,
               email: supabaseUser.email || '',
               perfil: newProfile.user_type || 'comunidade_externa',
               status: 'ativo_comunidade',
               is_organizer: false,
               avatar_url: newProfile.avatar_url
             } as User);
           } else {
             console.error("[UserContext] Erro ao criar perfil automático:", upsertError);
             setUser(null);
           }
        } else {
          setUser({
            id: profile.id,
            nome: profile.full_name,
            email: supabaseUser.email || '',
            perfil: profile.user_type || 'comunidade_externa',
            status: deriveStatus(profile.user_type, profile.is_organizer || false),
            is_organizer: profile.is_organizer || false,
            campus: profile.campus,
            matricula: profile.registration_number,
            avatar_url: profile.avatar_url
          } as User);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("[UserContext] Erro crítico:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await fetchProfile(session?.user ?? null);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        fetchProfile(session?.user ?? null);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    if (error) throw error;
  };

  const loginWithGoogle = async () => {
    // Usando uma URL de redirecionamento limpa
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    const profileUpdates: any = {};
    if (updates.nome !== undefined) profileUpdates.full_name = updates.nome;
    if (updates.campus !== undefined) profileUpdates.campus = updates.campus;
    if (updates.matricula !== undefined) profileUpdates.registration_number = updates.matricula;
    if (updates.avatar_url !== undefined) profileUpdates.avatar_url = updates.avatar_url;
    if (updates.perfil !== undefined) profileUpdates.user_type = updates.perfil;
    if (updates.is_organizer !== undefined) profileUpdates.is_organizer = updates.is_organizer;

    const { error } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', user.id);
    
    if (error) throw error;
    
    const newUserType = updates.perfil !== undefined ? updates.perfil : user.perfil;
    const newIsOrganizer = updates.is_organizer !== undefined ? updates.is_organizer : user.is_organizer;
    
    setUser(prev => prev ? { 
      ...prev, 
      ...updates,
      status: deriveStatus(newUserType, newIsOrganizer)
    } : null);
  };

  return (
    <UserContext.Provider value={{ user, login, signUp, loginWithGoogle, logout, updateProfile, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) throw new Error('useUser must be used within a UserProvider');
  return context;
};