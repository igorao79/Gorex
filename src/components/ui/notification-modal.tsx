"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react"

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
  type: "success" | "error" | "warning" | "info"
  title: string
  message: string
}

export function NotificationModal({ isOpen, onClose, type, title, message }: NotificationModalProps) {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-8 h-8 text-green-500" />
      case "error":
        return <XCircle className="w-8 h-8 text-red-500" />
      case "warning":
        return <AlertCircle className="w-8 h-8 text-yellow-500" />
      case "info":
        return <Info className="w-8 h-8 text-blue-500" />
      default:
        return <Info className="w-8 h-8 text-blue-500" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] text-center">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="flex flex-col items-center space-y-4 py-6">
          <div className="flex justify-center">
            {getIcon()}
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-muted-foreground text-base">
              {message}
            </p>
          </div>
          <div className="flex justify-center pt-4">
            <Button onClick={onClose} className="w-full sm:w-auto min-w-[120px]">
              Понятно
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
