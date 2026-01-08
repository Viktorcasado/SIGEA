
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL: string = 'https://zefvlzfkqsxhzjtwmtmj.supabase.co';
const SUPABASE_ANON_KEY: string = 'sb_publishable_892zJn1mhm1ekEpzJ5JKYA_XhgNTWdu';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'sigea-auth-token',
    flowType: 'pkce',
  },
  global: {
    headers: { 'x-application-name': 'sigea-ifal-institucional' }
  }
});

export const isSupabaseConfigured = (): boolean => {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY && !SUPABASE_URL.includes('your-');
};

/**
 * Motor de Tradução de Erros SIGEA
 * Converte erros técnicos brutos em mensagens institucionais premium.
 */
export const handleSupabaseError = (error: any): string => {
  if (!error) return 'Ocorreu um erro inesperado no sistema institucional.';
  
  // Debug amigável no console
  console.group('%c 🛡️ SIGEA Security & API Handler ', 'background: #10b981; color: white; font-weight: bold; border-radius: 4px;');
  console.log('Error Type:', typeof error);
  console.error('Details:', error);
  console.groupEnd();

  // Tratamento de falha de rede (Failed to fetch)
  if (error.message === 'Failed to fetch' || (error.status === 0)) {
    return 'Falha na conexão com a Rede Federal. Verifique sua cobertura de internet ou VPN.';
  }

  // Mapeamento de Erros Comuns de Auth
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'E-mail ou senha institucionais incorretos.',
    'User already registered': 'Este e-mail já está vinculado a uma conta SIGEA.',
    'Email not confirmed': 'Por favor, confirme seu e-mail institucional na sua caixa de entrada.',
    'Password should be at least 6 characters': 'Sua senha deve conter pelo menos 6 caracteres por segurança.',
    'Invalid email': 'O formato do e-mail informado não é válido.',
    'User not found': 'Usuário não localizado em nossa base acadêmica.'
  };

  // Tenta extrair a mensagem de forma segura
  const rawMessage = error.message || (typeof error === 'string' ? error : '');
  
  if (rawMessage.includes('fetch')) {
     return 'Conexão interrompida. Tente novamente em alguns segundos.';
  }

  return errorMap[rawMessage] || rawMessage || 'Falha técnica temporária. Tente novamente.';
};
