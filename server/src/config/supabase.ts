// ============================================================================
// Supabase Admin Client — Server-side Supabase client with service role key
// ============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

let supabaseAdmin: SupabaseClient | null = null;

/**
 * Returns the Supabase admin client (service role).
 * Uses service key for full database access (bypasses RLS).
 * Lazily initialized to avoid errors if credentials are not yet configured.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
      throw new Error(
        'Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env'
      );
    }
    supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseAdmin;
}

/**
 * Creates a Supabase client with a user's JWT for RLS-aware queries.
 */
export function getSupabaseClient(accessToken: string): SupabaseClient {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new Error(
      'Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env'
    );
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
