import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yydnhzyoeehkurbatgqi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'anon-key-placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
