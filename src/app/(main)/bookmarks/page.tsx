import Link from 'next/link'
import { BookmarkList } from '@/components/bookmark/BookmarkList'
import { MainSectionShell } from '@/components/layout/MainSectionShell'

export default function BookmarksPage() {
  return (
    <MainSectionShell
      title="북마크"
      description="저장해둔 이슈를 다시 볼 수 있어요."
      actions={<Link href="/dashboard">추천 이슈 보러가기</Link>}
    >
      <BookmarkList />
    </MainSectionShell>
  )
}
