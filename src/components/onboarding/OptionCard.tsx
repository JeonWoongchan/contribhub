import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type OptionCardProps = {
  label: string
  description: string
  selected: boolean
  onClick: () => void
  className?: string
}

export function OptionCard({
  label,
  description,
  selected,
  onClick,
  className,
}: OptionCardProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className={cn(
        'h-auto w-full justify-start rounded-xl px-4 py-3 text-left whitespace-normal shadow-none',
        selected
          ? 'border-interactive-selected-border bg-interactive-selected text-interactive-selected-foreground ring-1 ring-interactive-selected-ring hover:bg-interactive-selected'
          : 'border-interactive-border hover:border-interactive-hover-border hover:bg-interactive-hover',
        className
      )}
    >
      <div className="flex flex-col items-start">
        <div className="text-sm font-medium">{label}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{description}</div>
      </div>
    </Button>
  )
}
