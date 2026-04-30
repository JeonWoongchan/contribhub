import type { ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type MyPageStatCardProps = {
  icon: ReactNode
  label: string
  value: string
  href: string
}

export function MyPageStatCard({ icon, label, value, href }: MyPageStatCardProps) {
  return (
    <Card size="sm" className="border border-border/70 bg-background/80">
      <CardContent className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-interactive-selected text-interactive-action-hover">
            {icon}
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          </div>
        </div>
        <Button asChild variant="ghost" size="sm" className="text-interactive-action-hover">
          <Link href={href}>보기</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
