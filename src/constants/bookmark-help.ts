import type { HelpGuideItem } from '@/types/help'
import type { IssueCardItem } from '@/types/issue'

export const BOOKMARK_HELP_GUIDE_ITEMS = [
  {
    id: 'missing-github',
    title: '북마크 이슈에 해당하는 GitHub 조회 결과가 없어요',
    description:
      '언어, 라벨, 댓글 수, 저장소 상태 같은 메타데이터가 비어 있으면 북마크 DB 정보만 남아 있는 상태예요.',
  },
  {
    id: 'still-usable',
    title: '그래도 제목과 링크는 남아 있어요',
    description:
      '저장할 때 함께 보관한 저장소 이름, 제목, 링크는 남아 있어서 이슈 페이지로 다시 이동할 수 있어요.',
  },
] as const satisfies readonly HelpGuideItem<string>[]

export type BookmarkHelpGuideId = (typeof BOOKMARK_HELP_GUIDE_ITEMS)[number]['id']

export const BOOKMARK_HELP_DEMO_UPDATED_OFFSET_MS = 172_800_000

export const BOOKMARK_HELP_DEMO_ISSUE: Omit<IssueCardItem, 'createdAt' | 'updatedAt'> = {
  number: 2048,
  title: 'docs: broken link in getting-started guide',
  url: 'https://github.com/example/docs/issues/2048',
  repoFullName: 'example/docs',
  repoUrl: 'https://github.com/example/docs',
  language: null,
  stargazerCount: 0,
  labels: [],
  commentCount: 0,
  score: null,
  difficultyLevel: null,
  contributionType: 'doc',
  competitionLevel: null,
  hasPR: false,
  isBookmarked: true,
  healthScore: null,
}
