import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { User } from '../types';

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  updateUserContext: (updatedData: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // This function is now the single source of truth for fetching or creating a user profile.
  const fetchUserProfile = useCallback(async (authUser: any) => {
    setError(null);
    // If there's no authenticated user, we set the user state to null and stop.
    if (!authUser) {
      setUser(null);
      setLoading(false);
      return;
    }
    const userId = authUser.id;

    try {
      // 1. Attempt to fetch the user's profile from the database using maybeSingle().
      // This is resilient: it returns null data instead of an error if the profile doesn't exist.
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('id, full_name, campus, avatar_url, user_type, registration_number')
        .eq('id', userId)
        .maybeSingle();
      
      if (fetchError) {
        throw fetchError;
      }

      // 2. If a profile exists, we use it.
      if (profile) {
        // Apply cache-busting to the avatar URL to ensure freshness on load
        if (profile.avatar_url) {
          profile.avatar_url = `${profile.avatar_url}?v=${Date.now()}`;
        }
        setUser(profile);
      } else {
        // 3. If no profile exists (it's a new user), we create their profile.
        console.log(`Perfil novo. Criando entrada para o usuário ${userId}.`);
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({ 
              id: userId, 
              full_name: authUser.user_metadata?.full_name || 'Novo Usuário', 
              campus: 'Maceió', 
              avatar_url: null,
              user_type: 'aluno', // Default value
              registration_number: '' // Default value
          })
          .select()
          .single(); // .single() is fine here because we expect it to be created.
        
        if (insertError) {
          throw insertError;
        }
        setUser(newProfile);
      }
    } catch (error: any) {
        setUser(null);
        let userFacingError = 'Ocorreu um problema ao carregar seu perfil. Tente novamente.';

        // A) Network Error
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            userFacingError = "Erro de conexão: Verifique sua internet ou as configurações de CORS no Supabase.";
            console.error(`[SIGEA DEBUG] Network Error: ${userFacingError}`, error);
            setError(userFacingError);
            return; // Early exit
        }

        // B) Supabase API Error Logging
        console.error('[SIGEA DEBUG] Supabase API Error ao buscar/criar perfil:', {
            message: error.message,
            details: error.details,
            code: error.code,
        });

        // C) Specific RLS Hints
        if (error.message.includes('violates row-level security policy')) {
            console.error('[SIGEA DEBUG] DICA: Este erro geralmente ocorre por causa das Políticas de RLS (Row Level Security) na sua tabela "profiles". Verifique se a política de INSERT/UPDATE permite que um usuário autenticado (`auth.uid()`) crie/modifique sua própria linha (ex: `USING (auth.uid() = id)`).');
            userFacingError = "Não foi possível criar ou atualizar seu perfil de usuário devido a restrições de permissão.";
        } else if (error.code === '42501') { // permission denied, often on SELECT
            console.error('[SIGEA DEBUG] DICA: Este erro (permission denied) geralmente ocorre por causa das Políticas de RLS (Row Level Security). Verifique se a política de SELECT na tabela "profiles" permite que um usuário autenticado (`auth.uid()`) leia sua própria linha (ex: `USING (auth.uid() = id)`).');
            userFacingError = "Você não tem permissão para acessar os dados do seu perfil. Contate o suporte.";
        }
        
        // D) Set user-facing error if it's not a simple "not found" case
        if (error.code !== 'PGRST116') {
            setError(userFacingError);
        }
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    
    // Check the session on initial load.
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchUserProfile(session?.user ?? null);
    });

    // Listen for auth state changes (login, logout).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUserProfile(session?.user ?? null);
    });

    // Cleanup subscription on unmount.
    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchUserProfile]);

  const updateUserContext = useCallback((updatedData: Partial<User>) => {
    setUser(currentUser => currentUser ? { ...currentUser, ...updatedData } : null);
  }, []);

  const value = useMemo(() => ({ user, loading, error, updateUserContext }), [user, loading, error, updateUserContext]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};