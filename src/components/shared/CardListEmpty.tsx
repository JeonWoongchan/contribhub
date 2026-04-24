import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type CardListEmptyProps = {
  title: string
  description: string
  detail?: string
  action?: ReactNode
}

export function CardListEmpty({
  title,
  description,
  detail,
  action,
}: CardListEmptyProps) {
  return (
    <Card size="sm" className="border border-dashed border-interactive-selected-border/70 bg-card/70">
      <CardHeader>
        <CardTitle className="text-base text-interactive-action-hover">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-3 text-sm text-muted-foreground">
        {detail ? <p>{detail}</p> : null}
        {action ? (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-interactive-selected-border text-interactive-action-hover hover:bg-interactive-hover"
          >
            {action}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}
