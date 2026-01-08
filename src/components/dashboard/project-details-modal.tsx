"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Mail, Crown, User } from "lucide-react"

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
}

export function ProjectDetailsModal({
  project,
  isOpen,
  onClose,
  userId,
  onUpdate
}: ProjectDetailsModalProps) {
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [inviteEmail, setInviteEmail] = useState("")
  const [isInviting, setIsInviting] = useState(false)
  const [inviteError, setInviteError] = useState("")
  const [isLoadingMembers, setIsLoadingMembers] = useState(true)

  useEffect(() => {
    if (isOpen) {
      fetchMembers()
    }
  }, [isOpen, project.id])

  const fetchMembers = async () => {
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
  }

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
      } else {
        const error = await response.json()
        setInviteError(error.error || "Ошибка при приглашении")
      }
    } catch (error) {
      console.error("Error inviting member:", error)
      setInviteError("Произошла ошибка при приглашении")
    } finally {
      setIsInviting(false)
    }
  }

  const isAdmin = members.some(member =>
    member.user.id === userId && member.role === "admin"
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project.name}</DialogTitle>
          <DialogDescription>
            {project.description || "Описание проекта отсутствует"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Stats */}
          <div className="grid grid-cols-2 gap-4">
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

          {/* Members List */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Участники проекта
            </h3>

            {isLoadingMembers ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 animate-pulse">
                    <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-slate-200 rounded w-32"></div>
                      <div className="h-3 bg-slate-200 rounded w-48 mt-1"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {member.user.name?.charAt(0) || member.user.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {member.user.name || "Без имени"}
                        </p>
                        <p className="text-sm text-slate-600">{member.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
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
                      <span className="text-xs text-slate-500">
                        {new Date(member.joinedAt).toLocaleDateString("ru-RU")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invite Form - only for admins */}
          {isAdmin && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Пригласить участника
              </h3>

              <form onSubmit={handleInvite} className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="invite-email">Email пользователя</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="user@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" disabled={isInviting}>
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
