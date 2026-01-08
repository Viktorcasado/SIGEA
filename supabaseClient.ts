
import { createClient } from '@supabase/supabase-js';

// URL do projeto Supabase (Substituir pela URL de produção do SIGEA se necessário)
const SUPABASE_URL: string = 'https://zefvlzfkqsxhzjtwmtmj.supabase.co';
const SUPABASE_ANON_KEY: string = 'sb_publishable_892zJn1mhm1ekEpzJ5JKYA_XhgNTWdu';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'sigea-auth-token',
    flowType: 'pkce', // Mais seguro para fluxos mobile/web modernos
  },
  global: {
    headers: { 'x-application-name': 'sigea-ifal' },
  }
});

export const isSupabaseConfigured = (): boolean => {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY && !SUPABASE_URL.includes('your-');
};

/**
 * Diagnóstico avançado de erros de rede para o SIGEA
 */
export const handleSupabaseError = (error: any): string => {
  if (!error) return 'Erro desconhecido.';
  
  const msg = error.message || error.error_description || 'Erro de comunicação com o servidor.';
  const lowerMsg = msg.toLowerCase();
  
  // Detecção específica de falhas de rede (Comum em Mobile/Emulator)
  if (
    lowerMsg.includes('failed to fetch') || 
    lowerMsg.includes('network error') || 
    lowerMsg.includes('load failed') ||
    error.name === 'TypeError'
  ) {
    console.error('CRITICAL NETWORK ERROR:', error);
    return 'Falha de Conexão: O app não conseguiu alcançar o servidor SIGEA. Verifique se você está conectado à internet ou se há bloqueios de firewall na rede do IFAL.';
  }

  // Erros de autenticação
  if (lowerMsg.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (lowerMsg.includes('email not confirmed')) return 'Por favor, confirme seu e-mail institucional.';
  if (lowerMsg.includes('too many requests')) return 'Muitas tentativas. Aguarde alguns minutos.';

  return msg;
};
