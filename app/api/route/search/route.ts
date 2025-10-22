import { type NextRequest, NextResponse } from "next/server"
import type { RouteSearchParams } from "@/lib/types"

// Mock function to simulate Google Maps API response
// Replace this with actual Google Maps API call when ready
function mockRouteSearch(
  origin: string,
  destination: string,
): {
  distance_km: number
  duration_min: number
} {
  // Simple mock based on common routes
  const mockData: Record<string, { distance: number; duration: number }> = {
    "東京駅-大阪駅": { distance: 515, duration: 360 },
    "東京駅-名古屋駅": { distance: 350, duration: 240 },
    "東京駅-京都駅": { distance: 475, duration: 330 },
    "大阪駅-福岡駅": { distance: 560, duration: 390 },
  }

  const key = `${origin}-${destination}`
  const reverseKey = `${destination}-${origin}`

  if (mockData[key]) {
    return { distance_km: mockData[key].distance, duration_min: mockData[key].duration }
  } else if (mockData[reverseKey]) {
    return { distance_km: mockData[reverseKey].distance, duration_min: mockData[reverseKey].duration }
  }

  // Default mock data for unknown routes
  return { distance_km: 300, duration_min: 240 }
}

// Calculate toll estimate based on distance
function calculateTollEstimate(distance_km: number): number {
  const BASE_TOLL = 150 // Base toll fee
  const PER_KM_RATE = 24.6 // Toll per km

  return Math.round(BASE_TOLL + distance_km * PER_KM_RATE)
}

// Calculate fuel cost
function calculateFuelCost(distance_km: number, fuelEfficiency: number, fuelPrice = 170): number {
  const litersNeeded = distance_km / fuelEfficiency
  return Math.round(litersNeeded * fuelPrice)
}

export async function POST(request: NextRequest) {
  try {
    const body: RouteSearchParams & { distance_km?: number; duration_min?: number } = await request.json()
    const { origin, destination, fuelEfficiency, headcount, distance_km, duration_min } = body

    if (!origin || !destination || !fuelEfficiency || !headcount) {
      return NextResponse.json({ error: "必須パラメータが不足しています" }, { status: 400 })
    }

    let distanceKm: number
    let durationMin: number

    if (distance_km !== undefined && duration_min !== undefined) {
      distanceKm = distance_km
      durationMin = duration_min
    } else {
      // Fallback to mock data
      const mockResult = mockRouteSearch(origin, destination)
      distanceKm = mockResult.distance_km
      durationMin = mockResult.duration_min
    }

    // Calculate costs
    const toll_est = calculateTollEstimate(distanceKm)
    const fuel_cost = calculateFuelCost(distanceKm, fuelEfficiency)
    const total = toll_est + fuel_cost
    const per_person = Math.round(total / headcount)

    const result = {
      distance_km: distanceKm,
      duration_min: durationMin,
      toll_est,
      fuel_cost,
      total,
      per_person,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Route search error:", error)
    return NextResponse.json({ error: "経路検索中にエラーが発生しました" }, { status: 500 })
  }
}
