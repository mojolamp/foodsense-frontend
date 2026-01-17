/**
 * Service Role Supabase Client
 *
 * This client uses the service role key for administrative operations
 * and bypasses Row Level Security (RLS) policies.
 *
 * ⚠️ WARNING: Only use in secure server-side contexts. Never expose to client.
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Create a Supabase client with service role privileges
 * @param serviceRoleKey Optional service role key (defaults to env var)
 * @returns Supabase client with admin privileges
 */
export function createServiceRoleClient(serviceRoleKey?: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }

  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }

  return createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
