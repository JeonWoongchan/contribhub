import type { ContributionType, ExperienceLevel } from '@/types/user'

// 이슈 스코어링 및 레포 활성도 계산에 사용되는 규칙 상수
// 스코어링 로직(scorer.ts)과 규칙 데이터를 분리해 규칙 변경 시 이 파일만 수정

// 스팸·봇 생성 레포 필터링 기준 — 이 미만은 노출 제외
export const STAR_CUTOFF = 5

// 레포 활성도 캐시 유지 시간 (시간 단위)
export const REPO_HEALTH_CACHE_TTL_HOURS = 1

export const LANGUAGE_SCORE = {
  EXACT_MATCH: 30,
  RELATED: 15,
  NO_MATCH: 0,
} as const

export const LANGUAGE_GROUPS: string[][] = [
  ['TypeScript', 'JavaScript'],
  ['Python', 'Jupyter Notebook'],
  ['C', 'C++', 'C#'],
  ['Java', 'Kotlin', 'Scala'],
]

export const DIFFICULTY_SCORE = {
  PERFECT: 25,
  ONE_ABOVE: 15,
  TWO_ABOVE: 5,
  BELOW: 10,
} as const

export const EXPERIENCE_ORDER: ExperienceLevel[] = [
  'beginner',
  'junior',
  'mid',
  'senior',
]

export const DIFFICULTY_LABELS: Record<ExperienceLevel, string[]> = {
  beginner: ['good first issues', 'good-first-issues', 'beginner', 'starter'],
  junior:   ['help wanted', 'help-wanted', 'easy'],
  mid:      ['medium', 'moderate', 'intermediate'],
  senior:   ['hard', 'complex', 'advanced', 'needs-investigation'],
}

export const CONTRIBUTION_TYPE_LABELS: Record<ContributionType, string[]> = {
  doc:    ['documentation', 'docs', 'readme', 'translation', 'i18n'],
  bug:    ['bug', 'fix', 'regression', 'defect'],
  feat:   ['feature', 'enhancement', 'feature-request'],
  test:   ['test', 'testing', 'coverage'],
  review: [],
}

export const CONTRIBUTION_TYPE_SCORE = {
  MATCH: 20,
  NO_MATCH: 0,
} as const

export const COMPETITION_PENALTY = {
  PR_EXISTS:       -15,
  HIGH_ACTIVITY:   -8,
  MEDIUM_ACTIVITY: -3,
  LOW_ACTIVITY:    0,
} as const

export const HEALTH_BONUS = {
  HIGH: 15,
  MID:  8,
  LOW:  3,
} as const

export const TIME_FILTER: Record<number, ContributionType[]> = {
  2:  ['doc', 'bug'],
  5:  ['doc', 'bug', 'test'],
  10: ['doc', 'bug', 'test', 'feat', 'review'],
}

export const REPO_HEALTH_WEIGHTS = {
  RECENT_COMMIT: {
    weight: 30,
    rules: [
      { days: 30,       score: 30 },
      { days: 90,       score: 20 },
      { days: 180,      score: 10 },
      { days: Infinity, score: 0  },
    ],
  },
  PR_RESPONSE_SPEED: {
    weight: 30,
    rules: [
      { days: 3,        score: 30 },
      { days: 7,        score: 20 },
      { days: 14,       score: 10 },
      { days: Infinity, score: 0  },
    ],
  },
  MERGE_RATE: {
    weight: 25,
    rules: [
      { rate: 0.8, score: 25 },
      { rate: 0.6, score: 15 },
      { rate: 0.4, score: 5  },
      { rate: 0,   score: 0  },
    ],
  },
  MAINTAINER_RESPONSE: {
    weight: 15,
    rules: [
      { ratio: 0.7, score: 15 },
      { ratio: 0.4, score: 8  },
      { ratio: 0,   score: 4  }, // 일부라도 메인테이너 응답 있으면 소폭 점수
    ],
  },
} as const

export const HEALTH_THRESHOLD = 40
