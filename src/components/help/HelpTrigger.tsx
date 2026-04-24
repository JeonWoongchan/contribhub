import { CircleHelp } from 'lucide-react'
import { Button } from '@/components/ui/button'

type HelpTriggerProps = {
  onOpen: () => void
  label?: string
}

export function HelpTrigger({
  onOpen,
  label = '카드 읽는 법',
}: HelpTriggerProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onOpen}
      className="w-fit text-muted-foreground hover:bg-interactive-hover hover:text-interactive-action-hover"
    >
      <CircleHelp className="h-4 w-4" />
      {label}
    </Button>
  )
}
