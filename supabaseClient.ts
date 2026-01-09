
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

/**
 * Fix: Added isSupabaseConfigured export to handle environment check
 * in several pages (Registration, ParticipantsAdmin, ManageEvent).
 */
export const isSupabaseConfigured = () => {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY && !SUPABASE_URL.includes('your-project');
};

/**
 * Realiza o upload de arquivos para o Supabase Storage.
 * Força o refresh da sessão para garantir que o JWT está ativo.
 */
export const uploadFile = async (bucket: string, path: string, file: File) => {
  // Passo 1: Forçar atualização da sessão antes de qualquer operação de escrita
  const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
  
  if (sessionError || !session) {
    throw new Error('Sessão expirada. Por favor, saia e entre novamente no aplicativo para renovar suas permissões.');
  }

  // Passo 2: Executar upload com tratamento de erro específico
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    cacheControl: '3600'
  });

  if (error) {
    console.error("Storage Error:", error);
    if (error.message.includes('Payload Too Large')) throw new Error('A imagem é muito grande. O limite é 5MB.');
    if (error.message.includes('Duplicate')) throw new Error('Já existe um arquivo com este nome. Tente novamente.');
    if (error.status === 403) throw new Error('Erro de Permissão: Verifique se você está logado corretamente.');
    throw error;
  }

  // Passo 3: Retornar URL pública
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrl;
};

export const handleSupabaseError = (error: any): string => {
  if (!error) return 'Ocorreu um erro inesperado.';
  console.error("Supabase Debug:", error);
  
  const msg = error.message?.toLowerCase() || '';
  
  if (msg.includes('fetch') || msg.includes('network')) return 'Falha na conexão: O servidor do SIGEA está temporariamente inacessível. Verifique sua internet.';
  if (msg.includes('jwt') || msg.includes('expired')) return 'Sua sessão expirou por segurança. Por favor, faça login novamente.';
  if (msg.includes('storage')) return 'Erro no armazenamento de arquivos: ' + error.message;
  if (msg.includes('permission')) return 'Você não tem permissão para realizar esta alteração.';
  
  return error.message || 'Erro na comunicação com o portal institucional.';
};
