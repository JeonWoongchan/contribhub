import type { ReactNode } from 'react'

type StepSectionProps = {
  title: string
  children: ReactNode
}

export function StepSection({ title, children }: StepSectionProps) {
  return (
    <section>
      {/* - 각 step 화면의 제목과 옵션 영역 레이아웃을 공통화한다. */}
      <h2 className="mb-4 text-lg font-semibold text-gray-900">{title}</h2>
      {/* - 실제 옵션 구성은 children으로 받아 step별 차이를 유지한다. */}
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  )
}
