import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      user_id,
      origin,
      destination,
      distance_km,
      duration_min,
      toll_est,
      fuel_cost,
      rent_cost = 0,
      park_cost = 0,
      headcount,
      total,
      per_person,
    } = body

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

    const { data, error } = await supabase
      .from("trips")
      .insert({
        user_id,
        origin,
        destination,
        distance_km,
        duration_min,
        toll_est,
        fuel_cost,
        rent_cost,
        park_cost,
        headcount,
        total,
        per_person,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Database error:", error)
      return NextResponse.json({ error: "データの保存に失敗しました" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Trip save error:", error)
    return NextResponse.json({ error: "旅行データの保存中にエラーが発生しました" }, { status: 500 })
  }
}
