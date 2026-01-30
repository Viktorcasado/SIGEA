
import { createClient } from '@supabase/supabase-js';

// Tenta pegar as chaves do ambiente com fallback para as chaves do projeto atual
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zefvlzfkqsxhzjtwmtmj.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplZnZsemZrcXN4aHpqdHdtdG1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzM5MjEwMiwiZXhwIjoyMDgyOTY4MTAyfQ.fp0b-wu5-CiknPXaU3aojO1RA48ViR5rlkc_uUemfXU';

// VACINA: Validação de segurança para evitar tela branca catastrófica
const isConfigValid = supabaseUrl && !supabaseUrl.includes('sua-url') && !supabaseUrl.includes('placeholder');

if (!isConfigValid) {
  console.error('🚨 ERRO CRÍTICO: Chaves do Supabase não configuradas corretamente no .env!');
}

// Cria o cliente de forma segura. Se as chaves forem inválidas, usa um placeholder para evitar crash de inicialização.
export const supabase = isConfigValid
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder');

console.log(`[SIGEA] Supabase Client Status: ${isConfigValid ? 'Conectado ✅' : 'Modo Offline/Erro ⚠️'}`);
