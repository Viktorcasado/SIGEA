
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

export const handleSupabaseError = (error: any): string => {
  if (!error) return 'Erro desconhecido.';
  
  console.error('Database Detailed Error:', error);

  if (typeof error === 'string') return error;

  // Tenta extrair a mensagem de erro de diversas estruturas comuns do Supabase
  let message = '';
  
  if (error.message) message = error.message;
  else if (error.error_description) message = error.error_description;
  else if (error.msg) message = error.msg;
  else if (error.error && typeof error.error === 'string') message = error.error;
  else if (error.error && error.error.message) message = error.error.message;
  else if (typeof error === 'object') {
    try {
      // Se for um objeto sem as chaves acima, stringifica para depuração
      const str = JSON.stringify(error);
      message = str === '{}' ? 'Erro de estrutura de dados' : str;
    } catch {
      message = 'Erro de sistema indescritível';
    }
  }

  if (message.includes('failed to fetch') || message.includes('network')) {
    return 'Falha na conexão com o servidor do IFAL.';
  }

  if (message === '[object Object]') return 'O servidor retornou um erro inesperado. Tente novamente.';

  return message;
};
