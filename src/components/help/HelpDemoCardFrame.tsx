import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'

type HelpDemoCardFrameProps = {
  children: ReactNode
  label?: string
  note?: string
}

export function HelpDemoCardFrame({
  children,
  label = '예시 카드',
  note = '카드 요소에 마우스를 올리면 오른쪽 설명과 같이 강조돼요.',
}: HelpDemoCardFrameProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <Card
        size="sm"
        className="border border-border py-4 shadow-[0_0_0_1px_var(--color-interactive-selected-border)]"
      >
        <CardContent className="flex h-full flex-col gap-4">{children}</CardContent>
      </Card>

      <div className="rounded-xl border border-dashed border-interactive-selected-border/70 bg-interactive-selected/30 p-4 text-sm text-muted-foreground">
        {note}
      </div>
    </div>
  )
}
