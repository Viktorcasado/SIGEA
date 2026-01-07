
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL: string = 'https://zefvlzfkqsxhzjtwmtmj.supabase.co';
const SUPABASE_ANON_KEY: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplZnZsemZrcXN4aHpqdHdtdG1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzM5MjEwMiwiZXhwIjoyMDgyOTY4MTAyfQ.fp0b-wu5-CiknPXaU3aojO1RA48ViR5rlkc_uUemfXU';

// Cliente configurado com detecção automática e tratamento de erros
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'sigea-auth-token'
  },
  global: {
    headers: { 'x-application-name': 'sigea-ifal' }
  }
});

export const isSupabaseConfigured = (): boolean => {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY && !SUPABASE_URL.includes('your-');
};

export const handleSupabaseError = (error: any): string => {
  if (!error) return 'Erro desconhecido.';
  
  // Extração segura da mensagem de erro
  const msg = typeof error === 'string' 
    ? error 
    : (error.message || error.error_description || error.error?.message || 'Erro de comunicação');
  
  // Detecção de expiração de sessão
  if (msg.includes('Auth session missing') || msg.includes('session_missing') || msg.includes('JWT')) {
    return 'SESSION_EXPIRED';
  }

  // Detecção robusta de erro de rede (Failed to fetch)
  const networkErrorNames = ['TypeError', 'NetworkError', 'FetchError'];
  const isNetworkFailure = 
    networkErrorNames.some(name => error.name === name) || 
    msg.toLowerCase().includes('failed to fetch') || 
    msg.toLowerCase().includes('network') ||
    msg.toLowerCase().includes('load failed') ||
    msg.toLowerCase().includes('cors');

  if (isNetworkFailure) {
    return 'Falha de conexão: O servidor está inacessível. Verifique seu firewall ou use o Modo Visitante.';
  }

  const code = error.code || (error.error && error.error.code) || '';

  console.group('--- SIGEA Debug ---');
  console.error('Mensagem:', msg);
  console.error('Código:', code);
  console.groupEnd();

  if (code === 'PGRST204') return 'Banco de dados vazio ou em manutenção.';
  if (code === '42501') return 'Acesso negado às tabelas (RLS).';
  
  return msg;
};
