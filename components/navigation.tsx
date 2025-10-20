"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calculator, History, Car, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: "/", label: "計算", icon: Calculator },
    { href: "/history", label: "履歴", icon: History },
    { href: "/vehicles", label: "車両", icon: Car },
    { href: "/settings", label: "設定", icon: Settings },
  ]

  return (
    <nav className="border-b border-border bg-card">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-6 h-16">
          <Link href="/" className="font-bold text-lg text-foreground">
            旅行費用計算
          </Link>
          <div className="flex gap-1 ml-auto">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
