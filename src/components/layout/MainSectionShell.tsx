import type { ReactNode } from 'react'
import { Separator } from '@/components/ui/separator'
import {Button} from "@/components/ui/button";

type MainSectionShellProps = {
  title: string
  description: string
  actions?: ReactNode
  topAside?: ReactNode
  children: ReactNode
}

export function MainSectionShell({
  title,
  description,
  actions,
  topAside,
  children,
}: MainSectionShellProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="space-y-1">
            <h1 className="text-lg font-semibold tracking-tight text-interactive-action-hover">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {actions ? (
          <div className="flex flex-col items-start gap-3 sm:self-stretch sm:items-end sm:justify-between">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-fit border-interactive-selected-border text-interactive-action-hover hover:bg-interactive-hover"
            >
              {actions}
            </Button>
          </div>
        ) : null}
      </div>
      <Separator className="bg-interactive-selected-border/50" />
      {topAside ? <div className="flex justify-end">{topAside}</div> : null}
      {children}
    </div>
  )
}
