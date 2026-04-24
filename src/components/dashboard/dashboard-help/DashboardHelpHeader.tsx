import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type DashboardHelpHeaderProps = {
  onClose: () => void
}

export function DashboardHelpHeader({ onClose }: DashboardHelpHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
      <div className="space-y-1">
        <p id="dashboard-help-description" className="text-sm font-medium text-interactive-action-hover">
          카드 읽는 법
        </p>
        <h2 id="dashboard-help-title" className="text-lg font-semibold tracking-tight">
          이슈 카드를 이렇게 읽어보세요
        </h2>
      </div>
      <Button type="button" variant="ghost" size="icon-sm" onClick={onClose} aria-label="도움말 닫기">
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
