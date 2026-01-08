"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-slate-900">
            Gorex
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="#features"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Возможности
            </Link>
            <Link
              href="#pricing"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Тарифы
            </Link>
            <Link
              href="#about"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              О нас
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/signin">Войти</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Регистрация</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
