import type { CompetitionLevel } from '@/types/issue'
import type { ContributionType, ExperienceLevel, Purpose, WeeklyHours } from '@/types/user'

// ****규칙을 명확한 기준으로 재정비할 필요가 있음****
// GitHub Search API로 후보 이슈를 가져온 뒤, 아래 규칙으로 사용자 온보딩 답변과 이슈 메타데이터를 비교한다.
// 최종 score는 카드 우측 상단의 매칭 점수로 노출되며, 높은 점수일수록 사용자 설정에 더 잘 맞는 이슈로 본다.
export const PAGE_SIZE = 10
export const MATCH_SCORE_MINIMUM = 0
// 추천 목록에 노출할 최소 점수 — 미달 이슈는 랭킹 단계에서 제거
export const RANK_SCORE_THRESHOLD = 50
// GitHub API 권장 캐시 TTL (Cache-Control: max-age=60 기준)
export const GITHUB_API_CACHE_TTL_SECONDS = 60
// GitHub API 응답 대기 상한 — 초과 시 AbortError로 함수 조기 종료
export const GITHUB_API_TIMEOUT_MS = 8_000
// GitHub 검색 쿼리의 최소 star 수 — 완전히 방치된 저장소를 후보에서 제외
export const MIN_CANDIDATE_REPO_STARS = 50

// 온보딩의 선호 언어와 GitHub 저장소 primaryLanguage를 비교한다.
// 선택한 언어이면 순위 무관하게 동일 점수를 주고, 같은 계열 언어는 부분 점수를 준다.
export const LANGUAGE_SCORE = {
  EXACT: 30,
  RELATED: 15,
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
// UNKNOWN: 난이도 라벨 없음 — 모든 수준에 해당할 가능성이 있어 중간 점수를 부여한다.
export const DIFFICULTY_SCORE = {
  PERFECT: 25,
  ONE_ABOVE: 12,
  TWO_ABOVE: 6,
  THREE_ABOVE: 0,
  ONE_BELOW: 8,
  TWO_BELOW: 4,
  THREE_BELOW: 0,
  UNKNOWN: 12,
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
// UNKNOWN: 라벨·텍스트로 기여 방식을 감지할 수 없음 — 선택한 방식에 해당할 가능성이 있어 부분 점수를 부여한다.
// NO_MATCH: 기여 방식이 감지됐지만 선택한 방식과 다름 — 점수 없음.
export const CONTRIBUTION_TYPE_SCORE = {
  MATCH: 16,
  NO_MATCH: 0,
  UNKNOWN: 5,
} as const

// 댓글 수와 PR 연결 여부로 진입 경쟁도를 추정한다.
// 이미 PR이 있거나 토론이 많은 이슈는 초보자가 들어가기 어려울 수 있어 기본 감점한다.
export const COMPETITION_PENALTY = {
  PR_EXISTS: -10,
  NO_COMMENT: 4,
  ONE_COMMENT: 3,
  MEDIUM_ACTIVITY: -2,
  HIGH_ACTIVITY: -6,
  VERY_HIGH_ACTIVITY: -10,
} as const

// 전역 저장소 인지도 점수 — star 수가 많을수록 커뮤니티 활성도가 높다고 보고 가산 (최대 4점)
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
    OPEN: 4,
    ACTIVE: -2,
    HAS_PR: -8,
  },
  junior: {
    OPEN: 4,
    ACTIVE: 3,
    HAS_PR: -5,
  },
  mid: {
    OPEN: 3,
    ACTIVE: 8,
    HAS_PR: -2,
  },
  senior: {
    OPEN: 3,
    ACTIVE: 8,
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
    typeMatchBonus: 3,
    difficultyMatchBonus: 2,
    lowCommentBonus: 2,
  },
  5: {
    preferredTypes: ['doc', 'bug', 'test'],
    preferredDifficulties: ['beginner', 'junior', 'mid'],
    preferredMaxComments: 5,
    typeMatchBonus: 3,
    difficultyMatchBonus: 2,
    lowCommentBonus: 2,
  },
  10: {
    preferredTypes: ['doc', 'bug', 'test', 'feat', 'review'],
    preferredDifficulties: ['beginner', 'junior', 'mid', 'senior'],
    preferredMaxComments: 8,
    typeMatchBonus: 3,
    difficultyMatchBonus: 2,
    lowCommentBonus: 1,
  },
}

// 기여 목적은 GitHub API가 직접 주는 값이 아니므로 제품 정책으로 해석한다.
// portfolio: 결과물을 설명하기 쉬운 유명/건강한 저장소와 진입 가능한 작업을 우대
// growth: 학습 효과가 큰 기능/테스트/버그, 약간 도전적인 난이도를 우대
// community: 유지보수가 활발하고 꾸준히 참여하기 좋은 저장소와 작업을 우대
export const PURPOSE_SCORE_RULES: Record<
  Purpose,
  {
    openCompetitionBonus: number
    activeCompetitionBonus: number
    preferredTypes: ContributionType[]
    preferredDifficulties: ExperienceLevel[]
    preferredTypeBonus: number
    preferredDifficultyBonus: number
    // 포트폴리오 목적에서 인지도 있는 저장소에 추가 가산 — 0이면 미적용
    recognizedRepoStars: number
    recognizedRepoBonus: number
  }
> = {
  portfolio: {
    openCompetitionBonus: 2,
    activeCompetitionBonus: 1,
    preferredTypes: ['doc', 'bug', 'feat'],
    preferredDifficulties: ['beginner', 'junior'],
    preferredTypeBonus: 2,
    preferredDifficultyBonus: 2,
    recognizedRepoStars: 300,
    recognizedRepoBonus: 4,
  },
  growth: {
    openCompetitionBonus: 1,
    activeCompetitionBonus: 2,
    preferredTypes: ['feat', 'test', 'bug'],
    preferredDifficulties: ['junior', 'mid', 'senior'],
    preferredTypeBonus: 2,
    preferredDifficultyBonus: 2,
    recognizedRepoStars: 0,
    recognizedRepoBonus: 0,
  },
  community: {
    openCompetitionBonus: 2,
    activeCompetitionBonus: 1,
    preferredTypes: ['doc', 'bug', 'test'],
    preferredDifficulties: ['beginner', 'junior', 'mid'],
    preferredTypeBonus: 2,
    preferredDifficultyBonus: 2,
    recognizedRepoStars: 0,
    recognizedRepoBonus: 0,
  },
}

export const SCORE_FILTER_THRESHOLDS = [50, 60, 70, 80, 90] as const
export type ScoreThreshold = typeof SCORE_FILTER_THRESHOLDS[number]

export const STAR_FILTER_THRESHOLDS = [100, 300, 1000, 3000] as const
export type StarThreshold = typeof STAR_FILTER_THRESHOLDS[number]
