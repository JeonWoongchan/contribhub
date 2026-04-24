import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type CardListErrorProps = {
  message: string
  onRetry: () => void
}

export function CardListError({ message, onRetry }: CardListErrorProps) {
  return (
    <Card className="border border-status-danger-border bg-status-danger py-8 text-center">
      <CardContent className="flex flex-col items-center gap-3">
        <p className="text-sm font-medium text-status-danger-foreground">{message}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="border-status-danger-border bg-background"
        >
          다시 시도
        </Button>
      </CardContent>
    </Card>
  )
}
