"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Calendar } from "lucide-react"

interface Project {
  id: string
  name: string
  description: string | null
  createdAt: string
  _count: {
    members: number
    tasks: number
  }
}

interface ProjectGridProps {
  userId: string
}

export function ProjectGrid({ userId }: ProjectGridProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch projects from API
    // For now, showing empty state
    setIsLoading(false)
  }, [userId])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Plus className="w-12 h-12 text-slate-400" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">
          Нет проектов
        </h2>
        <p className="text-slate-600 mb-6">
          Создайте свой первый проект для начала работы с задачами
        </p>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Создать проект
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Мои проекты</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Создать проект
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">{project.name}</CardTitle>
              <CardDescription>
                {project.description || "Описание проекта"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {project._count.members} участников
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(project.createdAt).toLocaleDateString("ru-RU")}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Badge variant="secondary">
                  {project._count.tasks} задач
                </Badge>
                <Button variant="ghost" size="sm">
                  Открыть
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
