"use client"

import { useState, useRef, useEffect } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToSignUp: () => void
}

export function SignInModal({ isOpen, onClose, onSwitchToSignUp }: SignInModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  const [emailMessageType, setEmailMessageType] = useState<"error" | "">("")
  const emailTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Очищаем состояния при закрытии модального окна
  useEffect(() => {
    if (!isOpen) {
      if (emailTimeoutRef.current) {
        clearTimeout(emailTimeoutRef.current)
        emailTimeoutRef.current = null
      }
      // Сбрасываем состояния и поля формы
      setEmail("")
      setPassword("")
      setError("")
      setEmailMessage("")
      setEmailMessageType("")
    }
  }, [isOpen])

  // Валидация формата email
  const validateEmailFormat = (emailValue: string) => {
    if (!emailValue.trim()) {
      setEmailMessage("")
      setEmailMessageType("")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailValue.trim())) {
      setEmailMessage("Неверный формат email")
      setEmailMessageType("error")
    } else {
      setEmailMessage("")
      setEmailMessageType("")
    }
  }

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail)
    setError("")
    // Очищаем сообщения валидации email при новом вводе
    setEmailMessage("")
    setEmailMessageType("")

    // Очищаем предыдущий таймаут
    if (emailTimeoutRef.current) {
      clearTimeout(emailTimeoutRef.current)
    }

    // Устанавливаем новую задержку 1.5 секунды
    emailTimeoutRef.current = setTimeout(() => {
      if (newEmail.trim()) {
        validateEmailFormat(newEmail)
      } else {
        setEmailMessage("")
        setEmailMessageType("")
      }
    }, 1500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Проверяем формат email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError("Введите корректный email")
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Неверный email или пароль")
      } else {
        onClose()
        // Перенаправляем на dashboard после успешного входа
        window.location.href = "/dashboard"
      }
    } catch {
      setError("Произошла ошибка при входе")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Вход в Gorex</DialogTitle>
          <DialogDescription>
            Войдите в свой аккаунт для продолжения
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-red-600">
              ✗ {error}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              required
              className="w-full"
            />
            {emailMessage && emailMessageType && (
              <p className={`text-sm ${
                emailMessageType === "error" ? "text-red-600" : "text-muted-foreground"
              }`}>
                {emailMessageType === "error" && "✗ "}
                {emailMessage}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onSwitchToSignUp}
              className="text-sm"
            >
              Нет аккаунта? Зарегистрироваться
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 sm:flex-initial">
              {isLoading ? "Вход..." : "Войти"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
