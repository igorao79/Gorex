"use client"

import { useState, useRef, useEffect } from "react"
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
  const [emailMessage, setEmailMessage] = useState("")
  const [emailMessageType, setEmailMessageType] = useState<"error" | "success" | "checking" | "">("")
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
      // Сбрасываем состояния и поля формы
      setName("")
      setEmail("")
      setPassword("")
      setEmailExists(null)
      setCheckingEmail(false)
      setError("")
      setEmailMessage("")
      setEmailMessageType("")
      setSuccess("")
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

  const checkEmailExists = async (emailToCheck: string) => {
    if (!emailToCheck.trim()) return

    setCheckingEmail(true)
    setEmailMessage("")
    setEmailMessageType("")
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
        if (data.exists) {
          setEmailMessage("Email уже зарегистрирован")
          setEmailMessageType("error")
        } else {
          setEmailMessage("Email доступен")
          setEmailMessageType("success")
        }
        setError("") // Очищаем общую ошибку
      } else {
        // Ошибки валидации email показываем под полем email
        if (data.error === "Неверный формат email" || data.error === "Email уже зарегистрирован") {
          setEmailMessage(data.error)
          setEmailMessageType("error")
        } else {
          // Другие ошибки (сети, сервера) показываем в общем поле
          setError(data.error || "Ошибка проверки email")
        }
      }
    } catch (error) {
      console.error("Error checking email:", error)
      setEmailMessage("Ошибка проверки email")
      setEmailMessageType("error")
    } finally {
      setCheckingEmail(false)
    }
  }

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail)
    setError("")

    // Очищаем предыдущий таймаут
    if (emailTimeoutRef.current) {
      clearTimeout(emailTimeoutRef.current)
    }

    // Устанавливаем задержку для валидации
    emailTimeoutRef.current = setTimeout(() => {
      if (newEmail.trim()) {
        // Сначала проверяем формат локально
        validateEmailFormat(newEmail)

        // Если формат правильный, проверяем через API
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (emailRegex.test(newEmail.trim())) {
          checkEmailExists(newEmail)
        } else {
          // Формат неправильный - очищаем состояния API проверки
          setEmailExists(null)
          setCheckingEmail(false)
        }
      } else {
        setEmailMessage("")
        setEmailMessageType("")
        setEmailExists(null)
        setCheckingEmail(false)
      }
    }, 1500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    // Проверяем валидность email
    if (emailMessageType === "error") {
      setError(emailMessage)
      setIsLoading(false)
      return
    }

    if (emailMessageType === "" && email.trim() && !checkingEmail) {
      // Если проверка еще не завершена, подождем
      setError("Проверка email...")
      setIsLoading(false)
      return
    }

    if (emailMessageType !== "success" && email.trim()) {
      // Email должен быть проверен и доступен
      setError("Пожалуйста, введите корректный email")
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
        setCheckingEmail(false)
        setEmailMessage("")
        setEmailMessageType("")
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
            <p className="text-sm text-red-600">
              ✗ {error}
            </p>
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
            {emailMessage && emailMessageType && !checkingEmail && (
              <p className={`text-sm ${
                emailMessageType === "error" ? "text-red-600" :
                emailMessageType === "success" ? "text-green-600" :
                "text-muted-foreground"
              }`}>
                {emailMessageType === "error" && "✗ "}
                {emailMessageType === "success" && "✓ "}
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
