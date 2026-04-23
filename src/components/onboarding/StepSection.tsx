import type { ReactNode } from 'react'

type StepSectionProps = {
  title: string
  description?: string
  children: ReactNode
}

export function StepSection({ title, description, children }: StepSectionProps) {
  return (
    <section>
      <div className="mb-4 space-y-1">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  )
}
