
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
 * Realiza o upload de arquivos para o Supabase Storage.
 * Não redireciona o usuário em caso de erro.
 */
export const uploadFile = async (bucket: string, path: string, file: File) => {
  // Verifica se o usuário está logado antes de tentar o upload
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Sessão expirada ou usuário não autenticado. Por favor, faça login novamente.');
  }

  // Executa o upload
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    cacheControl: '3600'
  });

  if (error) {
    // Tratamento específico para erros conhecidos de Storage
    if (error.message.includes('Payload Too Large')) throw new Error('O arquivo é muito grande para os limites do servidor.');
    if (error.message.includes('Permission denied')) throw new Error('Você não tem permissão para salvar arquivos nesta pasta.');
    throw error;
  }

  // Recupera a URL pública após o sucesso
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrl;
};

export const isSupabaseConfigured = (): boolean => true;

export const handleSupabaseError = (error: any): string => {
  if (!error) return 'Erro desconhecido.';
  console.error("Supabase Error Details:", error);
  
  const msg = error.message?.toLowerCase() || '';
  if (msg.includes('jwt') || msg.includes('api key') || msg.includes('malformed')) return 'Erro de Autenticação: Sua chave de acesso expirou.';
  if (msg.includes('fetch') || msg.includes('network')) return 'Falha na conexão: Verifique sua internet.';
  if (msg.includes('storage')) return 'Erro no servidor de arquivos: ' + error.message;
  
  return error.message || 'Erro na comunicação com o servidor.';
};
