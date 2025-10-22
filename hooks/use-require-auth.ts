"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase"

export function useRequireAuth() {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
          return
        }

        setAuthenticated(true)
      } catch (error) {
        console.error("[v0] Auth check error:", error)
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, pathname])

  return { loading, authenticated }
}
