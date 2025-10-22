import { type NextRequest, NextResponse } from "next/server"

interface DirectionsResponse {
  routes: Array<{
    legs: Array<{
      distance: { value: number }
      duration: { value: number }
    }>
    overview_polyline: { points: string }
    summary: string
  }>
  status: string
  error_message?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const origin = searchParams.get("origin")
    const destination = searchParams.get("destination")

    if (!origin || !destination) {
      return NextResponse.json({ error: "出発地と目的地を指定してください" }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.error("[v0] GOOGLE_MAPS_API_KEY is not set")
      return NextResponse.json({ error: "Google Maps APIキーが設定されていません" }, { status: 500 })
    }

    // Call Google Maps Directions API
    const url = new URL("https://maps.googleapis.com/maps/api/directions/json")
    url.searchParams.set("origin", origin)
    url.searchParams.set("destination", destination)
    url.searchParams.set("mode", "driving")
    url.searchParams.set("region", "jp")
    url.searchParams.set("key", apiKey)

    console.log("[v0] Fetching route from Google Maps API")
    const response = await fetch(url.toString())

    if (!response.ok) {
      console.error("[v0] Google Maps API request failed:", response.status)
      return NextResponse.json({ error: "Google Maps APIへのリクエストに失敗しました" }, { status: response.status })
    }

    const json: DirectionsResponse = await response.json()

    console.log("[v0] Google Maps API response status:", json.status)

    if (json.status !== "OK") {
      console.error("[v0] Directions API error:", json.status, json.error_message)
      return NextResponse.json({ error: `ルートが見つかりませんでした（${json.status}）` }, { status: 404 })
    }

    const route = json.routes[0]
    const leg = route?.legs?.[0]

    if (!leg) {
      console.error("[v0] No route leg found in response")
      return NextResponse.json({ error: "ルート情報が取得できませんでした" }, { status: 404 })
    }

    // Convert meters to kilometers, seconds to minutes
    const distanceKm = Math.round((leg.distance.value / 1000) * 10) / 10
    const durationMin = Math.round(leg.duration.value / 60)
    const overviewPolyline = route.overview_polyline.points
    const summary = route.summary || ""

    console.log("[v0] Route found:", { distanceKm, durationMin, summary })

    return NextResponse.json({
      distanceKm,
      durationMin,
      overviewPolyline,
      summary,
    })
  } catch (error) {
    console.error("[v0] Route API error:", error)
    return NextResponse.json({ error: "ルート検索中にエラーが発生しました" }, { status: 500 })
  }
}
