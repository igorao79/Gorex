"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
import { CalendarIcon, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { cn } from "@/lib/utils"

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

interface ProjectMember {
  id: string
  joinedAt: Date
  role: string
  userId: string
  projectId: string
  user: {
    id: string
    name: string | null
    email: string
  }
}

interface EditTaskModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task | null
  members: ProjectMember[]
  onTaskUpdated: (task?: Task) => void
  onTaskDeleted: (taskId: string) => void
}

export function EditTaskModal({
  isOpen,
  onClose,
  task,
  members,
  onTaskUpdated,
  onTaskDeleted
}: EditTaskModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<"TODO" | "IN_PROGRESS" | "REVIEW" | "DONE">("TODO")
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM")
  const [assigneeId, setAssigneeId] = useState<string>("")
  const [deadline, setDeadline] = useState<Date>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Заполняем форму данными задачи при открытии
  useEffect(() => {
    if (task && isOpen) {
      setTitle(task.title)
      setDescription(task.description || "")
      setStatus(task.status)
      setPriority(task.priority)
      setAssigneeId(task.assigneeId || "")
      setDeadline(task.deadline ? new Date(task.deadline) : undefined)
    }
  }, [task, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!task || !title.trim()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          status,
          priority,
          assigneeId: assigneeId || null,
          deadline: deadline?.toISOString(),
        }),
      })

      if (response.ok) {
        onTaskUpdated()
        onClose()
        // Уведомляем о возможном создании уведомления
        window.dispatchEvent(new CustomEvent('notifications-update'))
      } else {
      }
    } catch (error) {
      console.error("Error updating task:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!task) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onTaskDeleted(task.id)
        onClose()
      } else {
      }
    } catch (error) {
      console.error("Error deleting task:", error)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (!task) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[80vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle className="font-heading">Редактировать задачу</DialogTitle>
            <DialogDescription className="font-sans">
              Измените параметры задачи или удалите её
            </DialogDescription>
          </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название задачи"
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Описание задачи"
              rows={3}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Статус</Label>
              <Select value={status} onValueChange={(value: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE") => setStatus(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">К выполнению</SelectItem>
                  <SelectItem value="IN_PROGRESS">В работе</SelectItem>
                  <SelectItem value="REVIEW">Проверка</SelectItem>
                  <SelectItem value="DONE">Готово</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Приоритет</Label>
              <Select value={priority} onValueChange={(value: "LOW" | "MEDIUM" | "HIGH" | "URGENT") => setPriority(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Низкий</SelectItem>
                  <SelectItem value="MEDIUM">Средний</SelectItem>
                  <SelectItem value="HIGH">Высокий</SelectItem>
                  <SelectItem value="URGENT">Срочный</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Исполнитель</Label>
            <Select value={assigneeId || "none"} onValueChange={(value) => setAssigneeId(value === "none" ? "" : value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Не назначен" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Не назначен</SelectItem>
                {members.map((member) => (
                  <SelectItem key={member.userId} value={member.userId}>
                    {member.user.name || member.user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Дедлайн</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !deadline && "text-muted-foreground"
                  )}
                  type="button"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? (
                    format(deadline, "PPP", { locale: ru })
                  ) : (
                    <span>Выберите дату</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  initialFocus
                  disabled={(date) => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    return date < today
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Удалить задачу
            </Button>
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
                Отмена
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          </div>
        </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить задачу</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить задачу &quot;{title}&quot;?
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Удаление..." : "Удалить задачу"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
