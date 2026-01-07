
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL: string = 'https://zefvlzfkqsxhzjtwmtmj.supabase.co';
// Utilizando a chave pública (publishable) fornecida pelo usuário
const SUPABASE_ANON_KEY: string = 'sb_publishable_892zJn1mhm1ekEpzJ5JKYA_XhgNTWdu';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'sigea-auth-token'
  }
});

export const isSupabaseConfigured = (): boolean => {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY && !SUPABASE_URL.includes('your-');
};

export const handleSupabaseError = (error: any): string => {
  if (!error) return 'Erro desconhecido.';
  
  const msg = typeof error === 'string' 
    ? error 
    : (error.message || error.error_description || error.error?.message || 'Erro de comunicação');
  
  if (msg.includes('Auth session missing') || msg.includes('session_missing') || msg.includes('JWT')) {
    return 'Sessão expirada. Por favor, faça login novamente.';
  }

  // Detecção robusta de falhas de rede (CORS, offline, DNS)
  const isNetworkFailure = 
    msg.toLowerCase().includes('failed to fetch') || 
    msg.toLowerCase().includes('network') ||
    msg.toLowerCase().includes('load failed') ||
    msg.toLowerCase().includes('cors') ||
    error?.name === 'TypeError' ||
    error?.name === 'NetworkError';

  if (isNetworkFailure) {
    console.error('Falha de Rede SIGEA:', msg);
    return 'Erro de Conexão: O servidor SIGEA não pôde ser alcançado. Verifique sua conexão com a internet.';
  }

  const code = error?.code || (error?.error && error?.error.code) || '';

  if (code === 'PGRST204') return 'Nenhum dado disponível no momento.';
  if (code === '42501') return 'Permissão negada no banco de dados.';
  
  return msg;
};
