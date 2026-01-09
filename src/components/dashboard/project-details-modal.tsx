"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Users, Mail, Crown, User, Settings, X, Edit, Check, X as XIcon } from "lucide-react"

interface Project {
  id: string
  name: string
  description: string | null
  status: "ACTIVE" | "COMPLETED" | "ARCHIVED"
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

interface ProjectMember {
  id: string
  role: string
  joinedAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
}

interface ProjectDetailsModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
  userId: string
  onUpdate: () => void
  onMemberCountChange?: (newCount: number) => void
}

export function ProjectDetailsModal({
  project,
  isOpen,
  onClose,
  userId,
  onUpdate,
  onMemberCountChange
}: ProjectDetailsModalProps) {
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [projectStatus, setProjectStatus] = useState(project.status)
  const [inviteEmail, setInviteEmail] = useState("")
  const [isInviting, setIsInviting] = useState(false)
  const [inviteError, setInviteError] = useState("")
  const [isLoadingMembers, setIsLoadingMembers] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(project.name)
  const [editDescription, setEditDescription] = useState(project.description || "")
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchMembers = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}/members`)
      if (response.ok) {
        const membersData = await response.json()
        setMembers(membersData)
      }
    } catch (error) {
      console.error("Error fetching members:", error)
    } finally {
      setIsLoadingMembers(false)
    }
  }, [project.id])

  useEffect(() => {
    if (isOpen) {
      setProjectStatus(project.status)
      setEditName(project.name)
      setEditDescription(project.description || "")
      fetchMembers()
    }
  }, [isOpen, project.id, project.name, project.description, project.status, fetchMembers])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setIsInviting(true)
    setInviteError("")

    try {
      const response = await fetch(`/api/projects/${project.id}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: inviteEmail.trim(),
        }),
      })

      if (response.ok) {
        const newMember = await response.json()
        setMembers(prev => [...prev, newMember])
        setInviteEmail("")
        onUpdate() // Refresh projects list
        onMemberCountChange?.(members.length + 1) // Update member count immediately
      } else {
        const error = await response.json()
        setInviteError(error.error || "Ошибка при приглашении")
      }
    } catch {
      setInviteError("Произошла ошибка при приглашении")
    } finally {
      setIsInviting(false)
    }
  }

  const handleStatusChange = async (newStatus: "ACTIVE" | "COMPLETED" | "ARCHIVED") => {
    try {
      const response = await fetch(`/api/projects/${project.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setProjectStatus(newStatus)
        onUpdate() // Refresh projects list
      } else {
      }
    } catch (error) {
      console.error("Error updating project status:", error)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/projects/${project.id}/members?memberId=${memberId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Обновляем список участников
        await fetchMembers()
        onMemberCountChange?.(members.length - 1) // Update member count immediately
      }
    } catch (error) {
      console.error("Error updating project status:", error)
    }
  }

  const handleEditProject = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim() || null,
        }),
      })

      if (response.ok) {
        setIsEditing(false)
        onUpdate() // Refresh projects list
      } else {
        const error = await response.json()
        console.error("Error updating project:", error)
      }
    } catch (error) {
      console.error("Error updating project:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancelEdit = () => {
    setEditName(project.name)
    setEditDescription(project.description || "")
    setIsEditing(false)
  }

  const isAdmin = members.some(member =>
    member.user.id === userId && member.role === "admin"
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[85vh] overflow-y-auto sm:w-full">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Название проекта"
                    className="text-lg font-semibold"
                  />
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Описание проекта"
                    rows={2}
                    className="text-sm text-muted-foreground resize-none"
                  />
                </div>
              ) : (
                <div>
                  <DialogTitle className="flex items-center gap-2">
                    {project.name}
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="h-6 w-6 p-0 hover:bg-muted"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                  </DialogTitle>
                  <DialogDescription>
                    {project.description || "Описание проекта отсутствует"}
                  </DialogDescription>
                </div>
              )}
            </div>
            {isEditing && (
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditProject}
                  disabled={isUpdating || !editName.trim()}
                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Участники</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{project._count.members}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Задачи</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{project._count.tasks}</div>
              </CardContent>
            </Card>
          </div>

          {/* Project Status */}
          {isAdmin && (
            <div>
              <h3 className="text-lg font-heading mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="truncate">Статус проекта</span>
              </h3>
              <div className="space-y-2">
                <Label htmlFor="project-status">Статус</Label>
                <Select value={projectStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Активный</SelectItem>
                    <SelectItem value="COMPLETED">Завершен</SelectItem>
                    <SelectItem value="ARCHIVED">Архивирован</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Members List */}
          <div>
            <h3 className="text-lg font-heading mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="truncate">Участники проекта</span>
            </h3>

            {isLoadingMembers ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 animate-pulse">
                    <div className="w-8 h-8 bg-muted rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-32"></div>
                      <div className="h-3 bg-muted rounded w-48 mt-1"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <div key={member.id} className="flex flex-col gap-2 p-3 rounded-lg bg-muted/30 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {member.user.name?.charAt(0) || member.user.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">
                          {member.user.name || "Без имени"}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">{member.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 sm:justify-end">
                      <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                        {member.role === "admin" ? (
                          <>
                            <Crown className="w-3 h-3 mr-1" />
                            Админ
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3 mr-1" />
                            Участник
                          </>
                        )}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground/70">
                          {new Date(member.joinedAt).toLocaleDateString("ru-RU")}
                        </span>
                        {isAdmin && member.role !== "admin" && member.user.id !== userId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invite Form - only for admins */}
          {isAdmin && (
            <div>
              <h3 className="text-lg font-heading mb-4 flex items-center">
                <Mail className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="truncate">Пригласить участника</span>
              </h3>

              <form onSubmit={handleInvite} className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
                  <div className="flex-1">
                    <Label htmlFor="invite-email" className="mb-2 block">Email пользователя</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="user@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" disabled={isInviting} className="w-full sm:w-auto">
                      {isInviting ? "Приглашение..." : "Пригласить"}
                    </Button>
                  </div>
                </div>
                {inviteError && (
                  <p className="text-sm text-red-600">{inviteError}</p>
                )}
              </form>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
