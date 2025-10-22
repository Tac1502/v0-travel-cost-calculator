"use client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowRight } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import Navigation from "@/components/navigation"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const router = useRouter()
  const { loading: authLoading, authenticated } = useRequireAuth()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && authenticated) {
      const getUserEmail = async () => {
        const supabase = getSupabaseBrowserClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session?.user) {
          setUserEmail(session.user.email || null)
        }
      }
      getUserEmail()
    }
  }, [authLoading, authenticated])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">認証確認中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">ログイン成功</CardTitle>
            <CardDescription className="text-center">
              {userEmail ? `${userEmail} でログインしました` : "ログインに成功しました"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">旅行費用計算アプリをご利用いただけます。</p>
            <Button onClick={() => router.push("/")} className="w-full" size="lg">
              費用計算を開始
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
