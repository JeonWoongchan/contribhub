import type { Metadata } from 'next'
import Link from 'next/link'
import { IssueList } from '@/components/dashboard/issue/IssueList'
import { MainSectionShell } from '@/components/layout/MainSectionShell'
import { auth } from '@/lib/auth'
import { createPageMetadata } from '@/lib/metadata'

export const metadata: Metadata = createPageMetadata({
    title: '추천 이슈',
    description: '관심사와 현재 수준을 기준으로 오픈소스 첫 기여에 적합한 GitHub 이슈를 살펴봅니다.',
    canonicalPath: '/dashboard',
})

export default async function DashboardPage() {
    const session = await auth()

    return (
        <MainSectionShell
            title="추천 이슈"
            description="관심사와 현재 수준을 기준으로 시작하기 좋은 이슈를 모아봤습니다."
            actions={session ? <Link href="/onboarding">온보딩 다시하기</Link> : null}
        >
            <IssueList isGuest={!session} />
        </MainSectionShell>
    )
}
