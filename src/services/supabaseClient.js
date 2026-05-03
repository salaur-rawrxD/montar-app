import { createClient } from '@supabase/supabase-js';

// Accept either VITE_ or NEXT_PUBLIC_ prefix so the same .env.local works
// across Vite (this project) and any future Next.js layer.
const url = import.meta.env.VITE_SUPABASE_URL
         || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;

const key = import.meta.env.VITE_SUPABASE_ANON_KEY
         || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
         || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Returns null when credentials are absent — callers must check before using.
export const supabase = (url && key) ? createClient(url, key) : null;

export const isSupabaseEnabled = () => supabase !== null;
