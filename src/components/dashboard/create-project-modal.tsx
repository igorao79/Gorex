"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface CreatedProject {
  id: string
  name: string
  description: string | null
  createdAt: string
  _count: {
    members: number
    tasks: number
  }
}

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onProjectCreated: (project: CreatedProject) => void
}

export function CreateProjectModal({ isOpen, onClose, userId, onProjectCreated }: CreateProjectModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("Название проекта обязательно")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      })

      if (!response.ok) {
        throw new Error("Не удалось создать проект")
      }

      const newProject = await response.json()

      // Форматируем проект для соответствия интерфейсу
      const formattedProject: Project = {
        id: newProject.id,
        name: newProject.name,
        description: newProject.description,
        createdAt: newProject.createdAt,
        _count: {
          members: 1, // Creator is automatically a member
          tasks: 0,
        },
      }

      onProjectCreated(formattedProject)
      setName("")
      setDescription("")
    } catch (error) {
      console.error("Error creating project:", error)
      setError("Произошла ошибка при создании проекта")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Создать новый проект</DialogTitle>
          <DialogDescription>
            Создайте проект для организации задач вашей команды
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Название проекта</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Мой новый проект"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Описание (необязательно)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Краткое описание проекта..."
                rows={3}
              />
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Создание..." : "Создать проект"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
