// PR 히스토리 페이지 — MainSectionShell 래퍼 + PRHistoryList 클라이언트 컴포넌트 조합

import Link from 'next/link'
import { MainSectionShell } from '@/components/layout/MainSectionShell'
import { PRHistoryList } from '@/components/pr-history/PRHistoryList'

export default function PRHistoryPage() {
  return (
    <MainSectionShell
      title="PR 히스토리"
      description="GitHub에 제출한 Pull Request 기록을 한눈에 확인할 수 있습니다."
      actions={<Link href="/dashboard">추천 이슈 보러가기</Link>}
    >
      <PRHistoryList />
    </MainSectionShell>
  )
}
