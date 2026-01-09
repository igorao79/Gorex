"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Link } from "next-view-transitions"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LogIn, Bell, X } from "lucide-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ModeToggle } from "@/components/mode-toggle"
import { ContactModal } from "@/components/ui/contact-modal"
import { SignInModal } from "@/components/auth/signin-modal"
import { SignUpModal } from "@/components/auth/signup-modal"

export function Header() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [currentTarif, setCurrentTarif] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<{id: string, message: string, type: string, createdAt: string}[]>([])
  const prevUserIdRef = useRef<string | null>(null)

  // Управление скроллом body при открытии/закрытии мобильного меню
  useEffect(() => {
    if (mobileMenuOpen) {
      // Блокируем скролл при открытии меню
      document.body.style.overflow = 'hidden'
    } else {
      // Восстанавливаем скролл при закрытии меню
      document.body.style.overflow = 'unset'
    }

    // Очистка при размонтировании компонента
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])



  const handleSignOut = async () => {
    await signOut({ redirect: false })
    // Сессия обновится автоматически через SessionProvider
  }

  // Получение текущего тарифа пользователя
  const fetchCurrentTarif = useCallback(async () => {
    if (!session?.user) return

    try {
      const response = await fetch('/api/user/tarif')
      if (response.ok) {
        const data = await response.json()
        setCurrentTarif(data.tarif)
      }
    } catch (error) {
      console.error('Error fetching user tarif:', error)
    }
  }, [session?.user])


  // Обновление тарифа без полного обновления сессии
  const handleTarifUpdate = useCallback(() => {
    fetchCurrentTarif()
  }, [fetchCurrentTarif])

  // Handle modal events and session updates
  useEffect(() => {
    const handleOpenContact = () => {
      if (session?.user) {
        setShowContact(true)
      } else {
        setShowSignIn(true)
      }
    }

    const handleOpenSignIn = () => {
      setShowSignIn(true)
    }

    const handleOpenSignUp = () => {
      setShowSignUp(true)
    }

    window.addEventListener('open-contact-modal', handleOpenContact)
    window.addEventListener('open-signin-modal', handleOpenSignIn)
    window.addEventListener('open-signup-modal', handleOpenSignUp)
    window.addEventListener('session-update', handleTarifUpdate)

    return () => {
      window.removeEventListener('open-contact-modal', handleOpenContact)
      window.removeEventListener('open-signin-modal', handleOpenSignIn)
      window.removeEventListener('open-signup-modal', handleOpenSignUp)
      window.removeEventListener('session-update', handleTarifUpdate)
    }
  }, [session?.user, handleTarifUpdate])

  // Загружаем тариф при изменении сессии
  useEffect(() => {
    const currentUserId = session?.user?.id || null

    if (currentUserId !== prevUserIdRef.current) {
      prevUserIdRef.current = currentUserId

      if (currentUserId) {
        // Получаем тариф
        fetch('/api/user/tarif')
          .then(response => response.ok ? response.json() : null)
          .then(data => {
            if (data) setCurrentTarif(data.tarif)
          })
          .catch(error => console.error('Error fetching user tarif:', error))

        // Получаем уведомления
        fetch('/api/user/notifications')
          .then(response => response.ok ? response.json() : [])
          .then(data => setNotifications(data))
          .catch(error => console.error('Error fetching notifications:', error))
      } else {
        // Используем setTimeout для избежания cascading renders
        setTimeout(() => {
          setCurrentTarif(null)
          setNotifications([])
        }, 0)
      }
    }
  }, [session?.user?.id])

  const switchToSignUp = () => {
    setShowSignIn(false)
    setShowSignUp(true)
  }

  const switchToSignIn = () => {
    setShowSignUp(false)
    setShowSignIn(true)
  }


  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm overflow-x-hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between min-w-0">
            <Link href="/" className="text-2xl font-heading text-foreground">
              Gorex
            </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {!session?.user ? (
              <>
                <Link
                  href="/features"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Возможности
                </Link>
                <Link
                  href="/pricing"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Тарифы
                </Link>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  О нас
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
            )}
          </nav>

              {/* Mobile Navigation */}
            <div className="flex items-center space-x-1">
              {/* Mobile Menu Button (Pill Nav Style) */}
              <div suppressHydrationWarning>
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild suppressHydrationWarning>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden rounded-full px-3 py-2 transition-colors"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="top" className="w-full max-w-none border-0 bg-background/95 backdrop-blur-sm">
                  <VisuallyHidden>
                    <DialogTitle>Мобильное меню навигации</DialogTitle>
                  </VisuallyHidden>
                  <VisuallyHidden>
                    <DialogDescription>
                      Навигационное меню для мобильных устройств с ссылками на разделы сайта
                    </DialogDescription>
                  </VisuallyHidden>
                  <div className="flex flex-col space-y-6 pt-8">
                    <div className="flex items-center justify-center mb-4">
                      <Link href="/" className="text-2xl font-heading text-foreground" onClick={() => setMobileMenuOpen(false)}>
                        Gorex
                      </Link>
                    </div>
                    <nav className="flex flex-col space-y-4">
                      {!session?.user ? (
                        <>
                          <Link
                            href="/features"
                            className="text-lg text-muted-foreground hover:text-foreground transition-colors py-3 px-4 rounded-lg hover:bg-muted"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Возможности
                          </Link>
                          <Link
                            href="/pricing"
                            className="text-lg text-muted-foreground hover:text-foreground transition-colors py-3 px-4 rounded-lg hover:bg-muted"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Тарифы
                          </Link>
                          <Link
                            href="/about"
                            className="text-lg text-muted-foreground hover:text-foreground transition-colors py-3 px-4 rounded-lg hover:bg-muted"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            О нас
                          </Link>
                        </>
                      ) : (
                        <Link
                          href="/dashboard"
                          className="text-lg text-muted-foreground hover:text-foreground transition-colors py-3 px-4 rounded-lg hover:bg-muted"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                      )}
                    </nav>
                    <div className="flex justify-center pt-4 border-t border-border/20 mt-6">
                      <ModeToggle />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              </div>


              {/* User Avatar / Auth Buttons */}
              {status === "loading" ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              ) : session?.user ? (
                <div className="flex items-center space-x-2">
                  <ModeToggle />

                  {/* Notifications Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="relative h-8 w-8 rounded-full hover:bg-slate-100"
                      >
                        <Bell className="h-4 w-4" />
                        {notifications.length > 0 && (
                          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                            {notifications.length > 9 ? '9+' : notifications.length}
                          </span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80" align="end" forceMount>
                      <div className="p-4 border-b">
                        <h3 className="font-semibold">Уведомления</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-muted-foreground">
                            Нет новых уведомлений
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div key={notification.id} className="p-4 border-b hover:bg-accent">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="text-sm">{notification.message}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(notification.createdAt).toLocaleString('ru-RU')}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-accent"
                                  onClick={async () => {
                                    try {
                                      const response = await fetch(`/api/user/notifications/${notification.id}`, {
                                        method: 'DELETE',
                                      })
                                      if (response.ok) {
                                        setNotifications(prev => prev.filter(n => n.id !== notification.id))
                                      }
                                    } catch (error) {
                                      console.error('Error deleting notification:', error)
                                    }
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-slate-100">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                        <AvatarFallback className="text-xs">
                          {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <div className="flex items-center gap-2">
                          {session.user.name && <p className="font-medium">{session.user.name}</p>}
                          {currentTarif && (
                            <span className="text-xs bg-muted px-2 py-0.5 rounded font-medium">
                              {currentTarif === 'prof' ? 'Pro' : currentTarif === 'corp' ? 'Team' : 'Free'}
                            </span>
                          )}
                        </div>
                        {session.user.email && (
                          <p className="w-[200px] truncate text-sm text-muted-foreground">
                            {session.user.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Профиль</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      Выйти
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                </div>
              ) : (
                <>
                  {/* Desktop Auth Buttons */}
                  <div className="hidden md:flex items-center space-x-2">
                    <ModeToggle />
                    <Button variant="ghost" onClick={() => setShowSignIn(true)}>
                      Войти
                    </Button>
                    <Button onClick={() => setShowSignUp(true)}>
                      Регистрация
                    </Button>
                  </div>

                  {/* Mobile Auth Button */}
                  <div className="flex md:hidden items-center space-x-2">
                    <ModeToggle />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSignIn(true)}
                      className="rounded-full px-3 py-2 transition-colors"
                    >
                      <LogIn className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <SignInModal
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
        onSwitchToSignUp={switchToSignUp}
      />

      <SignUpModal
        isOpen={showSignUp}
        onClose={() => setShowSignUp(false)}
        onSwitchToSignIn={switchToSignIn}
      />

      <ContactModal
        isOpen={showContact}
        onClose={() => setShowContact(false)}
      />
    </>
  )
}
