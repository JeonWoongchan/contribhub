import type { CompetitionLevel } from '@/types/issue'
import type { ContributionType, ExperienceLevel, Purpose, WeeklyHours } from '@/types/user'

// ****규칙을 명확한 기준으로 재정비할 필요가 있음****
// GitHub Search API로 후보 이슈를 가져온 뒤, 아래 규칙으로 사용자 온보딩 답변과 이슈 메타데이터를 비교한다.
// 최종 score는 카드 우측 상단의 매칭 점수로 노출되며, 높은 점수일수록 사용자 설정에 더 잘 맞는 이슈로 본다.
export const PAGE_SIZE = 10
export const REPO_HEALTH_CACHE_TTL_HOURS = 1
export const MATCH_SCORE_MINIMUM = 0
// GitHub API 권장 캐시 TTL (Cache-Control: max-age=60 기준)
export const GITHUB_API_CACHE_TTL_SECONDS = 60
// GitHub API 응답 대기 상한 — 초과 시 AbortError로 함수 조기 종료
export const GITHUB_API_TIMEOUT_MS = 8_000

// 온보딩의 선호 언어와 GitHub 저장소 primaryLanguage를 비교한다.
// 선택한 언어이면 순위 무관하게 동일 점수를 주고, 같은 계열 언어는 부분 점수를 준다.
export const LANGUAGE_SCORE = {
  EXACT: 20,
  RELATED: 11,
  NO_MATCH: 0,
} as const

// GitHub의 primaryLanguage는 하나만 오기 때문에, 사용자가 선택한 언어와 같은 생태계면 related match로 본다.
export const LANGUAGE_GROUPS: string[][] = [
  ['TypeScript', 'JavaScript'],                  // 웹/Node.js 생태계
  ['C', 'C++'],                                  // 시스템·임베디드 (C#은 .NET으로 별도)
  ['Java', 'Kotlin', 'Scala', 'Groovy'],         // JVM 생태계
  ['Swift', 'Objective-C'],                      // Apple 플랫폼 (iOS/macOS)
]

// 온보딩의 오픈소스 기여 경험과 이슈 난이도 추정값을 비교한다.
// 사용자 수준과 같은 난이도가 가장 좋고, 한 단계 높은 이슈는 도전 가능한 이슈로 일부 가산한다.
export const DIFFICULTY_SCORE = {
  PERFECT: 15,
  ONE_ABOVE: 8,
  TWO_ABOVE: 4,
  THREE_ABOVE: 0,
  ONE_BELOW: 6,
  TWO_BELOW: 3,
  THREE_BELOW: 0,
} as const

export const EXPERIENCE_ORDER: ExperienceLevel[] = ['beginner', 'junior', 'mid', 'senior']

// GitHub가 난이도를 공식 필드로 주지 않기 때문에 이슈 라벨 키워드로 난이도를 추정한다.
// 'help wanted'는 기여 요청 레이블이므로 난이도 신호로 사용하지 않는다.
// 'needs-investigation'은 상태 레이블이므로 난이도 신호로 사용하지 않는다.
export const DIFFICULTY_LABELS: Record<ExperienceLevel, string[]> = {
  beginner: [
    'good first issue', 'good-first-issue',
    'good first issues', 'good-first-issues',
    'first-timers-only', 'first timers only',
    'mentored',
    'beginner', 'starter', 'easy',
    'difficulty:easy', 'difficulty: easy', 'difficulty:beginner',
  ],
  junior: [
    'good second issue', 'good-second-issue',
    'junior',
    'e-mentored',
  ],
  mid: [
    'medium', 'moderate', 'intermediate',
    'difficulty:medium', 'difficulty: medium',
    'e-medium',
  ],
  senior: [
    'hard', 'complex', 'advanced',
    'difficulty:hard', 'difficulty: hard',
    'difficulty:expert',
    'e-hard',
  ],
}

// 온보딩의 기여 방식 답변과 이슈의 작업 성격을 매칭하기 위한 키워드다.
// GitHub issue type이 항상 설정되어 있지 않으므로 라벨, 제목, 본문을 함께 탐색한다.
export const CONTRIBUTION_TYPE_LABELS: Record<ContributionType, string[]> = {
  doc: ['documentation', 'docs', 'readme', 'translation', 'i18n'],
  bug: ['bug', 'fix', 'regression', 'defect', 'error'],
  feat: ['feature', 'enhancement', 'feature-request', 'proposal'],
  test: ['test', 'testing', 'coverage', 'qa'],
  review: ['review', 'feedback'],
}

// 사용자가 선택한 기여 방식과 추정된 이슈 작업 성격이 같으면 가산한다.
// 선택한 방식 일치 여부만 판단하며, 그 외는 0점이다.
export const CONTRIBUTION_TYPE_SCORE = {
  MATCH: 15,
  NO_MATCH: 0,
} as const

// 댓글 수와 PR 연결 여부로 진입 경쟁도를 추정한다.
// 이미 PR이 있거나 토론이 많은 이슈는 초보자가 들어가기 어려울 수 있어 기본 감점한다.
export const COMPETITION_PENALTY = {
  PR_EXISTS: -10,
  NO_COMMENT: 6,
  ONE_COMMENT: 4,
  MEDIUM_ACTIVITY: -2,
  HIGH_ACTIVITY: -6,
  VERY_HIGH_ACTIVITY: -10,
} as const

// 저장소 활성도는 추천 안정성에 영향을 준다.
// 관리가 잘 되는 저장소일수록 답변을 받을 가능성이 높다고 보고 가산한다.
export const HEALTH_BONUS = {
  EXCELLENT: 8,
  HIGH: 6,
  MID: 4,
  LOW: 2,
} as const

export const HEALTH_SCORE_TIERS = {
  EXCELLENT: 85,
  HIGH: 70,
  MID: 55,
  LOW: 40,
} as const

export const REPO_STAR_SCORE_TIERS = [
  { stars: 3000, score: 4 },
  { stars: 1000, score: 3 },
  { stars: 300, score: 2 },
  { stars: 100, score: 1 },
] as const

// 경험 수준은 난이도뿐 아니라 경쟁도와도 연결된다.
// 입문자는 OPEN 이슈를 더 선호하고, 경험이 높을수록 ACTIVE 이슈도 감당 가능하다고 본다.
export const EXPERIENCE_COMPETITION_BONUS: Record<
  ExperienceLevel,
  Record<CompetitionLevel, number>
> = {
  beginner: {
    OPEN: 6,
    ACTIVE: -2,
    HAS_PR: -8,
  },
  junior: {
    OPEN: 6,
    ACTIVE: 4,
    HAS_PR: -5,
  },
  mid: {
    OPEN: 4,
    ACTIVE: 10,
    HAS_PR: -2,
  },
  senior: {
    OPEN: 4,
    ACTIVE: 10,
    HAS_PR: 0,
  },
}

// 온보딩의 작업 시간 답변을 이슈 메타데이터에 반영하는 규칙이다.
// 일치 시 가산만 하고 불일치 감점은 없다.
export const TIME_BUDGET_RULES: Record<
  WeeklyHours,
  {
    preferredTypes: ContributionType[]
    preferredDifficulties: ExperienceLevel[]
    preferredMaxComments: number
    typeMatchBonus: number
    difficultyMatchBonus: number
    lowCommentBonus: number
  }
> = {
  2: {
    preferredTypes: ['doc', 'bug'],
    preferredDifficulties: ['beginner', 'junior'],
    preferredMaxComments: 2,
    typeMatchBonus: 5,
    difficultyMatchBonus: 5,
    lowCommentBonus: 4,
  },
  5: {
    preferredTypes: ['doc', 'bug', 'test'],
    preferredDifficulties: ['beginner', 'junior', 'mid'],
    preferredMaxComments: 5,
    typeMatchBonus: 5,
    difficultyMatchBonus: 5,
    lowCommentBonus: 4,
  },
  10: {
    preferredTypes: ['doc', 'bug', 'test', 'feat', 'review'],
    preferredDifficulties: ['beginner', 'junior', 'mid', 'senior'],
    preferredMaxComments: 8,
    typeMatchBonus: 4,
    difficultyMatchBonus: 4,
    lowCommentBonus: 3,
  },
}

// 기여 목적은 GitHub API가 직접 주는 값이 아니므로 제품 정책으로 해석한다.
// portfolio: 결과물을 설명하기 쉬운 유명/건강한 저장소와 진입 가능한 작업을 우대
// growth: 학습 효과가 큰 기능/테스트/버그, 약간 도전적인 난이도를 우대
// community: 유지보수가 활발하고 꾸준히 참여하기 좋은 저장소와 작업을 우대
export const PURPOSE_SCORE_RULES: Record<
  Purpose,
  {
    highHealthBonus: number
    mediumHealthBonus: number
    openCompetitionBonus: number
    activeCompetitionBonus: number
    recognizedRepoStars: number
    recognizedRepoBonus: number
    preferredTypes: ContributionType[]
    preferredDifficulties: ExperienceLevel[]
    preferredTypeBonus: number
    preferredDifficultyBonus: number
  }
> = {
  portfolio: {
    highHealthBonus: 3,
    mediumHealthBonus: 2,
    openCompetitionBonus: 3,
    activeCompetitionBonus: 1,
    recognizedRepoStars: 300,
    recognizedRepoBonus: 2,
    preferredTypes: ['doc', 'bug', 'feat'],
    preferredDifficulties: ['beginner', 'junior'],
    preferredTypeBonus: 4,
    preferredDifficultyBonus: 2,
  },
  growth: {
    highHealthBonus: 3,
    mediumHealthBonus: 2,
    openCompetitionBonus: 1,
    activeCompetitionBonus: 3,
    recognizedRepoStars: 0,
    recognizedRepoBonus: 0,
    preferredTypes: ['feat', 'test', 'bug'],
    preferredDifficulties: ['junior', 'mid', 'senior'],
    preferredTypeBonus: 5,
    preferredDifficultyBonus: 5,
  },
  community: {
    highHealthBonus: 4,
    mediumHealthBonus: 2,
    openCompetitionBonus: 3,
    activeCompetitionBonus: 2,
    recognizedRepoStars: 0,
    recognizedRepoBonus: 0,
    preferredTypes: ['doc', 'bug', 'test'],
    preferredDifficulties: ['beginner', 'junior', 'mid'],
    preferredTypeBonus: 5,
    preferredDifficultyBonus: 4,
  },
}

// 저장소 활성도 계산 규칙이다.
// 최근 커밋, PR 응답 속도, merge rate, maintainer response를 합산해 repo health score를 만든다.
export const REPO_HEALTH_WEIGHTS = {
  RECENT_COMMIT: {
    weight: 30,
    rules: [
      { days: 30, score: 30 },
      { days: 90, score: 20 },
      { days: 180, score: 10 },
      { days: Infinity, score: 0 },
    ],
  },
  PR_RESPONSE_SPEED: {
    weight: 30,
    rules: [
      { days: 3, score: 30 },
      { days: 7, score: 20 },
      { days: 14, score: 10 },
      { days: Infinity, score: 0 },
    ],
  },
  MERGE_RATE: {
    weight: 25,
    rules: [
      { rate: 0.8, score: 25 },
      { rate: 0.6, score: 15 },
      { rate: 0.4, score: 5 },
      { rate: 0, score: 0 },
    ],
  },
  MAINTAINER_RESPONSE: {
    weight: 15,
    rules: [
      { ratio: 0.7, score: 15 },
      { ratio: 0.4, score: 8 },
      { ratio: 0, score: 4 },
    ],
  },
} as const

export const HEALTH_THRESHOLD = 50

export const SCORE_FILTER_THRESHOLDS = [10, 20, 30, 40, 50, 60, 70, 80, 90] as const
export type ScoreThreshold = typeof SCORE_FILTER_THRESHOLDS[number]

export const STAR_FILTER_THRESHOLDS = [100, 500, 1000, 5000] as const
export type StarThreshold = typeof STAR_FILTER_THRESHOLDS[number]
