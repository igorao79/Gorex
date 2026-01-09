"use client"

import { useDraggable } from "@dnd-kit/core"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar, AlertTriangle, User, MoreVertical, Edit, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

interface Task {
  id: string
  title: string
  description: string | null
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  deadline: Date | null
  creatorId: string
  assigneeId: string | null
  projectId: string
  createdAt: Date
  updatedAt: Date
  creator: {
    id: string
    name: string | null
    email: string
  }
  assignee: {
    id: string
    name: string | null
    email: string
  } | null
}

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "URGENT":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800"
    case "HIGH":
      return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-800"
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800"
    case "LOW":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-800"
  }
}

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case "URGENT":
    case "HIGH":
      return <AlertTriangle className="w-3 h-3" />
    default:
      return null
  }
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== "DONE"

  // Проверяем, является ли дедлайн завтрашним днем
  const isTomorrow = task.deadline && (() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Сбрасываем время до начала дня
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1) // Добавляем один день

    const deadlineDate = new Date(task.deadline)
    deadlineDate.setHours(0, 0, 0, 0) // Сбрасываем время дедлайна

    return deadlineDate.getTime() === tomorrow.getTime() && task.status !== "DONE"
  })()

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`
        cursor-grab active:cursor-grabbing transition-all duration-300 ease-out hover:shadow-md
        ${isDragging ? "opacity-50 shadow-lg rotate-2 scale-105" : ""}
        ${isOverdue ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950" : ""}
      `}
      suppressHydrationWarning
      {...listeners}
      {...attributes}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm leading-tight line-clamp-2">
            {task.title}
          </h4>
          <div className="flex items-center gap-2">
            <Badge
              className={`text-xs px-2 py-0.5 border ${getPriorityColor(task.priority)}`}
            >
              <div className="flex items-center gap-1">
                {getPriorityIcon(task.priority)}
                {task.priority === "URGENT" ? "Срочно" :
                 task.priority === "HIGH" ? "Высокий" :
                 task.priority === "MEDIUM" ? "Средний" : "Низкий"}
              </div>
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(task)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Редактировать
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete?.(task.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {task.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {task.assignee ? (
              <div className="flex items-center gap-1">
                <Avatar className="w-5 h-5">
                  <AvatarFallback className="text-xs">
                    {task.assignee.name?.charAt(0)?.toUpperCase() || task.assignee.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  {task.assignee.name || task.assignee.email}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-muted-foreground">
                <User className="w-3 h-3" />
                <span className="text-xs">Не назначен</span>
              </div>
            )}
          </div>

          {task.deadline && (
            <div className={`flex items-center gap-1 text-xs ${isOverdue || isTomorrow ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
              <Calendar className="w-3 h-3" />
              {format(new Date(task.deadline), "dd.MM", { locale: ru })}
            </div>
          )}
        </div>
        </CardContent>
    </Card>
  )
}
