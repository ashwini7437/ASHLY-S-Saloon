import { createClient } from '@supabase/supabase-js';

const getSupabaseUrl = () => {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
  return `http://${hostname}:54321`;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || getSupabaseUrl();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase;

export const checkSupabaseConnection = async () => {
  if (typeof window === 'undefined') return false;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 200);
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    return res.ok;
  } catch (e) {
    clearTimeout(timeoutId);
    return false;
  }
};

