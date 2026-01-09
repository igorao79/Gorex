"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Crown, Users } from "lucide-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

interface TrialSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  plan: 'free' | 'prof' | 'corp'
  onTarifUpdated?: (tarif: 'free' | 'prof' | 'corp') => void
}

export function TrialSuccessModal({ isOpen, onClose, plan, onTarifUpdated }: TrialSuccessModalProps) {

  // Автоматически выдаем привилегию при открытии модалки
  React.useEffect(() => {
    if (isOpen && onTarifUpdated) {
      onTarifUpdated(plan)
    }
  }, [isOpen, plan, onTarifUpdated])

  const getPlanDetails = (plan: string) => {
    switch (plan) {
      case 'prof':
        return {
          name: 'Pro',
          price: '$9/месяц',
          description: 'Для растущих команд',
          features: [
            'До 25 участников',
            'Расширенная аналитика',
            'Интеграции с внешними сервисами',
            'Приоритетная поддержка',
            'Экспорт данных'
          ],
          icon: Crown,
          color: 'text-blue-600'
        }
      case 'corp':
        return {
          name: 'Team',
          price: 'Индивидуально',
          description: 'Для крупных компаний',
          features: [
            'Неограниченное количество участников',
            'Расширенная аналитика и отчеты',
            'Все интеграции',
            'Выделенная поддержка 24/7',
            'Экспорт данных и API',
            'SLA гарантированная доступность'
          ],
          icon: Users,
          color: 'text-purple-600'
        }
      default:
        return {
          name: 'Free',
          price: '$0/месяц',
          description: 'Для небольших команд',
          features: [
            'До 5 участников',
            'Базовая аналитика',
            'Основные функции'
          ],
          icon: CheckCircle,
          color: 'text-green-600'
        }
    }
  }

  const planDetails = getPlanDetails(plan)
  const IconComponent = planDetails.icon

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto overflow-x-hidden sm:max-h-none sm:overflow-y-visible">
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle>Поздравляем с началом пробного периода</DialogTitle>
            <DialogDescription>Вы успешно активировали пробный период выбранного тарифа</DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-8"
          >
            {/* Success Animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h2
              className="text-3xl font-heading text-foreground mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Поздравляем!
            </motion.h2>

            <motion.p
              className="text-muted-foreground mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Ваш 14-дневный пробный период активирован!
            </motion.p>

            {/* Plan Details */}
            <motion.div
              className="bg-muted/30 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 text-left mx-2 sm:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center justify-center mb-4">
                <IconComponent className={`w-8 h-8 ${planDetails.color} mr-2`} />
                <div>
                  <h3 className="text-xl font-heading">{planDetails.name}</h3>
                  <p className="text-sm text-muted-foreground">{planDetails.description}</p>
                </div>
              </div>

              <div className="text-center mb-4">
                <span className="text-2xl font-bold text-foreground">{planDetails.price}</span>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-foreground mb-3">Что входит:</h4>
                {planDetails.features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    className="flex items-center"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="flex gap-3 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <Button
                onClick={onClose}
                className="px-8"
              >
                Продолжить
              </Button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
