import type { ScoredIssue } from '@/types/issue'

export const DASHBOARD_HELP_GUIDE_ITEMS = [
  {
    id: 'score',
    title: '추천 점수',
    description: '오른쪽 위의 점수입니다. 현재 설정한 선호도와 이슈가 얼마나 잘 맞는지 보여줍니다.',
  },
  {
    id: 'stack',
    title: '기술 스택과 난이도',
    description: '언어, 난이도, 라벨을 함께 보면 이슈 성격을 빠르게 파악할 수 있습니다.',
  },
  {
    id: 'metrics',
    title: '별과 댓글',
    description: '프로젝트 규모와 이슈 대화량을 함께 보여줍니다. 난이도를 짐작하는 데 도움이 됩니다.',
  },
  {
    id: 'health',
    title: '저장소 활성도',
    description: '아래 상태 배지입니다. 저장소가 꾸준히 관리되는 곳인지 참고할 수 있습니다.',
  },
  {
    id: 'competition',
    title: '경쟁도',
    description: '이미 누가 보고 있는지, PR이 있는지 보여줘서 진입 부담을 가늠하게 해줍니다.',
  },
] as const

export type DashboardHelpGuideId = (typeof DASHBOARD_HELP_GUIDE_ITEMS)[number]['id']

export const DASHBOARD_HELP_DEMO_UPDATED_OFFSET_MS = 86_400_000

export const DASHBOARD_HELP_DEMO_ISSUE: Omit<ScoredIssue, 'createdAt' | 'updatedAt'> = {
  number: 12345,
  title: '문서 예제에서 빠진 설명을 정리하고 초보자 가이드를 보완하기',
  url: 'https://github.com/vercel/next.js/issues',
  repoFullName: 'vercel/next.js',
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
