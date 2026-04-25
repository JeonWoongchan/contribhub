import type { ReactNode } from 'react'

type CardTitleLinkProps = {
  href: string
  children: ReactNode
  icon?: ReactNode
}

export function CardTitleLink({ href, children, icon }: CardTitleLinkProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="min-w-0 outline-none">
      <h3 className="flex items-center gap-1.5 text-sm font-medium leading-snug text-card-foreground transition-colors hover:text-interactive-action-hover line-clamp-2">
        {icon}
        {children}
      </h3>
    </a>
  )
}
