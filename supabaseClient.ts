
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL: string = 'https://zefvlzfkqsxhzjtwmtmj.supabase.co';
const SUPABASE_ANON_KEY: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplZnZsemZrcXN4aHpqdHdtdG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczOTIxMDIsImV4cCI6MjA4Mjk2ODEwMn0.daGEMLoPXLOMX9yQXdgwW8USESHqegPAJ-6cmKx8JTk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'sigea-auth-session-v4'
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
    console.error("Erro no Upload Storage:", error);
    if (error.message === 'Failed to fetch' || error.name === 'TypeError' || !navigator.onLine) {
      throw new Error('NETWORK_ERROR');
    }
    throw error;
  }
};

export const handleSupabaseError = (error: any): string => {
  if (!error) return 'Ocorreu um erro inesperado.';
  
  const msg = error.message?.toLowerCase() || '';
  
  // Captura agressiva de qualquer erro de rede ou falha de fetch
  if (
    msg.includes('failed to fetch') || 
    msg.includes('network error') || 
    msg.includes('load failed') ||
    error.name === 'TypeError' ||
    error.message === 'NETWORK_ERROR' ||
    !navigator.onLine
  ) {
    return 'Falha na conexão com o servidor. Suas alterações foram salvas localmente e serão sincronizadas depois.';
  }
  
  if (msg.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (msg.includes('user already registered')) return 'Este e-mail já possui um cadastro ativo.';
  if (msg.includes('payload too large')) return 'A imagem é muito grande (máx 5MB).';
  
  return error.message || 'Erro ao processar solicitação.';
};
