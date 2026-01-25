import { createClient } from '@supabase/supabase-js';

// Connection configured with your Supabase project keys.
const supabaseUrl = 'https://zefvlzfkqsxhzjtwmtmj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplZnZsemZrcXN4aHpqdHdtdG1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzM5MjEwMiwiZXhwIjoyMDgyOTY4MTAyfQ.fp0b-wu5-CiknPXaU3aojO1RA48ViR5rlkc_uUemfXU';

// Ensure URL and Key are not empty (as per user request)
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key are required.");
}

console.log("Conectando ao Supabase..."); // Debug log as requested

export const supabase = createClient(supabaseUrl, supabaseAnonKey);