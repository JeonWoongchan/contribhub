import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type HelpHeaderProps = {
  onClose: () => void
  eyebrow: string
  title: string
  titleId: string
  descriptionId: string
}

export function HelpHeader({
  onClose,
  eyebrow,
  title,
  titleId,
  descriptionId,
}: HelpHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
      <div className="space-y-1">
        <p id={descriptionId} className="text-sm font-medium text-interactive-action-hover">
          {eyebrow}
        </p>
        <h2 id={titleId} className="text-lg font-semibold tracking-tight">
          {title}
        </h2>
      </div>
      <Button type="button" variant="ghost" size="icon-sm" onClick={onClose} aria-label="도움말 닫기">
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
