'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface HorizontalStatusStepperProps {
  currentStatus: string
}

const STATUS_STEPS = [
  { key: 'pendiente', label: 'Pendiente', shortLabel: 'Pend.' },
  { key: 'en_revision', label: 'En Revisión', shortLabel: 'Revis.' },
  { key: 'presupuestado', label: 'Presupuestado', shortLabel: 'Presup.' },
  { key: 'confirmado', label: 'Confirmado', shortLabel: 'Confir.' },
  { key: 'en_preparacion', label: 'En Preparación', shortLabel: 'Prep.' },
  { key: 'listo_entrega', label: 'Listo', shortLabel: 'Listo' },
  { key: 'completado', label: 'Completado', shortLabel: 'Compl.' },
]

export function HorizontalStatusStepper({ currentStatus }: HorizontalStatusStepperProps) {
  if (currentStatus === 'cancelado' || currentStatus === 'rechazado') {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="inline-flex items-center rounded-lg border-2 border-red-500 bg-red-50 dark:bg-red-950 px-4 py-2 text-sm font-semibold text-red-700 dark:text-red-300">
          {currentStatus === 'cancelado' ? 'Pedido Cancelado' : 'Presupuesto Rechazado'}
        </div>
      </div>
    )
  }

  const currentIndex = STATUS_STEPS.findIndex(step => step.key === currentStatus)
  const progressPercentage = currentIndex >= 0 ? ((currentIndex + 1) / STATUS_STEPS.length) * 100 : 0

  return (
    <nav aria-label="Progress" className="space-y-3 py-3">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="font-medium text-muted-foreground">Progreso</span>
          <span className="font-semibold">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="h-1.5 sm:h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Steps - Scrollable on mobile */}
      <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
        <ol role="list" className="flex items-center justify-between gap-1 sm:gap-2 min-w-max sm:min-w-0">
          {STATUS_STEPS.map((step, stepIdx) => {
            const isCompleted = stepIdx < currentIndex
            const isCurrent = stepIdx === currentIndex
            const isPending = stepIdx > currentIndex

            return (
              <li key={step.key} className="relative flex flex-1 flex-col items-center min-w-[60px] sm:min-w-0">
                {/* Line before */}
                {stepIdx !== 0 && (
                  <div
                    className={cn(
                      "absolute right-1/2 top-4 sm:top-5 -z-10 h-0.5 w-full",
                      isCompleted || isCurrent ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
                    )}
                    aria-hidden="true"
                  />
                )}

                {/* Line after */}
                {stepIdx !== STATUS_STEPS.length - 1 && (
                  <div
                    className={cn(
                      "absolute left-1/2 top-4 sm:top-5 -z-10 h-0.5 w-full",
                      isCompleted ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
                    )}
                    aria-hidden="true"
                  />
                )}

                {/* Step circle */}
                <div className="relative flex flex-col items-center">
                  {isCompleted ? (
                    <span className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-green-500 shadow-md">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-white" strokeWidth={3} />
                    </span>
                  ) : isCurrent ? (
                    <span className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border-3 sm:border-4 border-yellow-500 bg-yellow-100 dark:bg-yellow-900 shadow-md">
                      <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-yellow-500" />
                    </span>
                  ) : (
                    <span className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 border-gray-300 dark:border-gray-700 bg-background">
                      <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-gray-300 dark:bg-gray-700" />
                    </span>
                  )}

                  {/* Label - Hidden on mobile, only show short version */}
                  <span
                    className={cn(
                      "mt-1.5 sm:mt-2 text-center text-[10px] sm:text-xs font-medium",
                      isCompleted && "text-green-700 dark:text-green-400",
                      isCurrent && "text-yellow-700 dark:text-yellow-400 font-semibold",
                      isPending && "text-muted-foreground"
                    )}
                  >
                    <span className="hidden sm:inline">{step.label}</span>
                    <span className="sm:hidden">{step.shortLabel}</span>
                  </span>
                </div>
              </li>
            )
          })}
        </ol>
      </div>

      {/* Current status text for mobile */}
      <div className="sm:hidden text-center">
        <p className="text-xs text-muted-foreground">
          Estado actual: <span className="font-semibold text-foreground">
            {STATUS_STEPS[currentIndex]?.label || 'Desconocido'}
          </span>
        </p>
      </div>
    </nav>
  )
}
