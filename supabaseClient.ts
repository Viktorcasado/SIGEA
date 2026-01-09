
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL: string = 'https://zefvlzfkqsxhzjtwmtmj.supabase.co';
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

export const isSupabaseConfigured = () => {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY && !SUPABASE_URL.includes('your-project');
};

export const uploadFile = async (bucket: string, path: string, file: File) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Sessão não encontrada. Por favor, faça login novamente.');
    }

    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: true,
      cacheControl: '3600'
    });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl;
  } catch (error: any) {
    console.error("Storage Error:", error);
    throw error;
  }
};

export const handleSupabaseError = (error: any): string => {
  if (!error) return 'Ocorreu um erro inesperado.';
  console.error("Supabase Debug:", error);
  
  const msg = error.message?.toLowerCase() || '';
  const status = error.status || error.statusCode;

  if (status === 413 || msg.includes('large')) return 'A imagem é muito grande para o servidor. Tente uma foto menor (máx 2MB).';
  if (status === 403 || status === 401) return 'Sua sessão expirou ou você não tem permissão. Tente sair e entrar novamente.';
  if (msg.includes('fetch') || msg.includes('network')) return 'Erro de Conexão: O servidor não respondeu. Verifique seu Wi-Fi ou dados móveis.';
  
  return error.message || 'Erro na comunicação com o portal institucional.';
};
