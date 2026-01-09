import { Header } from "@/components/layout/header"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="h-9 bg-muted rounded w-64 mb-2"></div>
                <div className="h-4 bg-muted rounded w-96"></div>
              </div>
              <div className="h-4 bg-muted rounded w-24"></div>
            </div>
          </div>

          {/* Kanban board skeleton */}
          <div className="text-xl font-heading text-foreground mb-6">
            Kanban доска
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* To Do column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-muted-foreground">К выполнению</h3>
                <div className="h-6 w-6 bg-muted rounded-full"></div>
              </div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 bg-card border rounded-lg space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-5 w-16 bg-muted rounded"></div>
                      <div className="h-3 w-12 bg-muted rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* In Progress column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-muted-foreground">В работе</h3>
                <div className="h-6 w-6 bg-muted rounded-full"></div>
              </div>
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="p-4 bg-card border rounded-lg space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-5 w-16 bg-muted rounded"></div>
                      <div className="h-3 w-12 bg-muted rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Review column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-muted-foreground">Проверка</h3>
                <div className="h-6 w-6 bg-muted rounded-full"></div>
              </div>
              <div className="space-y-3">
                {[...Array(1)].map((_, i) => (
                  <div key={i} className="p-4 bg-card border rounded-lg space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-5 w-16 bg-muted rounded"></div>
                      <div className="h-3 w-12 bg-muted rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Done column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-muted-foreground">Готово</h3>
                <div className="h-6 w-6 bg-muted rounded-full"></div>
              </div>
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="p-4 bg-card border rounded-lg space-y-3 opacity-60">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-5 w-16 bg-muted rounded"></div>
                      <div className="h-3 w-12 bg-muted rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
