"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { ProjectGrid } from "@/components/dashboard/project-grid"
import { AnalyticsCards } from "@/components/dashboard/analytics-cards"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [projectsWithTasks, setProjectsWithTasks] = useState([])
  const [projectsUpdated, setProjectsUpdated] = useState(0) // Trigger for re-fetching
  const [currentTarif, setCurrentTarif] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch('/api/dashboard/projects')
      if (response.ok) {
        const projects = await response.json()
        setProjectsWithTasks(projects)
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
    }
  }, [session?.user?.id])

  const refreshAllData = useCallback(() => {
    fetchProjects()
    setProjectsUpdated(prev => prev + 1) // Trigger ProjectGrid to refresh
  }, [fetchProjects])

  // Автоматическое обновление данных каждые 30 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) { // Только если вкладка активна
        console.log('Auto-refreshing dashboard data...')
        fetchProjects()
      }
    }, 30000) // 30 секунд

    return () => clearInterval(interval)
  }, [fetchProjects])

  // Обновление при возвращении на вкладку
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Tab focused, refreshing dashboard data...')
        fetchProjects()
      }
    }

    const handleFocus = () => {
      console.log('Window focused, refreshing dashboard data...')
      fetchProjects()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchProjects])

  // Получение текущего тарифа пользователя
  const fetchCurrentTarif = useCallback(async () => {
    if (!session?.user) return

    try {
      const response = await fetch('/api/user/tarif')
      if (response.ok) {
        const data = await response.json()
        setCurrentTarif(data.tarif)
      }
    } catch (error) {
      console.error('Error fetching user tarif:', error)
    }
  }, [session?.user])

  useEffect(() => {
    if (status === "loading") return
    if (!session?.user) {
      redirect("/")
      return
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects()
    fetchCurrentTarif()
  }, [session, status, fetchProjects, fetchCurrentTarif])

  // Автоматическое обновление для приглашенных пользователей
  useEffect(() => {
    if (!session?.user?.id) return

    let focusTimeout: NodeJS.Timeout
    let visibilityTimeout: NodeJS.Timeout

    const handleFocus = () => {
      clearTimeout(focusTimeout)
      focusTimeout = setTimeout(() => {
        fetchProjects() // Обновляем при фокусе окна с задержкой
      }, 1000)
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        clearTimeout(visibilityTimeout)
        visibilityTimeout = setTimeout(() => {
          fetchProjects() // Обновляем при возвращении на вкладку с задержкой
        }, 1000)
      }
    }

    // Обновление каждые 5 минут
    const interval = setInterval(() => {
      if (!document.hidden) { // Только если вкладка активна
        fetchProjects()
      }
    }, 300000)

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(interval)
      clearTimeout(focusTimeout)
      clearTimeout(visibilityTimeout)
    }
  }, [session?.user?.id, fetchProjects])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <Header />
        <main className="flex-1 overflow-hidden container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-4"></div>
            <div className="h-4 bg-muted rounded w-96 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted relative">

      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading text-foreground mb-2">
            Добро пожаловать, {session.user.name}!
          </h1>
          <p className="text-muted-foreground font-sans mb-2">
            Управляйте своими проектами и задачами
          </p>
          {currentTarif && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground">Ваш тариф:</span>
              <Link
                href="/pricing"
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                  currentTarif === 'free'
                    ? 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
                    : currentTarif === 'prof'
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                }`}
              >
                {currentTarif === 'free' ? 'Free' : currentTarif === 'prof' ? 'Pro' : 'Team'}
              </Link>
            </div>
          )}
        </div>

        <AnalyticsCards projects={projectsWithTasks} onTasksUpdate={refreshAllData} />

        <ProjectGrid userId={session.user.id} refreshTrigger={projectsUpdated} />
      </main>
    </div>
  )
}
