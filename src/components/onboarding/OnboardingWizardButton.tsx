import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type OnboardingWizardButtonProps = {
  children: string
  disabled?: boolean
  onClick: () => void
  tone?: 'primary' | 'secondary'
}

export function OnboardingWizardButton({
  children,
  disabled = false,
  onClick,
  tone = 'primary',
}: OnboardingWizardButtonProps) {
  const isPrimary = tone === 'primary'

  return (
    <Button
      type="button"
      variant={isPrimary ? 'default' : 'outline'}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex-1 rounded-xl shadow-none h-12',
        isPrimary
          ? 'border-transparent bg-interactive-action text-interactive-action-foreground hover:bg-interactive-action-hover'
          : 'border-interactive-border text-muted-foreground hover:border-interactive-hover-border hover:bg-interactive-hover hover:text-foreground'
      )}
    >
      {children}
    </Button>
  )
}
