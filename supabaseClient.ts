
import { createClient } from '@supabase/supabase-js';

// No navegador, process.env não existe nativamente.
// O shim no index.html garante que window.process.env exista.
const getSafeEnv = (key: string, defaultValue: string) => {
  try {
    // @ts-ignore
    const val = (window.process?.env?.[key]) || (typeof process !== 'undefined' ? process.env[key] : null);
    return val || defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const supabaseUrl = getSafeEnv('SUPABASE_URL', 'https://zefvlzfkqsxhzjtwmtmj.supabase.co');
const supabaseAnonKey = getSafeEnv('SUPABASE_ANON_KEY', 'sb_publishable_892zJn1mhm1ekEpzJ5JKYA_XhgNTWdu');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
