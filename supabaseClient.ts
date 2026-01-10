
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL: string = 'https://zefvlzfkqsxhzjtwmtmj.supabase.co';
const SUPABASE_ANON_KEY: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplZnZsemZrcXN4aHpqdHdtdG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczOTIxMDIsImV4cCI6MjA4Mjk2ODEwMn0.daGEMLoPXLOMX9yQXdgwW8USESHqegPAJ-6cmKx8JTk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'sigea_auth_v3',
  }
});

export const isSupabaseConfigured = (): boolean => {
  return !!SUPABASE_URL && SUPABASE_URL.startsWith('https://');
};

export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    cacheControl: '3600'
  });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrl;
};

export const handleSupabaseError = (error: any): string => {
  if (!error) return 'Erro desconhecido.';
  const msg = error.message?.toLowerCase() || '';
  if (msg.includes('failed to fetch')) return 'Sem conexão com o servidor Supabase.';
  if (msg.includes('invalid login')) return 'E-mail ou senha institucionais incorretos.';
  if (msg.includes('user already registered')) return 'E-mail já cadastrado no sistema.';
  return error.message;
};
