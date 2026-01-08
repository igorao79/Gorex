"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Save, User } from "lucide-react"
import { NotificationModal } from "@/components/ui/notification-modal"

// import { toast } from "sonner" // Removed unused import

interface UserProfile {
  id: string
  name: string
  email: string
  image?: string | null
  createdAt: string
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
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

  useEffect(() => {
    if (status === "loading") return
    if (!session?.user) {
      redirect("/")
      return
    }

    fetchProfile()
  }, [session, status])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile")
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFormData(prev => ({ ...prev, name: data.name || "" }))
      } else {
        setNotification({
          isOpen: true,
          type: "error",
          title: "Ошибка",
          message: "Ошибка при загрузке профиля"
        })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      setNotification({
        isOpen: true,
        type: "error",
        title: "Ошибка",
        message: "Ошибка при загрузке профиля"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    setErrors({})

    // Валидация
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Имя обязательно"
    }

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = "Текущий пароль обязателен для смены пароля"
      }
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = "Пароль должен содержать минимум 6 символов"
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Пароли не совпадают"
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsSaving(false)
      return
    }

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          currentPassword: formData.newPassword ? formData.currentPassword : undefined,
          newPassword: formData.newPassword || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setProfile(prev => prev ? { ...prev, name: formData.name.trim() } : null)
        setFormData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }))

        // Update local profile state
        setProfile(prev => prev ? { ...prev, name: formData.name.trim() } : null)

        // Update session - это вызовет JWT callback с trigger "update"
        if (session) {
          await update({
            ...session,
            user: {
              ...session.user,
              name: formData.name.trim()
            }
          })
        }

        setNotification({
          isOpen: true,
          type: "success",
          title: "Успех",
          message: "Профиль успешно обновлен"
        })
      } else {
        if (data.error.includes("пароль")) {
          setErrors({ currentPassword: data.error })
        } else {
          setNotification({
            isOpen: true,
            type: "error",
            title: "Ошибка",
            message: data.error || "Ошибка при сохранении профиля"
          })
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setNotification({
        isOpen: true,
        type: "error",
        title: "Ошибка",
        message: "Ошибка при сохранении профиля"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-32 mb-6"></div>
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-48"></div>
                <div className="h-4 bg-muted rounded w-64"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  if (!session?.user || !profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-heading text-foreground mb-2">
              Профиль
            </h1>
            <p className="text-muted-foreground">
              Управляйте настройками своего аккаунта
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Личная информация
              </CardTitle>
              <CardDescription>
                Обновите свои личные данные и настройки безопасности
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Аватар */}
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profile.image || ""} alt={profile.name || ""} />
                  <AvatarFallback className="text-lg">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm" disabled>
                    <Camera className="w-4 h-4 mr-2" />
                    Изменить
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Функция скоро будет доступна
                  </p>
                </div>
              </div>

              {/* Имя */}
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ваше имя"
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email нельзя изменить
                </p>
              </div>

              {/* Смена пароля */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Смена пароля</h3>

                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Текущий пароль</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Введите текущий пароль"
                  />
                  {errors.currentPassword && <p className="text-sm text-destructive">{errors.currentPassword}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Новый пароль</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Введите новый пароль"
                  />
                  {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Подтверждение пароля</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Повторите новый пароль"
                  />
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Сохранение..." : "Сохранить изменения"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </div>
  )
}
    