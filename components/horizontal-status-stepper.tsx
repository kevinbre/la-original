'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface HorizontalStatusStepperProps {
  currentStatus: string
}

const STATUS_STEPS = [
  { key: 'pendiente', label: 'Pendiente' },
  { key: 'en_revision', label: 'En Revisión' },
  { key: 'presupuestado', label: 'Presupuestado' },
  { key: 'confirmado', label: 'Confirmado' },
  { key: 'en_preparacion', label: 'En Preparación' },
  { key: 'listo_entrega', label: 'Listo' },
  { key: 'completado', label: 'Completado' },
]

export function HorizontalStatusStepper({ currentStatus }: HorizontalStatusStepperProps) {
  if (currentStatus === 'cancelado' || currentStatus === 'rechazado') {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="inline-flex items-center rounded-lg border-2 border-red-500 bg-red-50 dark:bg-red-950 px-6 py-3 text-base font-semibold text-red-700 dark:text-red-300">
          {currentStatus === 'cancelado' ? 'Pedido Cancelado' : 'Presupuesto Rechazado'}
        </div>
      </div>
    )
  }

  const currentIndex = STATUS_STEPS.findIndex(step => step.key === currentStatus)
  const progressPercentage = currentIndex >= 0 ? ((currentIndex + 1) / STATUS_STEPS.length) * 100 : 0

  return (
    <nav aria-label="Progress" className="space-y-4 py-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-muted-foreground">Progreso</span>
          <span className="font-semibold">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <ol role="list" className="flex items-center justify-between gap-2">
        {STATUS_STEPS.map((step, stepIdx) => {
          const isCompleted = stepIdx < currentIndex
          const isCurrent = stepIdx === currentIndex
          const isPending = stepIdx > currentIndex

          return (
            <li key={step.key} className="relative flex flex-1 flex-col items-center">
              {/* Line before */}
              {stepIdx !== 0 && (
                <div
                  className={cn(
                    "absolute right-1/2 top-5 -z-10 h-0.5 w-full",
                    isCompleted || isCurrent ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
                  )}
                  aria-hidden="true"
                />
              )}

              {/* Line after */}
              {stepIdx !== STATUS_STEPS.length - 1 && (
                <div
                  className={cn(
                    "absolute left-1/2 top-5 -z-10 h-0.5 w-full",
                    isCompleted ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
                  )}
                  aria-hidden="true"
                />
              )}

              {/* Step circle */}
              <div className="relative flex flex-col items-center">
                {isCompleted ? (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 shadow-md">
                    <Check className="h-5 w-5 text-white" strokeWidth={3} />
                  </span>
                ) : isCurrent ? (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-yellow-500 bg-yellow-100 dark:bg-yellow-900 shadow-md">
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                  </span>
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 dark:border-gray-700 bg-background">
                    <span className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-700" />
                  </span>
                )}

                {/* Label */}
                <span
                  className={cn(
                    "mt-2 text-center text-xs font-medium sm:text-sm",
                    isCompleted && "text-green-700 dark:text-green-400",
                    isCurrent && "text-yellow-700 dark:text-yellow-400 font-semibold",
                    isPending && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
