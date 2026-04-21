type StepProgressProps = {
  currentStep: number
  labels: string[]
}

export function StepProgress({ currentStep, labels }: StepProgressProps) {
  return (
    <div className="mb-8 flex items-center gap-2">
      {labels.map((label, index) => (
        <div
          key={label}
          className={`flex items-center gap-2 ${index < labels.length - 1 ? 'flex-1' : ''}`}
        >
          <div
            // 현재 step, 완료된 step, 대기 중 step 상태 구분
            // 번호와 완료 표시만 담당하고 step 전환 이벤트는 포함하지 않음
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
              index < currentStep
                ? 'bg-interactive-action text-interactive-action-foreground'
                : index === currentStep
                  ? 'bg-interactive-selected text-foreground ring-2 ring-interactive-selected-ring'
                  : 'bg-muted text-muted-foreground'
            }`}
          >
            {index < currentStep ? '✓' : index + 1}
          </div>
          {index < labels.length - 1 && (
            <div className={`h-0.5 flex-1 ${index < currentStep ? 'bg-interactive-action' : 'bg-border'}`} />
          )}
        </div>
      ))}
    </div>
  )
}
