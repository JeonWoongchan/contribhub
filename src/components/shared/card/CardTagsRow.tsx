import type { ReactNode } from 'react'

type CardTagsRowProps = {
  children: ReactNode
}

export function CardTagsRow({ children }: CardTagsRowProps) {
  return <div className="flex flex-wrap gap-1.5">{children}</div>
}
