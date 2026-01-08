"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, Settings } from "lucide-react"
import { ProjectDetailsModal } from "./project-details-modal"

interface Project {
  id: string
  name: string
  description: string | null
  createdAt: string
  creator: {
    name: string | null
    email: string
  }
  _count: {
    members: number
    tasks: number
  }
}

interface ProjectCardProps {
  project: Project
  userId: string
  onUpdate: () => void
}

export function ProjectCard({ project, userId, onUpdate }: ProjectCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">{project.name}</CardTitle>
          <CardDescription>
            {project.description || "Описание проекта"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {project._count.members} участников
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(project.createdAt).toLocaleDateString("ru-RU")}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Badge variant="secondary">
              {project._count.tasks} задач
            </Badge>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowDetails(true)}>
                <Settings className="w-4 h-4 mr-1" />
                Управление
              </Button>
              <Button variant="ghost" size="sm">
                Открыть
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProjectDetailsModal
        project={project}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        userId={userId}
        onUpdate={onUpdate}
      />
    </>
  )
}
