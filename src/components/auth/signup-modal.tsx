"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SignUpModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToSignIn: () => void
}

export function SignUpModal({ isOpen, onClose, onSwitchToSignIn }: SignUpModalProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [emailExists, setEmailExists] = useState<boolean | null>(null)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const emailTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Очищаем timeout при закрытии модального окна
  useEffect(() => {
    if (!isOpen) {
      if (emailTimeoutRef.current) {
        clearTimeout(emailTimeoutRef.current)
        emailTimeoutRef.current = null
      }
      // Сбрасываем состояния
      setEmailExists(null)
      setCheckingEmail(false)
      setError("")
      setSuccess("")
    }
  }, [isOpen])

  const checkEmailExists = async (emailToCheck: string) => {
    if (!emailToCheck.trim()) return

    setCheckingEmail(true)
    try {
      const response = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailToCheck }),
      })

      const data = await response.json()

      if (response.ok) {
        setEmailExists(data.exists)
        if (data.exists) {
          setError("Этот email уже зарегистрирован")
        } else {
          setError("")
        }
      } else {
        setError(data.error || "Ошибка проверки email")
      }
    } catch (error) {
      console.error("Error checking email:", error)
      setError("Ошибка проверки email")
    } finally {
      setCheckingEmail(false)
    }
  }

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail)
    setEmailExists(null)
    setError("")

    // Проверяем email с небольшой задержкой
    if (emailTimeoutRef.current) {
      clearTimeout(emailTimeoutRef.current)
    }

    emailTimeoutRef.current = setTimeout(() => {
      if (newEmail.trim()) {
        checkEmailExists(newEmail)
      }
    }, 500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    // Проверяем, что email не существует
    if (emailExists === true) {
      setError("Этот email уже зарегистрирован")
      setIsLoading(false)
      return
    }

    if (emailExists === null && email.trim()) {
      // Если проверка еще не завершена, подождем
      setError("Проверка email...")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message || "Регистрация успешна! Теперь войдите в систему.")
        // Очищаем поля формы после успешной регистрации
        setName("")
        setEmail("")
        setPassword("")
        setEmailExists(null)
        setCheckingEmail(false)
        onClose()
        onSwitchToSignIn()
      } else {
        setError(data.error || "Ошибка регистрации")
      }
    } catch (error) {
      console.error("Error registering user:", error)
      setError("Произошла ошибка при регистрации")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Регистрация в Gorex</DialogTitle>
          <DialogDescription>
            Создайте аккаунт для начала работы
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Имя</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full"
            />
          </div>

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
            {checkingEmail && (
              <p className="text-sm text-muted-foreground">Проверка email...</p>
            )}
            {emailExists === false && email.trim() && (
              <p className="text-sm text-green-600">✓ Email доступен</p>
            )}
            {emailExists === true && (
              <p className="text-sm text-red-600">✗ Email уже зарегистрирован</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onSwitchToSignIn}
              className="text-sm w-full sm:w-auto"
            >
              Уже есть аккаунт? Войти
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 sm:flex-initial">
              {isLoading ? "Регистрация..." : "Зарегистрироваться"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
