"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Users, Gauge, Calculator } from "lucide-react"
import { Navigation } from "@/components/navigation"

export default function HomePage() {
  const router = useRouter()
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [fuelEfficiency, setFuelEfficiency] = useState("15")
  const [headcount, setHeadcount] = useState("1")
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!origin || !destination) {
      alert("出発地と目的地を入力してください")
      return
    }

    setIsLoading(true)

    // Navigate to result page with query parameters
    const params = new URLSearchParams({
      origin,
      destination,
      fuelEfficiency,
      headcount,
    })

    router.push(`/result?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Calculator className="w-10 h-10 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">旅行費用計算</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              出発地と目的地を入力して、旅行にかかる費用を簡単に見積もりましょう
            </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>旅行条件を入力</CardTitle>
              <CardDescription>高速料金・燃料費・総費用を自動で計算します</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="origin" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    出発地
                  </Label>
                  <Input
                    id="origin"
                    type="text"
                    placeholder="例: 東京駅"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    目的地
                  </Label>
                  <Input
                    id="destination"
                    type="text"
                    placeholder="例: 大阪駅"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="text-base"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fuelEfficiency" className="flex items-center gap-2">
                      <Gauge className="w-4 h-4" />
                      燃費 (km/L)
                    </Label>
                    <Input
                      id="fuelEfficiency"
                      type="number"
                      min="1"
                      step="0.1"
                      placeholder="15"
                      value={fuelEfficiency}
                      onChange={(e) => setFuelEfficiency(e.target.value)}
                      className="text-base"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="headcount" className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      人数
                    </Label>
                    <Input
                      id="headcount"
                      type="number"
                      min="1"
                      placeholder="1"
                      value={headcount}
                      onChange={(e) => setHeadcount(e.target.value)}
                      className="text-base"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full text-base h-12" disabled={isLoading}>
                  {isLoading ? "計算中..." : "費用を計算する"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>※ 高速料金と燃料費は概算値です</p>
          </div>
        </div>
      </div>
    </div>
  )
}
