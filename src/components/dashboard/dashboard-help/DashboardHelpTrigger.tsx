import { CircleHelp } from 'lucide-react'
import { Button } from '@/components/ui/button'

type DashboardHelpTriggerProps = {
  onOpen: () => void
}

export function DashboardHelpTrigger({ onOpen }: DashboardHelpTriggerProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onOpen}
      className="w-fit text-muted-foreground hover:bg-interactive-hover hover:text-interactive-action-hover"
    >
      <CircleHelp className="h-4 w-4" />
      카드 읽는 법
    </Button>
  )
}
