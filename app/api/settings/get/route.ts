import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id")

    if (!user_id) {
      return NextResponse.json({ error: "user_idが必要です" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            } catch {
              // Handle cookie setting errors
            }
          },
        },
      },
    )

    const { data, error } = await supabase.from("settings").select("*").eq("user_id", user_id).single()

    if (error) {
      // Return default settings if not found
      if (error.code === "PGRST116") {
        return NextResponse.json({
          settings: {
            fuel_price: 170,
            toll_coeffs_json: { base: 150, per_km: 24.6 },
            rounding_mode: "round",
          },
        })
      }
      console.error("[v0] Database error:", error)
      return NextResponse.json({ error: "設定の取得に失敗しました" }, { status: 500 })
    }

    return NextResponse.json({ settings: data })
  } catch (error) {
    console.error("[v0] Settings get error:", error)
    return NextResponse.json({ error: "設定の取得中にエラーが発生しました" }, { status: 500 })
  }
}
