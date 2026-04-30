import Link from 'next/link'
import { MainSectionShell } from '@/components/layout/MainSectionShell'
import { ProfileList } from '@/components/mypage/ProfileList'

export default function ProfilePage() {
  return (
    <MainSectionShell
      title="마이페이지"
      description="내 GitHub 계정과 현재 추천 기준을 한 곳에서 확인합니다."
      actions={<Link href="/dashboard">추천 이슈 보러가기</Link>}
    >
      <ProfileList />
    </MainSectionShell>
  )
}
