
import { createClient } from '@supabase/supabase-js';

// URL do projeto Supabase vinculado ao IFAL
const SUPABASE_URL: string = 'https://zefvlzfkqsxhzjtwmtmj.supabase.co';

// Chave pública fornecida pelo usuário (JWT)
const SUPABASE_ANON_KEY: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplZnZsemZrcXN4aHpqdHdtdG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczOTIxMDIsImV4cCI6MjA4Mjk2ODEwMn0.daGEMLoPXLOMX9yQXdgwW8USESHqegPAJ-6cmKx8JTk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'sigea-auth-token',
    flowType: 'pkce',
  }
});

// Helper para Upload de Arquivos
export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    cacheControl: '3600'
  });
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrl;
};

// O sistema agora opera exclusivamente via Supabase
export const isSupabaseConfigured = (): boolean => true;

export const handleSupabaseError = (error: any): string => {
  if (!error) return 'Erro desconhecido.';
  
  const msg = error.message?.toLowerCase() || '';
  
  if (msg.includes('jwt') || msg.includes('api key') || msg.includes('malformed')) {
    return 'Erro de Autenticação: A chave API expirou ou é inválida. Verifique o painel do Supabase.';
  }
  
  if (msg.includes('fetch') || msg.includes('network')) {
    return 'Falha na conexão: Verifique sua internet ou o status do servidor Supabase.';
  }

  const errorMap: Record<string, string> = {
    'invalid login credentials': 'E-mail ou senha incorretos.',
    'user already registered': 'Este e-mail já possui cadastro.',
    'email not confirmed': 'Verifique seu e-mail para confirmar a conta.',
    'too many requests': 'Muitas tentativas. Aguarde um momento.',
  };

  for (const [key, value] of Object.entries(errorMap)) {
    if (msg.includes(key)) return value;
  }

  return error.message || 'Erro na comunicação com o servidor.';
};
