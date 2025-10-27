"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google: any;
  }
}

interface RouteMapProps {
  polyline: string | null;
  origin?: string;
  destination?: string;
  heightClassName?: string;
}

export function RouteMap({
  polyline,
  origin,
  destination,
  heightClassName = "h-[360px]",
}: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const routePolylineRef = useRef<any>(null);
  const originMarkerRef = useRef<any>(null);
  const destMarkerRef = useRef<any>(null);

  const [error, setError] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false); // ← スクリプト読み込み完了フラグ

  // 1) Google Maps スクリプト読み込み
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError("Google Maps APIキーが設定されていません");
      return;
    }

    // すでに読み込み済みならそのまま続行
    if (typeof window !== "undefined" && window.google?.maps) {
      setScriptReady(true);
      return;
    }

    // 二重挿入防止
    const EXISTING_ID = "gmaps-js";
    const existing = document.getElementById(EXISTING_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => setScriptReady(true), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = EXISTING_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry&v=weekly&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptReady(true);
    script.onerror = () => {
      setError("Google Maps APIの読み込みに失敗しました");
    };
    document.head.appendChild(script);

    // ★ 重要: アンマウントでスクリプトを消さない（他ページと競合しやすい）
  }, []);

  // 2) 地図初期化（コンテナが描画済み & スクリプト準備OK で一度だけ）
  useEffect(() => {
    if (!scriptReady) return;
    if (!containerRef.current) return;
    if (!window.google?.maps) return;
    if (mapRef.current) return; // 既に初期化済みなら何もしない

    try {
      const map = new window.google.maps.Map(containerRef.current, {
        center: { lat: 35.6762, lng: 139.6503 },
        zoom: 6,
        mapTypeControl: false,
        streetViewControl: false,
      });
      mapRef.current = map;
    } catch (e: any) {
      setError("地図の作成に失敗しました: " + (e?.message || "不明なエラー"));
    }
  }, [scriptReady]);

  // 3) ルート・マーカー描画（mapができてから）
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.google?.maps) return;

    // 既存クリア
    routePolylineRef.current?.setMap(null);
    routePolylineRef.current = null;
    originMarkerRef.current?.setMap(null);
    originMarkerRef.current = null;
    destMarkerRef.current?.setMap(null);
    destMarkerRef.current = null;

    if (!polyline && !origin && !destination) {
      map.setCenter({ lat: 35.6762, lng: 139.6503 });
      map.setZoom(6);
      return;
    }

    (async () => {
      try {
        const bounds = new window.google.maps.LatLngBounds();

        if (polyline && window.google.maps.geometry?.encoding) {
          const path = window.google.maps.geometry.encoding.decodePath(polyline);
          routePolylineRef.current = new window.google.maps.Polyline({
            path,
            geodesic: true,
            strokeColor: "#2563eb",
            strokeOpacity: 0.9,
            strokeWeight: 4,
            map,
          });
          path.forEach((p: any) => bounds.extend(p));
        }

        const geocoder = new window.google.maps.Geocoder();

        const parseLatLng = (s?: string): any | null => {
          if (!s) return null;
          const m = s.match(/^\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\s*$/);
          return m ? new window.google.maps.LatLng(parseFloat(m[1]), parseFloat(m[2])) : null;
        };

        async function resolveLocation(s?: string) {
          const ll = parseLatLng(s);
          if (ll) return ll;
          if (!s) return null;
          const res = await geocoder.geocode({ address: s });
          return res.results?.[0]?.geometry?.location ?? null;
        }

        const [oLoc, dLoc] = await Promise.all([resolveLocation(origin), resolveLocation(destination)]);

        if (oLoc) {
          originMarkerRef.current = new window.google.maps.Marker({
            position: oLoc,
            map,
            label: "S",
            title: origin,
          });
          bounds.extend(oLoc);
        }

        if (dLoc) {
          destMarkerRef.current = new window.google.maps.Marker({
            position: dLoc,
            map,
            label: "G",
            title: destination,
          });
          bounds.extend(dLoc);
        }

        if (!bounds.isEmpty()) {
          map.fitBounds(bounds);
          const once = window.google.maps.event.addListenerOnce(map, "bounds_changed", () => {
            if (map.getZoom()! > 16) map.setZoom(16);
            window.google.maps.event.removeListener(once);
          });
        }
      } catch (e) {
        setError("地図の描画に失敗しました");
      }
    })();
  }, [polyline, origin, destination]);

  // ★ ここがポイント：常に「コンテナ」を出す。ローディング中はオーバーレイのみ。
  return (
    <div className={`relative w-full ${heightClassName} rounded-lg bg-muted`}>
      <div ref={containerRef} className="absolute inset-0 rounded-lg" />
      {!scriptReady && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
            <p className="text-sm">地図を読み込み中...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground p-4">
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
