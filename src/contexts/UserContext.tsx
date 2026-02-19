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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async (supabaseUser: SupabaseUser | null) => {
      if (supabaseUser) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();
        
        if (error) {
          console.error('Erro ao buscar perfil:', error);
          setUser(null);
        } else {
          setUser(profile as User);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      fetchSession(session?.user ?? null);
    });

    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
        fetchSession(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) throw error;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  useEffect(() => {
    const fetchSession = async (supabaseUser: SupabaseUser | null) => {
      if (supabaseUser) {
        await upsertProfile(supabaseUser);
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();
        
        if (error) {
          console.error('Erro ao buscar perfil:', error);
          setUser(null);
        } else {
          setUser(profile as User);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      fetchSession(session?.user ?? null);
    });

    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
        fetchSession(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const upsertProfile = async (supabaseUser: SupabaseUser) => {
    if (!supabaseUser) return;

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: supabaseUser.id,
        email: supabaseUser.email,
        nome: supabaseUser.user_metadata.full_name || supabaseUser.email,
        status: 'ativo_comunidade',
      }, { onConflict: 'id' });

    if (error) {
      console.error("Erro no upsert do perfil: ", error);
    }
  };

  return (
    <UserContext.Provider value={{ user, login, loginWithGoogle, logout, loading }}>
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
