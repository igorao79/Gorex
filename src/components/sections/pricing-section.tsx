"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-4 bg-slate-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Тарифы
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Выберите подходящий тариф для вашей команды
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="border-2">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl">Бесплатный</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-slate-500 ml-1">/ месяц</span>
              </div>
              <p className="text-slate-600 mt-2">Для небольших команд</p>
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
              <Button className="w-full mt-6" variant="outline">
                Выбрать бесплатный
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500 relative">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
              Популярный
            </Badge>
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl">Профессиональный</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">$9</span>
                <span className="text-slate-500 ml-1">/ месяц</span>
              </div>
              <p className="text-slate-600 mt-2">Для растущих команд</p>
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
              <Button className="w-full mt-6">
                Начать 14 дней бесплатно
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl">Корпоративный</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-slate-500 ml-1">/ месяц</span>
              </div>
              <p className="text-slate-600 mt-2">Для крупных компаний</p>
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
              <Button className="w-full mt-6" variant="outline">
                Связаться с нами
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-slate-600">
            Все тарифы включают 14-дневный бесплатный период тестирования
          </p>
        </div>
      </div>
    </section>
  )
}
