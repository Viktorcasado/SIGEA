
import { createClient } from '@supabase/supabase-js';

/**
 * SCRIPT SQL PARA O SUPABASE (Execute no SQL Editor do seu painel):
 * 
 * -- Tabela de Locais
 * CREATE TABLE locations (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   event_id UUID REFERENCES events(id) ON DELETE CASCADE,
 *   title TEXT NOT NULL,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- Tabela de Atividades
 * CREATE TABLE activities (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   event_id UUID REFERENCES events(id) ON DELETE CASCADE,
 *   title TEXT NOT NULL,
 *   time TEXT NOT NULL,
 *   type TEXT NOT NULL,
 *   loc TEXT,
 *   icon TEXT DEFAULT 'event',
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- Tabela de Modelos de Certificados
 * CREATE TABLE certificate_templates (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   event_id UUID REFERENCES events(id) ON DELETE CASCADE,
 *   title TEXT NOT NULL,
 *   attribution TEXT NOT NULL,
 *   status TEXT DEFAULT 'Rascunho',
 *   config JSONB DEFAULT '{}',
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 */

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

export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    cacheControl: '3600'
  });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrl;
};

export const isSupabaseConfigured = (): boolean => true;

export const handleSupabaseError = (error: any): string => {
  if (!error) return 'Erro desconhecido.';
  const msg = error.message?.toLowerCase() || '';
  if (msg.includes('jwt') || msg.includes('api key') || msg.includes('malformed')) return 'Erro de Autenticação: A chave API expirou ou é inválida.';
  if (msg.includes('fetch') || msg.includes('network')) return 'Falha na conexão: Verifique sua internet.';
  return error.message || 'Erro na comunicação com o servidor.';
};
