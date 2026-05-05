import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { REPORT_ISSUE_URL } from '@/constants/app'

type CardListErrorProps = {
  message: string
  onRetry?: () => void
}

export function CardListError({ message, onRetry }: CardListErrorProps) {
  return (
    <Card className="border border-status-danger-border bg-status-danger py-8 text-center">
      <CardContent className="flex flex-col items-center gap-3">
        <p className="text-sm font-medium text-status-danger-foreground">{message}</p>
        {onRetry ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="border-status-danger-border bg-background"
            >
              다시 시도
            </Button>
            <p className="text-xs text-muted-foreground">
              문제가 계속되면{' '}
              <a
                href={REPORT_ISSUE_URL}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 transition-colors hover:text-foreground"
              >
                제보해 주세요(openissuemap@gmail.com)
              </a>
            </p>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
