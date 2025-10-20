"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SettingsIcon } from "lucide-react"
import type { Settings } from "@/lib/types"
import { Navigation } from "@/components/navigation"

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [fuelPrice, setFuelPrice] = useState("170")
  const [tollBase, setTollBase] = useState("150")
  const [tollPerKm, setTollPerKm] = useState("24.6")
  const [roundingMode, setRoundingMode] = useState<"ceil" | "floor" | "round">("round")

  // Using sample user ID for prototype
  const userId = "00000000-0000-0000-0000-000000000001"

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/settings/get?user_id=${userId}`)
      if (!response.ok) throw new Error("Failed to fetch settings")

      const data = await response.json()
      const settings: Settings = data.settings

      setFuelPrice(settings.fuel_price.toString())
      setTollBase(settings.toll_coeffs_json.base.toString())
      setTollPerKm(settings.toll_coeffs_json.per_km.toString())
      setRoundingMode(settings.rounding_mode)
    } catch (error) {
      console.error("[v0] Error fetching settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSaving(true)
      const response = await fetch("/api/settings/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          fuel_price: Number.parseFloat(fuelPrice),
          toll_coeffs_json: {
            base: Number.parseFloat(tollBase),
            per_km: Number.parseFloat(tollPerKm),
          },
          rounding_mode: roundingMode,
        }),
      })

      if (!response.ok) throw new Error("Failed to save settings")

      alert("設定を保存しました")
    } catch (error) {
      console.error("[v0] Error saving settings:", error)
      alert("設定の保存に失敗しました")
    } finally {
      setIsSaving(false)
    }
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
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">設定</h1>
            <p className="text-muted-foreground">費用計算に使用する設定を管理できます</p>
          </div>

          <form onSubmit={handleSaveSettings}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5" />
                  計算設定
                </CardTitle>
                <CardDescription>燃料価格や高速料金の計算係数を設定します</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fuelPrice">燃料価格 (円/L)</Label>
                  <Input
                    id="fuelPrice"
                    type="number"
                    step="0.1"
                    min="0"
                    value={fuelPrice}
                    onChange={(e) => setFuelPrice(e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">ガソリン1リットルあたりの価格</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">高速料金計算係数</h3>

                  <div className="space-y-2">
                    <Label htmlFor="tollBase">基本料金 (円)</Label>
                    <Input
                      id="tollBase"
                      type="number"
                      step="1"
                      min="0"
                      value={tollBase}
                      onChange={(e) => setTollBase(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tollPerKm">距離あたり料金 (円/km)</Label>
                    <Input
                      id="tollPerKm"
                      type="number"
                      step="0.1"
                      min="0"
                      value={tollPerKm}
                      onChange={(e) => setTollPerKm(e.target.value)}
                      required
                    />
                  </div>

                  <p className="text-sm text-muted-foreground">高速料金 = 基本料金 + (距離 × 距離あたり料金)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roundingMode">端数処理</Label>
                  <Select value={roundingMode} onValueChange={(value: any) => setRoundingMode(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="round">四捨五入</SelectItem>
                      <SelectItem value="ceil">切り上げ</SelectItem>
                      <SelectItem value="floor">切り捨て</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">計算結果の端数処理方法</p>
                </div>

                <Button type="submit" className="w-full" disabled={isSaving}>
                  {isSaving ? "保存中..." : "設定を保存"}
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  )
}
