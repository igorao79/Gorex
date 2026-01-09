"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Filter, Search } from "lucide-react"
import { ProjectCard } from "./project-card"
import { CreateProjectModal } from "./create-project-modal"

interface Project {
  id: string
  name: string
  description: string | null
  status: "ACTIVE" | "COMPLETED" | "ARCHIVED"
  createdAt: string
  creatorId: string
  creator: {
    name: string | null
    email: string
  }
  _count: {
    members: number
    tasks: number
    overdueTasks: number
  }
}

interface ProjectGridProps {
  userId: string
  refreshTrigger?: number
}

export function ProjectGrid({ userId, refreshTrigger }: ProjectGridProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshCounter, setRefreshCounter] = useState(0)

  // Фильтруем проекты по статусу и поиску
  const filteredProjects = useMemo(() => {
    let filtered = projects

    // Фильтр по статусу
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(project => project.status === statusFilter)
    }

    // Фильтр по поиску
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [projects, statusFilter, searchQuery])

  useEffect(() => {
    fetchProjects()
  }, [userId])

  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      fetchProjects()
    }
  }, [refreshTrigger])

  // Автоматическое обновление для приглашенных пользователей
  useEffect(() => {
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
  }, [userId]) // Зависимость от userId, чтобы пересоздать эффекты при смене пользователя

  const fetchProjects = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch("/api/dashboard/projects")
      if (response.ok) {
        const projectsData = await response.json()
        setProjects(projectsData)
      } else {
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleProjectUpdate = () => {
    setRefreshCounter(prev => prev + 1)
    fetchProjects()
  }

  const handleMemberCountChange = (projectId: string, newCount: number) => {
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === projectId
          ? { ...project, _count: { ...project._count, members: newCount } }
          : project
      )
    )
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-muted rounded w-full mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <Plus className="w-12 h-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-heading text-foreground mb-2">
          Нет проектов
        </h2>
        <p className="text-muted-foreground mb-6">
          Создайте свой первый проект для начала работы с задачами
        </p>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Создать проект
        </Button>
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onProjectCreated={(newProject) => {
            // Transform to full Project type
            const fullProject: Project = {
              ...newProject,
              status: "ACTIVE", // New projects are active by default
              creatorId: userId, // Current user is the creator
              creator: {
                name: "Вы", // Current user is the creator
                email: "", // We don't need email here
              },
              _count: {
                ...newProject._count,
                overdueTasks: 0, // New projects have no overdue tasks
              },
            }
            setProjects(prev => [...prev, fullProject])
            setShowCreateModal(false)
          }}
        />
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
          <h2 className="text-xl font-heading text-foreground">Мои проекты</h2>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Все проекты</SelectItem>
                <SelectItem value="ACTIVE">Активные</SelectItem>
                <SelectItem value="COMPLETED">Завершенные</SelectItem>
                <SelectItem value="ARCHIVED">Архивированные</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Поиск проектов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {isRefreshing && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className="w-3 h-3 border border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin"></div>
                Обновление...
              </div>
            )}
          </div>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Создать проект
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[600px] transition-all duration-300 ease-in-out">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out will-change-transform"
            style={{ animationFillMode: 'forwards' }}
          >
            <ProjectCard
              project={project}
              userId={userId}
              onUpdate={handleProjectUpdate}
              onMemberCountChange={handleMemberCountChange}
            />
          </div>
        ))}
      </div>
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProjectCreated={(newProject) => {
          // Transform to full Project type
          const fullProject: Project = {
            ...newProject,
            status: "ACTIVE", // New projects are active by default
            creatorId: userId, // Current user is the creator
            creator: {
              name: "Вы", // Current user is the creator
              email: "", // We don't need email here
            },
            _count: {
              ...newProject._count,
              overdueTasks: 0, // New projects have no overdue tasks
            },
          }
          setProjects(prev => [...prev, fullProject])
          setShowCreateModal(false)
        }}
      />
    </div>
  )
}
