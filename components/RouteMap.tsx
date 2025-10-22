"use client"

import { useEffect, useRef, useState } from "react"
import { setOptions, importLibrary } from "@googlemaps/js-api-loader"

interface RouteMapProps {
  polyline: string | null
  origin?: string
  destination?: string
}

export function RouteMap({ polyline, origin, destination }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      setError("Google Maps APIキーが設定されていません")
      setIsLoading(false)
      return
    }

    setOptions({
      apiKey,
      version: "weekly",
    })

    console.log("ロード前")

    const loadMap = async () => {
      try {       
        const { Map } = await importLibrary("maps") as google.maps.MapsLibrary;
        // geometryライブラリはpolylineデコードに必要なので別途インポート
        const geometry = await importLibrary("geometry") as google.maps.GeometryLibrary;

        console.log("[v0] Google Maps loaded successfully")

        if (!mapRef.current) return

        // Create map centered on Japan
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 35.6762, lng: 139.6503 }, // Tokyo
          zoom: 6,
          mapTypeControl: false,
          streetViewControl: false,
        })

        // If polyline is provided, decode and display it
        if (polyline && google.maps.geometry?.encoding) {
          try {
            console.log("[v0] Decoding polyline")
            const path = google.maps.geometry.encoding.decodePath(polyline)

            const polylineObj = new google.maps.Polyline({
              path,
              geodesic: true,
              strokeColor: "#2563eb",
              strokeOpacity: 0.8,
              strokeWeight: 4,
            })

            polylineObj.setMap(map)

            // Fit bounds to show entire route
            const bounds = new google.maps.LatLngBounds()
            path.forEach((point) => bounds.extend(point))
            map.fitBounds(bounds)

            console.log("[v0] Route displayed on map")
          } catch (err) {
            console.error("[v0] Error decoding polyline:", err)
            setError("ルートの描画に失敗しました")
          }
        }

        setIsLoading(false)
      } catch(err) {
        console.error("[v0] Error loading Google Maps:", err)
        setError("地図の読み込みに失敗しました")
        setIsLoading(false)
      }
    }
  }, [polyline])

  if (error) {
    return (
      <div className="w-full h-[360px] rounded-lg bg-muted flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="w-full h-[360px] rounded-lg bg-muted flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm">地図を読み込み中...</p>
        </div>
      </div>
    )
  }

  return <div ref={mapRef} className="w-full h-[360px] rounded-lg bg-muted" />
}
