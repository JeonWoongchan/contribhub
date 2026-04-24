import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {Button} from "@/components/ui/button";

type EmptyStateCardProps = {
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
}: EmptyStateCardProps) {
  return (
    <Card size="sm" className="border border-dashed border-interactive-selected-border/70 bg-card/70">
      <CardHeader>
        <div className="flex items-center gap-2 text-interactive-action-hover">
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-3 text-sm text-muted-foreground">
        {detail ? <p>{detail}</p> : null}
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-interactive-selected-border text-interactive-action-hover hover:bg-interactive-hover"
        >
          {action}
        </Button>
      </CardContent>
    </Card>
  )
}
