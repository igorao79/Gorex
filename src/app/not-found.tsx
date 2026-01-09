import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { AnimatedBackground } from "@/components/ui/animated-background"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted relative">
      <AnimatedBackground />
      <Header />

      <main className="pt-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            {/* 404 Animation */}
            <div className="mb-8">
              <div className="text-9xl font-heading text-primary mb-4 animate-bounce">
                4
                <span className="inline-block animate-spin">0</span>
                4
              </div>
            </div>

            <h1 className="text-4xl font-heading text-foreground mb-4">
              Страница не найдена
            </h1>

            <p className="text-xl text-muted-foreground mb-8">
              Извините, но страница, которую вы ищете, не существует или была перемещена.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/">
                  Вернуться на главную
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

