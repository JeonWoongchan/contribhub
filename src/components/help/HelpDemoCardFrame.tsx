import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'

type HelpDemoCardFrameProps = {
  children: ReactNode
  label?: string
  note?: string
}

// 도움말 다이얼로그 좌측 예시 카드 컨테이너.
// 바이올렛 외곽선(shadow ring)으로 '설명 중인 카드'임을 시각적으로 구분.
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
        className="border border-border py-4"
      >
        <CardContent className="flex h-full flex-col gap-4">{children}</CardContent>
      </Card>

      <div className="hidden rounded-xl border border-dashed border-interactive-selected-border/70 bg-interactive-selected/30 p-4 text-sm text-muted-foreground lg:block">
        {note}
      </div>
    </div>
  )
}
