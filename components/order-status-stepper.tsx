'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface OrderStatusStepperProps {
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

export function OrderStatusStepper({ currentStatus }: OrderStatusStepperProps) {
  // Handle special cases
  if (currentStatus === 'cancelado' || currentStatus === 'rechazado') {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="inline-flex items-center rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive">
          {currentStatus === 'cancelado' ? 'Pedido Cancelado' : 'Presupuesto Rechazado'}
        </div>
      </div>
    )
  }

  const currentIndex = STATUS_STEPS.findIndex(step => step.key === currentStatus)

  return (
    <nav aria-label="Progress">
      <ol role="list" className="overflow-hidden">
        {STATUS_STEPS.map((step, stepIdx) => {
          const isCompleted = stepIdx < currentIndex
          const isCurrent = stepIdx === currentIndex

          return (
            <li key={step.key} className={cn(stepIdx !== STATUS_STEPS.length - 1 ? 'pb-10' : '', 'relative')}>
              {isCompleted ? (
                <>
                  {stepIdx !== STATUS_STEPS.length - 1 ? (
                    <div className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-primary" aria-hidden="true" />
                  ) : null}
                  <div className="group relative flex items-start">
                    <span className="flex h-9 items-center">
                      <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary group-hover:bg-primary/90">
                        <Check className="h-5 w-5 text-primary-foreground" />
                      </span>
                    </span>
                    <span className="ml-4 flex min-w-0 flex-col">
                      <span className="text-sm font-medium">{step.label}</span>
                    </span>
                  </div>
                </>
              ) : isCurrent ? (
                <>
                  {stepIdx !== STATUS_STEPS.length - 1 ? (
                    <div className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-muted" aria-hidden="true" />
                  ) : null}
                  <div className="group relative flex items-start" aria-current="step">
                    <span className="flex h-9 items-center" aria-hidden="true">
                      <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background">
                        <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                      </span>
                    </span>
                    <span className="ml-4 flex min-w-0 flex-col">
                      <span className="text-sm font-medium text-primary">{step.label}</span>
                    </span>
                  </div>
                </>
              ) : (
                <>
                  {stepIdx !== STATUS_STEPS.length - 1 ? (
                    <div className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-muted" aria-hidden="true" />
                  ) : null}
                  <div className="group relative flex items-start">
                    <span className="flex h-9 items-center" aria-hidden="true">
                      <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted bg-background group-hover:border-muted-foreground/50">
                        <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-muted-foreground/50" />
                      </span>
                    </span>
                    <span className="ml-4 flex min-w-0 flex-col">
                      <span className="text-sm font-medium text-muted-foreground">{step.label}</span>
                    </span>
                  </div>
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
