"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Calendar, Users } from "lucide-react"
import type { Trip } from "@/lib/types"
import { Navigation } from "@/components/navigation"

export default function HistoryPage() {
  const router = useRouter()
  const [trips, setTrips] = useState<Trip[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Using sample user ID for prototype
  const userId = "00000000-0000-0000-0000-000000000001"

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch(`/api/trip/list?user_id=${userId}`)
        if (!response.ok) throw new Error("Failed to fetch trips")

        const data = await response.json()
        setTrips(data.trips || [])
      } catch (error) {
        console.error("[v0] Error fetching trips:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrips()
  }, [userId])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">旅行履歴</h1>
            <p className="text-muted-foreground">過去の旅行費用計算の履歴を確認できます</p>
          </div>

          {trips.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>まだ旅行履歴がありません</p>
                <Button onClick={() => router.push("/")} className="mt-4">
                  新しい旅行を計算する
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {trips.map((trip) => (
                <Card key={trip.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 mb-2">
                          <MapPin className="w-5 h-5" />
                          {trip.origin} → {trip.destination}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(trip.created_at)}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{formatCurrency(trip.total)}</p>
                        <p className="text-sm text-muted-foreground">合計</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">距離</p>
                        <p className="font-semibold">{trip.distance_km.toFixed(1)} km</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">高速料金</p>
                        <p className="font-semibold">{formatCurrency(trip.toll_est)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">燃料費</p>
                        <p className="font-semibold">{formatCurrency(trip.fuel_cost)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          一人あたり
                        </p>
                        <p className="font-semibold">{formatCurrency(trip.per_person)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
