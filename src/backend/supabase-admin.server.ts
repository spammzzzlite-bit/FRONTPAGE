import { createClient } from "@supabase/supabase-js";
import process from "node:process";

/**
 * Creates and returns a Supabase client authorized with the Service Role Key.
 * Bypasses RLS constraints for Super Admin CRUD operations.
 * If the Service Role Key is not configured, falls back to the anonymous key with a warning.
 */
export function getSupabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error("Missing VITE_SUPABASE_URL environment variable.");
  }

  if (!serviceRoleKey) {
    console.warn(
      "WARNING: SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables. " +
        "Falling back to standard VITE_SUPABASE_ANON_KEY. Row Level Security (RLS) bypass will not be active.",
    );
    if (!anonKey) {
      throw new Error("Missing standard VITE_SUPABASE_ANON_KEY fallback variable.");
    }
    return createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
