"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, Settings, Trash2, AlertTriangle } from "lucide-react"
import { ProjectDetailsModal } from "./project-details-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { NotificationModal } from "@/components/ui/notification-modal"

// Функция для правильного склонения слова "участник"
function getMembersText(count: number): string {
  if (count % 10 === 1 && count % 100 !== 11) {
    return `${count} участник`
  } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return `${count} участника`
  } else {
    return `${count} участников`
  }
}

// Функция для правильного склонения слова "задача"
function getTasksText(count: number): string {
  if (count % 10 === 1 && count % 100 !== 11) {
    return `${count} задача`
  } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return `${count} задачи`
  } else {
    return `${count} задач`
  }
}

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

interface ProjectCardProps {
  project: Project
  userId: string
  onUpdate: () => void
  onMemberCountChange?: (projectId: string, newCount: number) => void
}

export function ProjectCard({ project, userId, onUpdate, onMemberCountChange }: ProjectCardProps) {

  const [showDetails, setShowDetails] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [notification, setNotification] = useState<{
    isOpen: boolean
    type: "success" | "error" | "warning" | "info"
    title: string
    message: string
  }>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  })

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onUpdate() // Refresh the projects list
      } else {
        const error = await response.json()
        setNotification({
          isOpen: true,
          type: "error",
          title: "Ошибка",
          message: "Ошибка при удалении проекта: " + error.error
        })
      }
    } catch (error) {
      console.error("Error deleting project:", error)
      setNotification({
        isOpen: true,
        type: "error",
        title: "Ошибка",
        message: "Произошла ошибка при удалении проекта"
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

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
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {getMembersText(project._count.members)}
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(project.createdAt).toLocaleDateString("ru-RU")}
            </div>
          </div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {getTasksText(project._count.tasks)}
              </Badge>
              {project._count.overdueTasks > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {project._count.overdueTasks} просрочено
                </Badge>
              )}
              <Badge
                variant={project.status === "ACTIVE" ? "default" : project.status === "COMPLETED" ? "secondary" : "outline"}
                className={
                  project.status === "ACTIVE" ? "bg-green-100 text-green-800" :
                  project.status === "COMPLETED" ? "bg-blue-100 text-blue-800" :
                  "bg-gray-100 text-gray-800"
                }
              >
                {project.status === "ACTIVE" ? "Активный" :
                 project.status === "COMPLETED" ? "Завершен" :
                 "Архивирован"}
              </Badge>
            </div>
            {project.creatorId === userId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowDetails(true)}>
              <Settings className="w-4 h-4 mr-1" />
              Управление
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/dashboard/projects/${project.id}`}>
                Открыть
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <ProjectDetailsModal
        project={project}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        userId={userId}
        onUpdate={onUpdate}
        onMemberCountChange={(newCount) => onMemberCountChange?.(project.id, newCount)}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={(open: boolean) => {
        if (!isDeleting) {
          setShowDeleteDialog(open)
        }
      }}>
        <AlertDialogContent className="sm:max-w-[425px] border-destructive/20">
          <AlertDialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <AlertDialogTitle className="text-left">Удалить проект</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left text-muted-foreground">
              Вы уверены, что хотите удалить проект <strong>&quot;{project.name}&quot;</strong>?
              <br />
              <span className="text-sm text-destructive/80 mt-2 block">
                Это действие нельзя отменить. Все задачи и участники будут удалены.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel
              disabled={isDeleting}
            >
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium"
            >
              {isDeleting ? "Удаление..." : "Удалить проект"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </>
  )
}
