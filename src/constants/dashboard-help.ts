import type { HelpGuideItem } from '@/types/help'
import type { ScoredIssue } from '@/types/issue'

export const DASHBOARD_HELP_GUIDE_ITEMS = [
  {
    id: 'score',
    title: '추천 점수',
    description:
      '오른쪽 위 숫자예요. 지금 설정과 선호에 이 이슈가 얼마나 잘 맞는지 빠르게 보여줘요.',
  },
  {
    id: 'stack',
    title: '기술 스택과 라벨',
    description:
      '언어, 난이도, 라벨을 함께 보면 이슈의 성격을 더 빠르게 파악할 수 있어요.',
  },
  {
    id: 'metrics',
    title: '반응과 규모',
    description:
      '프로젝트 규모와 이슈의 반응량을 같이 보여줘요. 진입 전에 분위기를 가늠할 때 도움이 돼요.',
  },
  {
    id: 'health',
    title: '저장소 상태',
    description:
      '저장소가 꾸준히 관리되고 있는지 참고할 수 있게 상태 배지로 보여줘요.',
  },
  {
    id: 'competition',
    title: '경쟁도',
    description:
      '이미 다른 사람이 보고 있는지, PR이 열려 있는지 보여줘서 진입 부담을 판단하는 데 도움돼요.',
  },
] as const satisfies readonly HelpGuideItem<string>[]

export type DashboardHelpGuideId = (typeof DASHBOARD_HELP_GUIDE_ITEMS)[number]['id']

export const DASHBOARD_HELP_DEMO_UPDATED_OFFSET_MS = 86_400_000

export const DASHBOARD_HELP_DEMO_ISSUE: Omit<ScoredIssue, 'createdAt' | 'updatedAt'> = {
  number: 12345,
  title: 'docs: clarify missing explanation in starter example',
  url: 'https://github.com/vercel/next.js/issues',
  repoFullName: 'vercel/next.js',
  repoUrl: 'https://github.com/vercel/next.js',
  language: 'TypeScript',
  stargazerCount: 129000,
  labels: ['documentation', 'good first issue'],
  commentCount: 3,
  score: 82,
  difficultyLevel: 'beginner',
  contributionType: 'doc',
  competitionLevel: 'ACTIVE',
  hasPR: false,
  healthScore: 78,
}
