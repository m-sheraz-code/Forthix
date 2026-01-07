import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variable validation
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing SUPABASE_ANON_KEY environment variable');
}

/**
 * Public Supabase client - uses anon key
 * Safe for operations that respect RLS policies
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

/**
 * Admin Supabase client - uses service role key
 * Bypasses RLS - use only for admin operations
 * Returns null if service role key is not configured
 */
export const getAdminClient = (): SupabaseClient | null => {
  if (!supabaseServiceRoleKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not configured - admin operations unavailable');
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
};

/**
 * Create a Supabase client with a user's JWT token
 * Used for authenticated requests that respect RLS
 */
export const createAuthenticatedClient = (accessToken: string): SupabaseClient => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
};

/**
 * Extract and verify JWT from Authorization header
 * Returns user data if valid, null otherwise
 */
export const verifyAuthToken = async (
  authHeader: string | undefined
): Promise<{ user: { id: string; email: string } } | null> => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return null;
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email || '',
      },
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

// Database type definitions for type safety
export interface DbWatchlist {
  id: string;
  user_id: string;
  name: string;
  symbols: string[];
  created_at: string;
  updated_at: string;
}

export interface DbIdea {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  symbol: string | null;
  image_url: string | null;
  likes: number;
  created_at: string;
}

export interface DbSavedChart {
  id: string;
  user_id: string;
  symbol: string;
  name: string | null;
  config: Record<string, unknown>;
  created_at: string;
}

export interface DbUserPreferences {
  user_id: string;
  theme: 'light' | 'dark';
  default_chart_type: 'line' | 'candlestick' | 'area';
  notifications: boolean;
  updated_at: string;
}
