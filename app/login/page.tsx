"use client"
import { useState } from "react"
import type React from "react"

import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { LogIn, AlertCircle } from "lucide-react"
import Navigation from "@/components/navigation"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get("redirect") || "/"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">設定が必要です</CardTitle>
            <CardDescription className="text-center">
              NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const getSafeRedirect = (redirect: string): string => {
    if (!redirect || redirect === "/login" || redirect.startsWith("/_")) {
      return "/"
    }
    // Only allow relative paths starting with /
    if (!redirect.startsWith("/")) {
      return "/"
    }
    return redirect
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrMsg(null)
    const supabase = getSupabaseBrowserClient()

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        if (error.message.includes("Email not confirmed")) {
          setErrMsg(
            "メール確認が必要です。SupabaseのAuth設定でConfirm emailをOFFにするか、メールのリンクを確認してください。",
          )
        } else if (error.message.includes("Invalid login credentials")) {
          setErrMsg("メールアドレスまたはパスワードが正しくありません。")
        } else {
          setErrMsg(error.message)
        }
        return
      }

      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        setErrMsg("セッションの確立に失敗しました。もう一度お試しください。")
        return
      }

      const safeRedirect = getSafeRedirect(redirectParam)
      router.push(safeRedirect)
    } catch (e: any) {
      console.error("[v0] Login error:", e)
      setErrMsg(e?.message ?? "ログインで予期せぬエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="flex items-center justify-center p-4 pt-24">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <LogIn className="w-6 h-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">ログイン</CardTitle>
            <CardDescription className="text-center">旅行費用計算アプリへようこそ</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              {errMsg && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{errMsg}</span>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "ログイン中..." : "ログイン"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              アカウントをお持ちでない方は{" "}
              <Link href="/signup" className="text-primary hover:underline font-medium">
                新規登録
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
