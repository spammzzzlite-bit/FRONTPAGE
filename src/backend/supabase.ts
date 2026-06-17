import { createClient } from "@supabase/supabase-js";

// Read Supabase environment variables configured in .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

/**
 * Global Supabase Client instance for executing Auth, Database queries,
 * and Realtime subscriptions from both client components and server functions.
 */
export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * TypeScript definitions mapping the structure of the Supabase PostgreSQL schema.
 * Ensure any updates in SUPABASE_SETUP.sql are reflected here for compile-time safety.
 */
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          picture: string | null;
          provider: "email" | "google" | "github";
          password_hash: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          picture?: string | null;
          provider: "email" | "google" | "github";
          password_hash?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          picture?: string | null;
          provider?: "email" | "google" | "github";
          password_hash?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
