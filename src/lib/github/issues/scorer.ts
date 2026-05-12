import type { CompetitionLevel, RawIssue, RepoActivityLevel, ScoredIssue } from '@/types/issue'
import type { ContributionType, ExperienceLevel, UserProfile } from '@/types/user'
import {
  COMPETITION_PENALTY,
  CONTRIBUTION_TYPE_LABELS,
  CONTRIBUTION_TYPE_SCORE,
  DIFFICULTY_LABELS,
  DIFFICULTY_SCORE,
  DIFFICULTY_UNKNOWN_BY_LEVEL,
  EXPERIENCE_COMPETITION_BONUS,
  EXPERIENCE_ORDER,
  LANGUAGE_GROUPS,
  LANGUAGE_SCORE,
  MATCH_SCORE_MINIMUM,
  PURPOSE_SCORE_RULES,
  REPO_ACTIVITY_THRESHOLDS,
  REPO_STAR_SCORE_TIERS,
  TIME_BUDGET_RULES,
} from '@/constants/scoring-rules'

// scoreIssue()가 각 채점 함수에 넘기는 컨텍스트.
// 이슈 원본에서 파생된 값과 프로필 값을 하나로 묶어 각 채점 함수가 필요한 것만 꺼내 쓴다.
type ScoringContext = {
  language: string | null
  commentCount: number
  hasPR: boolean
  stargazerCount: number
  difficultyLevel: ExperienceLevel | null
  contributionType: ContributionType | null
  competitionLevel: CompetitionLevel
  competitionPenalty: number
  topLanguages: string[]
  experienceLevel: ExperienceLevel | null
  contributionTypes: ContributionType[]
  weeklyHours: UserProfile['weeklyHours']
  purpose: UserProfile['purpose']
}

function normalizeLabels(labelNames: string[]): string[] {
  return labelNames.map((label) => label.toLowerCase())
}

function normalizeText(parts: Array<string | null | undefined>): string {
  return parts.filter(Boolean).join(' ').toLowerCase()
}

function floorScore(score: number): number {
  return Math.max(MATCH_SCORE_MINIMUM, score)
}

// 온보딩의 선호 언어와 GitHub repository.primaryLanguage를 비교한다.
// 후보 조회 자체도 language qualifier로 좁히지만, 최종 랭킹에서 정확/관련 언어를 다시 가산한다.
// 선택한 언어라면 순위 무관하게 동일 점수를 부여한다.
function scoreLanguage(issueLanguage: string | null, userLanguages: string[]): number {
  if (!issueLanguage) return LANGUAGE_SCORE.NO_MATCH

  if (userLanguages.includes(issueLanguage)) return LANGUAGE_SCORE.EXACT

  const group = LANGUAGE_GROUPS.find((languages) => languages.includes(issueLanguage))
  const hasRelated = group ? group.some((language) => userLanguages.includes(language)) : false

  return hasRelated ? LANGUAGE_SCORE.RELATED : LANGUAGE_SCORE.NO_MATCH
}

// GitHub Issue에는 공식 난이도 필드가 없다.
// 오탐 방지를 위해 이슈 라벨만 검사한다. 제목·본문은 "easy fix가 아니다" 같은 부정 문맥으로 오탐이 많다.
function detectDifficulty(normalizedLabelNames: string[]): ExperienceLevel | null {
  for (const [level, keywords] of Object.entries(DIFFICULTY_LABELS) as [ExperienceLevel, string[]][]) {
    if (keywords.some((keyword) => normalizedLabelNames.some((label) => label.includes(keyword)))) {
      return level
    }
  }
  return null
}

// 온보딩의 경험 수준과 추정 난이도를 비교한다.
// 같은 수준은 가장 높게, 한 단계 높은 이슈는 성장 가능한 작업으로 일부 가산한다.
function scoreDifficulty(
  issueDifficulty: ExperienceLevel | null,
  userLevel: ExperienceLevel | null
): number {
  // 경험 수준 미설정 — 수준별 분기 불가, junior 중립값 사용
  if (!userLevel) return DIFFICULTY_UNKNOWN_BY_LEVEL['junior']
  // 난이도 라벨 없음 — 경험 수준이 높을수록 긍정 신호
  if (!issueDifficulty) return DIFFICULTY_UNKNOWN_BY_LEVEL[userLevel]

  const issueIndex = EXPERIENCE_ORDER.indexOf(issueDifficulty)
  const userIndex = EXPERIENCE_ORDER.indexOf(userLevel)
  const difference = issueIndex - userIndex

  if (difference === 0) {
    return DIFFICULTY_SCORE.PERFECT
  }

  if (difference === 1) {
    return DIFFICULTY_SCORE.ONE_ABOVE
  }

  if (difference === 2) {
    return DIFFICULTY_SCORE.TWO_ABOVE
  }

  if (difference >= 3) {
    return DIFFICULTY_SCORE.THREE_ABOVE
  }

  if (difference === -1) {
    return DIFFICULTY_SCORE.ONE_BELOW
  }

  if (difference === -2) {
    return DIFFICULTY_SCORE.TWO_BELOW
  }

  return DIFFICULTY_SCORE.THREE_BELOW
}

// 온보딩의 기여 방식과 맞는지 판단하기 위해 이슈 라벨뿐 아니라 제목/본문 키워드도 함께 본다.
// review는 issue 자체로 안정적으로 분류하기 어려워 PR 연결과 일정 수준 이상의 토론이 있는 경우에만 보조 추정한다.
function detectContributionType(
  normalizedLabelNames: string[],
  searchableText: string,
  commentCount: number,
  hasPR: boolean
): ContributionType | null {
  for (const [type, keywords] of Object.entries(CONTRIBUTION_TYPE_LABELS) as [ContributionType, string[]][]) {
    if (
      keywords.some(
        (keyword) =>
          normalizedLabelNames.some((label) => label.includes(keyword)) || searchableText.includes(keyword)
      )
    ) {
      return type
    }
  }

  if (hasPR && commentCount >= 2) {
    return 'review'
  }

  return null
}

// 사용자가 선택한 기여 방식과 이슈 작업 성격이 맞으면 매칭 점수에 반영한다.
// 선택한 방식이면 순위 무관하게 동일 점수를 부여하고, 그 외는 0점이다.
function scoreContributionType(
  issueType: ContributionType | null,
  userTypes: ContributionType[]
): number {
  if (!issueType) return CONTRIBUTION_TYPE_SCORE.UNKNOWN
  return userTypes.includes(issueType) ? CONTRIBUTION_TYPE_SCORE.MATCH : CONTRIBUTION_TYPE_SCORE.NO_MATCH
}

// 댓글 수와 PR 연결 여부로 경쟁도를 추정한다.
// 이미 PR이 있거나 댓글이 많으면 다른 기여자가 선점했을 가능성이 있어 기본 감점한다.
function detectCompetition(
  commentCount: number,
  hasPR: boolean
): { level: CompetitionLevel; penalty: number } {
  if (hasPR) {
    return { level: 'HAS_PR', penalty: COMPETITION_PENALTY.PR_EXISTS }
  }

  if (commentCount >= 10) {
    return { level: 'ACTIVE', penalty: COMPETITION_PENALTY.VERY_HIGH_ACTIVITY }
  }

  if (commentCount >= 5) {
    return { level: 'ACTIVE', penalty: COMPETITION_PENALTY.HIGH_ACTIVITY }
  }

  if (commentCount >= 2) {
    return { level: 'ACTIVE', penalty: COMPETITION_PENALTY.MEDIUM_ACTIVITY }
  }

  if (commentCount === 1) {
    return { level: 'OPEN', penalty: COMPETITION_PENALTY.ONE_COMMENT }
  }

  return { level: 'OPEN', penalty: COMPETITION_PENALTY.NO_COMMENT }
}

// 저장소 star 수 기반 인지도 점수 — health 차원 대체, 추가 API 호출 없이 검색 결과에서 직접 사용
function scoreStars(stargazerCount: number): number {
  return REPO_STAR_SCORE_TIERS.find((tier) => stargazerCount >= tier.stars)?.score ?? 0
}

// pushedAt 경과일을 기준으로 reactions를 보조 신호로 사용해 3단계 활성도 판별
export function detectRepoActivity(pushedAt: string, reactionCount: number): RepoActivityLevel {
  const daysSincePush = (Date.now() - new Date(pushedAt).getTime()) / 86_400_000

  if (
    daysSincePush <= REPO_ACTIVITY_THRESHOLDS.ACTIVE_PUSH_DAYS ||
    (daysSincePush <= REPO_ACTIVITY_THRESHOLDS.ACTIVE_COMMUNITY_PUSH_DAYS &&
      reactionCount >= REPO_ACTIVITY_THRESHOLDS.COMMUNITY_BOOST_SIGNAL)
  ) return 'active'
  if (daysSincePush <= REPO_ACTIVITY_THRESHOLDS.MODERATE_PUSH_DAYS) return 'moderate'
  return 'quiet'
}

// 경험 수준은 난이도뿐 아니라 경쟁도와도 연결한다.
// 입문자는 경쟁이 적은 OPEN 이슈를 우대하고, 숙련자는 토론이 진행 중인 ACTIVE 이슈도 허용한다.
function scoreExperienceCompetitionFit(
  userLevel: ExperienceLevel | null,
  competitionLevel: CompetitionLevel
): number {
  if (!userLevel) {
    return 0
  }

  return EXPERIENCE_COMPETITION_BONUS[userLevel][competitionLevel]
}

// 온보딩의 작업 시간 답변을 이슈의 작업 성격, 난이도, 댓글 수와 비교한다.
// 일치 시 가산만 하며, 불일치 감점은 없다.
function scoreTimeBudgetFit(
  weeklyHours: UserProfile['weeklyHours'],
  issueType: ContributionType | null,
  issueDifficulty: ExperienceLevel | null,
  commentCount: number
): number {
  if (!weeklyHours) return 0

  const rule = TIME_BUDGET_RULES[weeklyHours]
  let score = 0

  if (issueType && rule.preferredTypes.includes(issueType)) {
    score += rule.typeMatchBonus
  }

  if (issueDifficulty && rule.preferredDifficulties.includes(issueDifficulty)) {
    score += rule.difficultyMatchBonus
  }

  if (commentCount <= rule.preferredMaxComments) {
    score += Math.max(0, rule.lowCommentBonus - commentCount)
  }

  return score
}

// 온보딩의 기여 목적은 GitHub API가 직접 제공하지 않기 때문에 제품 정책으로 해석한다.
// 포트폴리오, 성장, 커뮤니티 목적에 따라 경쟁도/작업 성격/난이도를 다르게 가산한다.
function scorePurposeFit(
  purpose: UserProfile['purpose'],
  issueType: ContributionType | null,
  issueDifficulty: ExperienceLevel | null,
  competitionLevel: CompetitionLevel,
  stargazerCount: number
): number {
  if (!purpose) {
    return 0
  }

  const rule = PURPOSE_SCORE_RULES[purpose]
  let score = 0

  if (competitionLevel === 'OPEN') {
    score += rule.openCompetitionBonus
  } else if (competitionLevel === 'ACTIVE') {
    score += rule.activeCompetitionBonus
  }

  if (issueType && rule.preferredTypes.includes(issueType)) {
    score += rule.preferredTypeBonus
  }

  if (issueDifficulty && rule.preferredDifficulties.includes(issueDifficulty)) {
    score += rule.preferredDifficultyBonus
  }

  // 포트폴리오 목적에서 인지도 있는 저장소 가산 — recognizedRepoStars가 0이면 미적용
  if (rule.recognizedRepoStars > 0 && stargazerCount >= rule.recognizedRepoStars) {
    score += rule.recognizedRepoBonus
  }

  return score
}

// 채점 차원 레지스트리 — 차원 추가/제거/비활성화는 이 배열만 수정한다.
// 순서는 점수 결과에 영향을 주지 않는다(합산이므로).
// 각 항목의 score 함수는 ScoringContext에서 필요한 값만 꺼내 계산한다.
const SCORING_DIMENSIONS: Array<{ key: string; score: (ctx: ScoringContext) => number }> = [
  {
    key: 'language',
    score: (ctx) => scoreLanguage(ctx.language, ctx.topLanguages),
  },
  {
    key: 'difficulty',
    score: (ctx) => scoreDifficulty(ctx.difficultyLevel, ctx.experienceLevel),
  },
  {
    key: 'contributionType',
    score: (ctx) => scoreContributionType(ctx.contributionType, ctx.contributionTypes),
  },
  {
    key: 'competitionFit',
    score: (ctx) => scoreExperienceCompetitionFit(ctx.experienceLevel, ctx.competitionLevel),
  },
  {
    key: 'competitionPenalty',
    score: (ctx) => ctx.competitionPenalty,
  },
  {
    key: 'timeBudget',
    score: (ctx) =>
      scoreTimeBudgetFit(ctx.weeklyHours, ctx.contributionType, ctx.difficultyLevel, ctx.commentCount),
  },
  {
    key: 'purpose',
    score: (ctx) =>
      scorePurposeFit(ctx.purpose, ctx.contributionType, ctx.difficultyLevel, ctx.competitionLevel, ctx.stargazerCount),
  },
  {
    key: 'stars',
    score: (ctx) => scoreStars(ctx.stargazerCount),
  },
]

export function scoreIssue(
  raw: RawIssue,
  profile: Pick<
    UserProfile,
    'topLanguages' | 'experienceLevel' | 'contributionTypes' | 'weeklyHours' | 'purpose'
  >,
): ScoredIssue {
  // GitHub GraphQL로 받은 issue 원본 데이터에서 추천 계산에 필요한 신호를 꺼낸다.
  // label/title/body는 난이도와 기여 방식을 추정하는 데 쓰고, comments/timeline은 경쟁도를 추정하는 데 쓴다.
  const labelNames = raw.labels.nodes.map((label) => label.name)
  const normalizedLabelNames = normalizeLabels(labelNames)
  const searchableText = normalizeText([raw.title, raw.body])
  const language = raw.repository.primaryLanguage?.name ?? null
  const commentCount = raw.comments.totalCount
  const hasPR = raw.timelineItems.nodes.some(
    (node) => (node as { __typename: string }).__typename === 'CrossReferencedEvent'
  )

  const difficultyLevel = detectDifficulty(normalizedLabelNames)
  const contributionType = detectContributionType(normalizedLabelNames, searchableText, commentCount, hasPR)
  const { level: competitionLevel, penalty: competitionPenalty } = detectCompetition(commentCount, hasPR)
  const repoActivityLevel = detectRepoActivity(raw.repository.pushedAt, raw.reactions.totalCount)

  const ctx: ScoringContext = {
    language,
    commentCount,
    hasPR,
    stargazerCount: raw.repository.stargazerCount,
    difficultyLevel,
    contributionType,
    competitionLevel,
    competitionPenalty,
    topLanguages: profile.topLanguages,
    experienceLevel: profile.experienceLevel,
    contributionTypes: profile.contributionTypes,
    weeklyHours: profile.weeklyHours,
    purpose: profile.purpose,
  }

  // SCORING_DIMENSIONS를 순회해 각 차원의 점수를 합산한다.
  // 최종 매칭 점수는 카드 우측 상단에 표시되며, 리스트는 높은 점수순으로 정렬된다.
  const score = floorScore(SCORING_DIMENSIONS.reduce((sum, dim) => sum + dim.score(ctx), 0))

  return {
    number: raw.number,
    title: raw.title,
    url: raw.url,
    repoFullName: raw.repository.nameWithOwner,
    repoUrl: raw.repository.url,
    language,
    stargazerCount: raw.repository.stargazerCount,
    labels: labelNames,
    commentCount,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    score,
    difficultyLevel,
    contributionType,
    competitionLevel,
    hasPR,
    repoActivityLevel,
  }
}
