import { createClient } from "@supabase/supabase-js"

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://ardkyccwuobszvtjswmo.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_RPRvYAfvx8FYGwZarM5ECw_FFQALkum"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)