import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, user_id, name, fuel_type, efficiency_kml, notes } = body

    if (!user_id || !name || !fuel_type || !efficiency_kml) {
      return NextResponse.json({ error: "必須パラメータが不足しています" }, { status: 400 })
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

    let data, error

    if (id) {
      // Update existing vehicle
      const result = await supabase
        .from("vehicles")
        .update({
          name,
          fuel_type,
          efficiency_kml,
          notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      data = result.data
      error = result.error
    } else {
      // Insert new vehicle
      const result = await supabase
        .from("vehicles")
        .insert({
          user_id,
          name,
          fuel_type,
          efficiency_kml,
          notes,
        })
        .select()
        .single()

      data = result.data
      error = result.error
    }

    if (error) {
      console.error("[v0] Database error:", error)
      return NextResponse.json({ error: "車両データの保存に失敗しました" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Vehicle save error:", error)
    return NextResponse.json({ error: "車両データの保存中にエラーが発生しました" }, { status: 500 })
  }
}
