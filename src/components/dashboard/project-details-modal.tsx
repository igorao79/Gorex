"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
    overdueTasks: number
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
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [emailValid, setEmailValid] = useState<boolean | null>(null)
  const [emailUser, setEmailUser] = useState<{name: string | null, email: string} | null>(null)
  const [isLoadingMembers, setIsLoadingMembers] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(project.name)
  const [editDescription, setEditDescription] = useState(project.description || "")
  const [isUpdating, setIsUpdating] = useState(false)
  const [userTarif, setUserTarif] = useState<string | null>(null)

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

  const fetchUserTarif = useCallback(async () => {
    try {
      const response = await fetch('/api/user/tarif')
      if (response.ok) {
        const data = await response.json()
        setUserTarif(data.tarif)
      }
    } catch (error) {
      console.error('Error fetching user tarif:', error)
    }
  }, [])

  const checkEmail = useCallback(async (email: string) => {
    if (!email || !email.includes('@')) {
      setEmailValid(null)
      setEmailUser(null)
      return
    }

    // Проверяем, не является ли пользователь уже участником проекта
    const isAlreadyMember = members.some(member => member.user.email.toLowerCase() === email.toLowerCase())

    if (isAlreadyMember) {
      setEmailValid(false)
      setEmailUser(null)
      setIsCheckingEmail(false)
      return
    }

    setIsCheckingEmail(true)
    try {
      const response = await fetch('/api/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setEmailValid(data.exists)
        setEmailUser(data.exists ? data.user : null)
      } else {
        setEmailValid(false)
        setEmailUser(null)
      }
    } catch (error) {
      console.error('Error checking email:', error)
      setEmailValid(false)
      setEmailUser(null)
    } finally {
      setIsCheckingEmail(false)
    }
  }, [members])

  const handleEmailChange = (email: string) => {
    setInviteEmail(email)
    setInviteError("")
    setEmailValid(null)
    setEmailUser(null)

    // Debounced email check - wait 1.5 seconds after user stops typing
    const timeoutId = setTimeout(() => checkEmail(email), 1500)
    return () => clearTimeout(timeoutId)
  }

  useEffect(() => {
    if (isOpen) {
      setProjectStatus(project.status)
      setEditName(project.name)
      setEditDescription(project.description || "")
      fetchMembers()
      fetchUserTarif()
    }
  }, [isOpen, project.id, project.name, project.description, project.status, fetchMembers, fetchUserTarif])

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
        // Уведомляем о создании уведомления
        console.log('Dispatching notifications-update event from project-details-modal')
        window.dispatchEvent(new CustomEvent('notifications-update'))
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

  // Проверяем лимит участников
  const getMemberLimit = () => {
    if (!userTarif) return 5
    const limits = {
      free: 5,
      prof: 25,
      corp: Infinity
    }
    return limits[userTarif as keyof typeof limits] || 5
  }

  const memberLimit = getMemberLimit()
  const isAtLimit = project._count.members >= memberLimit

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto sm:max-w-[600px] md:max-w-[800px] md:max-h-[800px] lg:max-w-[900px] lg:max-h-[85vh] p-3 sm:p-4 md:p-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Left Column: Project Stats */}
          <div>
            <h3 className="text-base md:text-lg font-heading mb-3 md:mb-4">Статистика проекта</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-2 md:gap-2 lg:gap-3">
            <div className="bg-muted/30 rounded-lg p-2 md:p-3">
              <div className="text-xs text-muted-foreground mb-1">Участники</div>
              <div className="text-base md:text-lg font-semibold">{project._count.members}</div>
              {userTarif && (
                <div className="text-xs text-muted-foreground mt-1">
                  {(() => {
                    const limits = {
                      free: 5,
                      prof: 25,
                      corp: '∞'
                    }
                    const limit = limits[userTarif as keyof typeof limits] || 5
                    const current = project._count.members
                    const isNearLimit = typeof limit === 'number' && current >= limit * 0.8

                    return (
                      <span className={isNearLimit ? 'text-yellow-600' : ''}>
                        {current}/{limit}
                      </span>
                    )
                  })()}
                </div>
              )}
            </div>
            <div className="bg-muted/30 rounded-lg p-2 md:p-3">
              <div className="text-xs text-muted-foreground mb-1">Задачи</div>
              <div className="text-lg font-semibold">{getTasksText(project._count.tasks)}</div>
              {project._count.overdueTasks > 0 && (
                <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  {project._count.overdueTasks} просрочено
                </div>
              )}
            </div>

            {/* Status - показывается только на больших экранах */}
            <div className="hidden lg:block bg-muted/30 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Статус</div>
              <div className="text-sm font-medium">{project.status === 'ACTIVE' ? 'Активный' : project.status === 'COMPLETED' ? 'Завершен' : 'Архивирован'}</div>
            </div>

            {/* Created date - показывается только на больших экранах */}
            <div className="hidden lg:block bg-muted/30 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Создан</div>
              <div className="text-sm font-medium">{new Date(project.createdAt).toLocaleDateString("ru-RU")}</div>
            </div>
          </div>
          </div>

          {/* Right Column: Project Management */}
          <div className="space-y-4">
            {/* Project Status */}
          {isAdmin && (
            <div>
              <h3 className="text-base md:text-lg font-heading mb-3 md:mb-4 flex items-center">
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
              <div className="max-h-24 md:max-h-32 overflow-y-auto space-y-2">
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
                            <span className="sm:inline md:hidden">Админ</span>
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3 mr-1" />
                            <span className="sm:inline md:hidden">Участник</span>
                          </>
                        )}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground/70 sm:inline md:hidden">
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
              <h3 className="text-base md:text-lg font-heading mb-3 md:mb-4 flex items-center">
                <Mail className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="truncate">Пригласить участника</span>
              </h3>

              {isAtLimit ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Достигнут лимит участников ({project._count.members}/{memberLimit}).
                    {userTarif === 'free' && (
                      <>
                        {' '}
                        <Button
                          variant="link"
                          className="p-0 h-auto text-yellow-800 underline"
                          onClick={() => window.location.href = '/pricing'}
                        >
                          Обновитесь до Pro
                        </Button>
                        {' '}для большего количества участников.
                      </>
                    )}
                    {userTarif === 'prof' && (
                      <> Свяжитесь с поддержкой для увеличения лимита.</>
                    )}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleInvite} className="space-y-4">
                  <div className="space-y-4">
                    <Label htmlFor="invite-email">Email пользователя</Label>
                    <div className="flex gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="relative">
                          <Input
                            id="invite-email"
                            type="email"
                            placeholder="user@example.com"
                            value={inviteEmail}
                            onChange={(e) => handleEmailChange(e.target.value)}
                            required
                            className={`${emailValid === false ? 'border-red-500 focus:border-red-500' : emailValid === true ? 'border-green-500 focus:border-green-500' : ''}`}
                          />
                          {isCheckingEmail && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                            </div>
                          )}
                          {!isCheckingEmail && emailValid !== null && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              {emailValid ? (
                                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              ) : (
                                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414l-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 011.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {/* Фиксированная высота для сообщений валидации */}
                        <div className="h-5 mt-1 overflow-hidden">
                          {emailValid === false && (
                            <p className="text-sm text-red-600 leading-tight">
                              {(() => {
                                const isAlreadyMember = members.some(member => member.user.email.toLowerCase() === inviteEmail.toLowerCase())
                                return isAlreadyMember
                                  ? "Этот пользователь уже является участником проекта"
                                  : "Пользователь с таким email не найден"
                              })()}
                            </p>
                          )}
                          {emailValid === true && emailUser && (
                            <p className="text-sm text-green-600 leading-tight">
                              Найден: {emailUser.name || emailUser.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={isInviting || emailValid !== true}
                        className="whitespace-nowrap"
                      >
                        {isInviting ? "Приглашение..." : "Пригласить"}
                      </Button>
                    </div>
                  </div>
                  {inviteError && (
                    <p className="text-sm text-red-600">{inviteError}</p>
                  )}
                </form>
              )}
            </div>
          )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
