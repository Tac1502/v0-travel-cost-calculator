import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types"
import { cookies } from "next/headers"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

let supabaseClient: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseBrowserClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey)

  return supabaseClient
}

export function getSupabaseClient() {
  return getSupabaseBrowserClient()
}

export const supabase = getSupabaseClient()

export async function getSupabaseServerClient() {
  const cookieStore = await cookies()

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        cookie: cookieStore
          .getAll()
          .map((c) => `${c.name}=${c.value}`)
          .join("; "),
      },
    },
  })
}
