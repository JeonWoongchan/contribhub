import type { ReactNode } from 'react'

type MyPageProfileFieldProps = {
  label: string
  value: ReactNode
  description?: string
}

export function MyPageProfileField({ label, value, description }: MyPageProfileFieldProps) {
  return (
    <div className="space-y-2 rounded-2xl border border-border/70 bg-background/70 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <div className="text-base font-semibold tracking-tight text-foreground">{value}</div>
      {description ? <p className="text-sm leading-6 text-muted-foreground">{description}</p> : null}
    </div>
  )
}
