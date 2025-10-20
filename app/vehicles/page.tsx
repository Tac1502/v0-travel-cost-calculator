"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Car, Plus, Edit } from "lucide-react"
import type { Vehicle } from "@/lib/types"
import { Navigation } from "@/components/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)

  // Form state
  const [name, setName] = useState("")
  const [fuelType, setFuelType] = useState<"gasoline" | "hybrid" | "ev">("gasoline")
  const [efficiencyKml, setEfficiencyKml] = useState("")
  const [notes, setNotes] = useState("")

  // Using sample user ID for prototype
  const userId = "00000000-0000-0000-0000-000000000001"

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/vehicle/list?user_id=${userId}`)
      if (!response.ok) throw new Error("Failed to fetch vehicles")

      const data = await response.json()
      setVehicles(data.vehicles || [])
    } catch (error) {
      console.error("[v0] Error fetching vehicles:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle)
      setName(vehicle.name)
      setFuelType(vehicle.fuel_type)
      setEfficiencyKml(vehicle.efficiency_kml.toString())
      setNotes(vehicle.notes || "")
    } else {
      setEditingVehicle(null)
      setName("")
      setFuelType("gasoline")
      setEfficiencyKml("")
      setNotes("")
    }
    setIsDialogOpen(true)
  }

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/vehicle/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingVehicle?.id,
          user_id: userId,
          name,
          fuel_type: fuelType,
          efficiency_kml: Number.parseFloat(efficiencyKml),
          notes,
        }),
      })

      if (!response.ok) throw new Error("Failed to save vehicle")

      await fetchVehicles()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("[v0] Error saving vehicle:", error)
      alert("車両の保存に失敗しました")
    }
  }

  const getFuelTypeLabel = (type: string) => {
    switch (type) {
      case "gasoline":
        return "ガソリン"
      case "hybrid":
        return "ハイブリッド"
      case "ev":
        return "電気自動車"
      default:
        return type
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">車両管理</h1>
              <p className="text-muted-foreground">登録した車両の燃費情報を管理できます</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  車両を追加
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingVehicle ? "車両を編集" : "新しい車両を追加"}</DialogTitle>
                  <DialogDescription>車両の情報を入力してください</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSaveVehicle} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">車両名</Label>
                    <Input
                      id="name"
                      placeholder="例: トヨタ プリウス"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fuelType">燃料タイプ</Label>
                    <Select value={fuelType} onValueChange={(value: any) => setFuelType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gasoline">ガソリン</SelectItem>
                        <SelectItem value="hybrid">ハイブリッド</SelectItem>
                        <SelectItem value="ev">電気自動車</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="efficiency">燃費 (km/L)</Label>
                    <Input
                      id="efficiency"
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="15.0"
                      value={efficiencyKml}
                      onChange={(e) => setEfficiencyKml(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">メモ（任意）</Label>
                    <Textarea
                      id="notes"
                      placeholder="車両に関するメモ"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      キャンセル
                    </Button>
                    <Button type="submit">保存</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {vehicles.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Car className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>まだ車両が登録されていません</p>
                <Button onClick={() => handleOpenDialog()} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  最初の車両を追加
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 mb-2">
                          <Car className="w-5 h-5" />
                          {vehicle.name}
                        </CardTitle>
                        <CardDescription>{getFuelTypeLabel(vehicle.fuel_type)}</CardDescription>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(vehicle)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">燃費</span>
                        <span className="font-semibold">{vehicle.efficiency_kml} km/L</span>
                      </div>
                      {vehicle.notes && (
                        <div className="pt-2 border-t border-border">
                          <p className="text-sm text-muted-foreground">{vehicle.notes}</p>
                        </div>
                      )}
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
