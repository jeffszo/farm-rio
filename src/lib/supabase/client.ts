// src/lib/supabase/client.ts

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Apenas use esse se precisar no server (ex: route handler)
export const supabaseServerClient = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  
);

// ✅ Este é o que deve ser usado no CLIENTE
export const createClient = () => createClientComponentClient();
