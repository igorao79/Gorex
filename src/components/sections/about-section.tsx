"use client"

import { Card } from "@/components/ui/card"

export function AboutSection() {
  return (
    <section id="about" className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            О проекте Gorex
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Современный инструмент для управления задачами, созданный разработчиками для разработчиков
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-2xl font-semibold mb-4">Наша миссия</h3>
            <p className="text-slate-600 mb-6">
              Упростить процесс управления задачами в командах разработчиков.
              Мы верим, что отличный продукт рождается из эффективной коммуникации
              и четкого планирования работы.
            </p>
            <p className="text-slate-600">
              Gorex создан для того, чтобы каждая команда могла сосредоточиться
              на написании кода, а не на управлении процессом разработки.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="text-center p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-slate-600">Активных команд</div>
            </Card>
            <Card className="text-center p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">10k+</div>
              <div className="text-slate-600">Завершенных задач</div>
            </Card>
            <Card className="text-center p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">99.9%</div>
              <div className="text-slate-600">Время работы</div>
            </Card>
            <Card className="text-center p-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-slate-600">Поддержка</div>
            </Card>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-semibold mb-8">Технологии</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-slate-100 px-4 py-2 rounded-lg text-slate-700 font-medium">
              Next.js 16
            </div>
            <div className="bg-slate-100 px-4 py-2 rounded-lg text-slate-700 font-medium">
              TypeScript
            </div>
            <div className="bg-slate-100 px-4 py-2 rounded-lg text-slate-700 font-medium">
              PostgreSQL
            </div>
            <div className="bg-slate-100 px-4 py-2 rounded-lg text-slate-700 font-medium">
              Prisma ORM
            </div>
            <div className="bg-slate-100 px-4 py-2 rounded-lg text-slate-700 font-medium">
              NextAuth.js
            </div>
            <div className="bg-slate-100 px-4 py-2 rounded-lg text-slate-700 font-medium">
              Tailwind CSS
            </div>
            <div className="bg-slate-100 px-4 py-2 rounded-lg text-slate-700 font-medium">
              Shadcn/ui
            </div>
            <div className="bg-slate-100 px-4 py-2 rounded-lg text-slate-700 font-medium">
              Render (Hosting)
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
