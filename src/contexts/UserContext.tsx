import { createContext, useState, useContext, ReactNode, FC, useEffect } from 'react';
import { User } from '@/src/types';
import { supabase } from '@/src/services/supabase';
import { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js';

interface UserContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentProfile = async (supabaseUser: SupabaseUser) => {
    if (!supabase) return null;
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }

      if (!profile) return null;
      
      return {
        id: profile.id,
        email: supabaseUser.email,
        nome: profile.full_name || 'Usuário',
        campus: profile.campus,
        avatar_url: profile.avatar_url,
        perfil: profile.user_type || 'comunidade_externa',
        status: profile.user_type === 'gestor' ? 'gestor' : 'ativo_comunidade',
        matricula: profile.registration_number
      } as User;
    } catch (error) {
      console.error('Erro inesperado ao buscar perfil:', error);
      return null;
    }
  };

  const refreshUser = async () => {
    if (!supabase) return;
    try {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (supabaseUser) {
        const profile = await fetchCurrentProfile(supabaseUser);
        setUser(profile);
      }
    } catch (err) {
      console.error("Erro ao atualizar usuário:", err);
    }
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const handleAuthChange = async (event: AuthChangeEvent, session: Session | null) => {
      try {
        const supabaseUser = session?.user ?? null;
        if (supabaseUser) {
          const profile = await fetchCurrentProfile(supabaseUser);
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Erro na mudança de auth:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Configura o listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Busca a sessão inicial
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        handleAuthChange('INITIAL_SESSION', session);
      })
      .catch((err) => {
        console.error("Erro ao buscar sessão inicial:", err);
        setLoading(false);
      });

    // Timeout de segurança para garantir que o loading saia após 5 segundos
    const timeout = setTimeout(() => setLoading(false), 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const login = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase client não inicializado.');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const loginWithGoogle = async () => {
    if (!supabase) throw new Error('Supabase client não inicializado.');
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
  };

  const logout = async () => {
    if (!supabase) throw new Error('Supabase client não inicializado.');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, loginWithGoogle, logout, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};