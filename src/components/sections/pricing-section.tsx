"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { TrialSuccessModal } from "@/components/ui/trial-success-modal"

export function PricingSection() {
  const { data: session } = useSession()
  const [userTarif, setUserTarif] = useState<string | null>(null)
  const [trialModal, setTrialModal] = useState<{ isOpen: boolean; plan: 'free' | 'prof' | 'corp' }>({
    isOpen: false,
    plan: 'free'
  })

  const fetchUserTarif = useCallback(async () => {
    try {
      const response = await fetch('/api/user/tarif')
      if (response.ok) {
        const data = await response.json()
        setUserTarif(data.tarif)
      } else if (response.status === 401) {
        // User not authorized, don't show current plan
        setUserTarif(null)
      } else {
        setUserTarif(null)
      }
    } catch (error) {
      console.error('Error fetching user tarif:', error)
      setUserTarif(null)
    }
  }, [])

  const updateUserTarif = useCallback(async (newTarif: 'free' | 'prof' | 'corp') => {
    try {
      const response = await fetch('/api/user/tarif', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tarif: newTarif }),
      })

      if (response.ok) {
        const data = await response.json()
        setUserTarif(data.tarif)
        // Отправляем событие обновления сессии
        const event = new CustomEvent('session-update')
        window.dispatchEvent(event)
      } else {
      }
    } catch (error) {
      console.error('Error updating user tarif:', error)
    }
  }, [])

  useEffect(() => {
    if (session?.user?.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchUserTarif()
    } else {
      // No session, reset tarif
      setUserTarif(null)
    }
  }, [session?.user?.id, fetchUserTarif])

  const handleStartTrial = (plan: 'free' | 'prof' | 'corp') => {
    if (!session?.user) {
      // Если пользователь не авторизован, открываем модалку логина
      // Используем ту же логику, что и у кнопки "Связаться с нами"
      const event = new CustomEvent('open-contact-modal')
      window.dispatchEvent(event)
      return
    }
    setTrialModal({ isOpen: true, plan })
  }

  return (
    <section id="pricing" className="py-15 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-heading text-foreground mb-4">
            Тарифы
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Выберите подходящий тариф для вашей команды
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="border-2">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl">Free</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground/70 ml-1">/ месяц</span>
              </div>
              <p className="text-muted-foreground mt-2">Для небольших команд</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  До 5 участников
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  Неограниченное количество проектов
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  Базовая аналитика
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  Поддержка через email
                </li>
              </ul>
              {userTarif === 'free' && (
                <p className="text-center text-blue-600 font-medium mt-2">
                  Ваш текущий план
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500 relative">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
              Популярный
            </Badge>
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl">Pro</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">$9</span>
                <span className="text-muted-foreground/70 ml-1">/ месяц</span>
              </div>
              <p className="text-muted-foreground mt-2">Для растущих команд</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  До 25 участников
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  Расширенная аналитика
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  Интеграции с внешними сервисами
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  Приоритетная поддержка
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  Экспорт данных
                </li>
              </ul>
              {userTarif === 'prof' ? (
                <Button
                  className="w-full mt-6"
                  variant="outline"
                  onClick={() => updateUserTarif('free')}
                >
                  Отказаться
                </Button>
              ) : (
                <Button
                  className="w-full mt-6"
                  onClick={() => handleStartTrial('prof')}
                >
                  Начать 14 дней бесплатно
                </Button>
              )}
              {userTarif === 'prof' && (
                <p className="text-center text-blue-600 font-medium mt-2">
                  Ваш текущий план
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl">Team</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-muted-foreground/70 ml-1">/ месяц</span>
              </div>
              <p className="text-muted-foreground mt-2">Для крупных компаний</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  Неограниченное количество участников
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  Продвинутая аналитика и отчеты
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  Кастомные интеграции
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  Выделенный менеджер поддержки
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  SSO и двухфакторная аутентификация
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  SLA гарантированная доступность
                </li>
              </ul>
              {userTarif === 'corp' ? (
                <Button
                  className="w-full mt-6"
                  variant="outline"
                  onClick={() => updateUserTarif('free')}
                >
                  Отказаться
                </Button>
              ) : (
                <Button
                  className="w-full mt-6"
                  variant="outline"
                  onClick={() => {
                    const event = new CustomEvent('open-contact-modal')
                    window.dispatchEvent(event)
                  }}
                >
                  Связаться с нами
                </Button>
              )}
              {userTarif === 'corp' && (
                <p className="text-center text-blue-600 font-medium mt-2">
                  Ваш текущий план
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Все тарифы включают 14-дневный бесплатный период тестирования
          </p>
        </div>
      </div>

      <TrialSuccessModal
        isOpen={trialModal.isOpen}
        onClose={() => setTrialModal({ isOpen: false, plan: 'free' })}
        plan={trialModal.plan}
        onTarifUpdated={updateUserTarif}
      />
    </section>
  )
}
