"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
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

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  members: ProjectMember[]
  onTaskCreated: (task: Task) => void
}

export function CreateTaskModal({
  isOpen,
  onClose,
  projectId,
  members,
  onTaskCreated
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM")
  const [assigneeId, setAssigneeId] = useState<string>("")
  const [deadline, setDeadline] = useState<Date>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          assigneeId: assigneeId || undefined,
          deadline: deadline?.toISOString(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        onTaskCreated(data)
        onClose()
        // Reset form
        setTitle("")
        setDescription("")
        setPriority("MEDIUM")
        setAssigneeId("")
        setDeadline(undefined)
      } else {
      }
    } catch (error) {
      console.error("Error creating task:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Создать задачу</DialogTitle>
          <DialogDescription className="font-sans">
            Заполните информацию о новой задаче
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Описание задачи (необязательно)"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Приоритет</Label>
              <Select value={priority} onValueChange={(value: "LOW" | "MEDIUM" | "HIGH" | "URGENT") => setPriority(value)}>
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label>Исполнитель</Label>
              <Select value={assigneeId || "none"} onValueChange={(value) => setAssigneeId(value === "none" ? "" : value)}>
                <SelectTrigger>
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
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting || !title.trim()} className="w-full">
              {isSubmitting ? "Создание..." : "Создать задачу"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="w-full">
              Отмена
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
