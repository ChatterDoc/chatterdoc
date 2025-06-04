
import { createClient } from '@supabase/supabase-js';

// Environment variables should be prefixed with VITE_ for Vite projects
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if the keys are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials");
}

// Create Supabase client with explicit auth configuration
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
