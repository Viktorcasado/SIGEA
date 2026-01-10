
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL: string = 'https://zefvlzfkqsxhzjtwmtmj.supabase.co';
const SUPABASE_ANON_KEY: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplZnZsemZrcXN4aHpqdHdtdG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczOTIxMDIsImV4cCI6MjA4Mjk2ODEwMn0.daGEMLoPXLOMX9yQXdgwW8USESHqegPAJ-6cmKx8JTk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'sigea-auth-session-v5',
    storage: window.localStorage
  },
  global: {
    headers: { 'x-application-name': 'sigea-ifal-official' }
  }
});

export const isSupabaseConfigured = (): boolean => {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY && SUPABASE_URL.startsWith('https://');
};

export const uploadFile = async (bucket: string, path: string, file: File) => {
  try {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: true,
      cacheControl: '3600'
    });

    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl;
  } catch (error: any) {
    if (error.message === 'Failed to fetch' || !navigator.onLine) {
      throw new Error('OFFLINE_ERROR');
    }
    throw error;
  }
};

export const handleSupabaseError = (error: any): string => {
  if (!error) return 'Erro desconhecido.';
  const msg = error.message?.toLowerCase() || '';
  
  if (msg.includes('failed to fetch') || msg.includes('network') || error.message === 'OFFLINE_ERROR') {
    return 'Conexão instável. Os dados serão sincronizados assim que a rede retornar.';
  }
  if (msg.includes('refresh_token_not_found') || msg.includes('invalid grant')) {
    return 'Sessão expirada. Por favor, realize um novo login.';
  }
  if (msg.includes('user already registered')) return 'Este e-mail já possui cadastro institucional.';
  
  return error.message || 'Erro ao processar requisição.';
};
