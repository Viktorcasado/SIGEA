
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL: string = 'https://zefvlzfkqsxhzjtwmtmj.supabase.co';
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
  if (!error) return 'Erro inesperado.';
  
  const msg = typeof error === 'string' 
    ? error 
    : (error.message || error.error_description || error.error?.message || 'Erro de comunicação');
  
  const lowerMsg = msg.toLowerCase();
  
  // Specific detection for network/fetch failures
  if (lowerMsg.includes('failed to fetch') || lowerMsg.includes('network') || lowerMsg.includes('load failed') || error?.name === 'TypeError') {
    console.warn('SIGEA: Falha de conexão detectada. Verifique se o projeto Supabase está pausado ou se há restrições de rede.');
    return 'Falha de Rede SIGEA: O servidor não pôde ser alcançado. Verifique sua conexão ou se o serviço está temporariamente indisponível.';
  }

  if (lowerMsg.includes('session missing') || lowerMsg.includes('jwt')) {
    return 'Sessão expirada. Faça login novamente.';
  }

  return msg;
};
