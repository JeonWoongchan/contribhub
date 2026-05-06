import type { ReactNode } from 'react'

type CardHeaderLayoutProps = {
  topLeft: ReactNode
  topRight?: ReactNode
  title: ReactNode
}

export function CardHeaderLayout({ topLeft, topRight, title }: CardHeaderLayoutProps) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 overflow-hidden">{topLeft}</div>
        {topRight ? <div className="shrink-0">{topRight}</div> : null}
      </div>
      {title}
    </>
  )
}
