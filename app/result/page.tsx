"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, MapPin, Clock, Fuel, Coins, Car, ParkingSquare, Users } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { RouteMap } from "@/components/RouteMap"

interface RouteData {
  distanceKm: number
  durationMin: number
  overviewPolyline: string
  summary: string
}

interface CostData {
  toll_est: number
  fuel_cost: number
  total: number
  per_person: number
}

function ResultPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loading: authLoading, authenticated } = useRequireAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [routeData, setRouteData] = useState<RouteData | null>(null)
  const [costData, setCostData] = useState<CostData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const origin = searchParams.get("origin") || ""
  const destination = searchParams.get("destination") || ""
  const fuelEfficiency = Number.parseFloat(searchParams.get("fuelEfficiency") || "15")
  const headcount = Number.parseInt(searchParams.get("headcount") || "1")

  useEffect(() => {
    if (!origin || !destination) {
      setError("出発地と目的地を指定してください")
      setIsLoading(false)
      return
    }

    if (!authLoading && authenticated) {
      const fetchData = async () => {
        try {
          setIsLoading(true)
          console.log("[v0] Fetching route data for:", origin, "→", destination)

          const routeResponse = await fetch(
            `/api/maps/route?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`,
          )

          if (!routeResponse.ok) {
            const errorData = await routeResponse.json()
            throw new Error(errorData.error || "ルートの取得に失敗しました")
          }

          const route: RouteData = await routeResponse.json()
          console.log("[v0] Route data received:", route)
          setRouteData(route)

          const costResponse = await fetch("/api/route/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              origin,
              destination,
              fuelEfficiency,
              headcount,
              distance_km: route.distanceKm,
              duration_min: route.durationMin,
            }),
          })

          if (!costResponse.ok) {
            throw new Error("費用の計算に失敗しました")
          }

          const costs: CostData = await costResponse.json()
          console.log("[v0] Cost data received:", costs)
          setCostData(costs)
        } catch (err) {
          console.error("[v0] Error fetching data:", err)
          setError(err instanceof Error ? err.message : "エラーが発生しました")
        } finally {
          setIsLoading(false)
        }
      }

      fetchData()
    }
  }, [authLoading, authenticated, origin, destination, fuelEfficiency, headcount])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(amount)
  }

  const formatDistance = (km: number) => {
    return `${km.toFixed(1)} km`
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}時間${mins}分`
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{authLoading ? "認証確認中..." : "経路を検索中..."}</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">エラー</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{error}</p>
            <Button onClick={() => router.push("/")} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              ホームに戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!routeData || !costData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">データを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Button variant="outline" onClick={() => router.push("/")} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              戻る
            </Button>
            <h1 className="text-3xl font-bold text-foreground mb-2">計算結果</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>
                {origin} → {destination}
              </span>
            </div>
            {routeData.summary && <p className="text-sm text-muted-foreground mt-1">経由: {routeData.summary}</p>}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>ルート地図</CardTitle>
              </CardHeader>
              <CardContent>
                <RouteMap polyline={routeData.overviewPolyline} origin={origin} destination={destination} />
              </CardContent>
            </Card>

            {/* Route info */}
            <Card>
              <CardHeader>
                <CardTitle>経路情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>距離</span>
                  </div>
                  <span className="font-semibold">{formatDistance(routeData.distanceKm)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>所要時間</span>
                  </div>
                  <span className="font-semibold">{formatDuration(routeData.durationMin)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>人数</span>
                  </div>
                  <span className="font-semibold">{headcount}人</span>
                </div>
              </CardContent>
            </Card>

            {/* Cost breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>費用内訳</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Coins className="w-4 h-4" />
                    <span>高速料金</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(costData.toll_est)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Fuel className="w-4 h-4" />
                    <span>燃料費</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(costData.fuel_cost)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Car className="w-4 h-4" />
                    <span>レンタカー代</span>
                  </div>
                  <span className="font-semibold text-muted-foreground">未設定</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ParkingSquare className="w-4 h-4" />
                    <span>駐車場代</span>
                  </div>
                  <span className="font-semibold text-muted-foreground">未設定</span>
                </div>
              </CardContent>
            </Card>

            {/* Total cost */}
            <Card className="lg:col-span-2 bg-primary text-primary-foreground">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm opacity-90 mb-2">合計金額</p>
                    <p className="text-4xl font-bold">{formatCurrency(costData.total)}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-90 mb-2">一人あたり</p>
                    <p className="text-4xl font-bold">{formatCurrency(costData.per_person)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>※ 高速料金と燃料費は概算値です</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">読み込み中...</p>
          </div>
        </div>
      }
    >
      <ResultPageContent />
    </Suspense>
  )
}
