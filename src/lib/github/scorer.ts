import type { RawIssue, ScoredIssue, CompetitionLevel } from '@/types/issue'
import type { UserProfile, ContributionType, ExperienceLevel } from '@/types/user'
import {
  LANGUAGE_SCORE,
  LANGUAGE_GROUPS,
  DIFFICULTY_SCORE,
  EXPERIENCE_ORDER,
  DIFFICULTY_LABELS,
  CONTRIBUTION_TYPE_LABELS,
  CONTRIBUTION_TYPE_SCORE,
  COMPETITION_PENALTY,
  HEALTH_BONUS,
} from '@/constants/scoring-rules'

/**
 * 이슈 스코어링 로직 (0~100점)
 *
 * 점수 구성:
 *   언어 매칭        최대 30점  — 유저 선호 언어와 이슈 레포 언어 일치 여부
 *   난이도 매칭      최대 25점  — 유저 경험 수준과 이슈 난이도 라벨 일치 여부
 *   기여 방식 매칭   최대 20점  — 유저 선호 기여 방식과 이슈 라벨 일치 여부
 *   레포 활성도      최대 15점  — 레포 건강도 점수 기반 보너스
 *   경쟁도 페널티   최대 -15점  — 이미 PR 있거나 댓글 많은 이슈 감점
 *
 * 규칙 상수는 scoring-rules.ts에서 관리 — 점수 조정 시 그 파일만 수정
 */


// 라벨 정규화 — 소문자 변환
function normalizeLabels(labelNames: string[]): string[] {
  return labelNames.map((l) => l.toLowerCase())
}

// ── 언어 매칭 ────────────────────────────────────────────
function scoreLanguage(issueLanguage: string | null, userLanguages: string[]): number {
  if (!issueLanguage) return 0

  if (userLanguages.includes(issueLanguage)) return LANGUAGE_SCORE.EXACT_MATCH

  const group = LANGUAGE_GROUPS.find((g) => g.includes(issueLanguage))
  if (group && group.some((lang) => userLanguages.includes(lang))) {
    return LANGUAGE_SCORE.RELATED
  }

  return LANGUAGE_SCORE.NO_MATCH
}

// ── 난이도 판별 ───────────────────────────────────────────
function detectDifficulty(labelNames: string[]): ExperienceLevel | null {
  const lower = normalizeLabels(labelNames)

  for (const [level, keywords] of Object.entries(DIFFICULTY_LABELS) as [ExperienceLevel, string[]][]) {
    if (keywords.some((kw) => lower.some((l) => l.includes(kw)))) {
      return level
    }
  }
  return null
}

function scoreDifficulty(
  issueDifficulty: ExperienceLevel | null,
  userLevel: ExperienceLevel | null
): number {
  if (!issueDifficulty || !userLevel) return 0

  const issueIdx = EXPERIENCE_ORDER.indexOf(issueDifficulty)
  const userIdx  = EXPERIENCE_ORDER.indexOf(userLevel)
  const diff = issueIdx - userIdx

  if (diff === 0)  return DIFFICULTY_SCORE.PERFECT
  if (diff === 1)  return DIFFICULTY_SCORE.ONE_ABOVE
  if (diff === 2)  return DIFFICULTY_SCORE.TWO_ABOVE
  if (diff < 0)   return DIFFICULTY_SCORE.BELOW
  return 0
}

// ── 기여 방식 판별 ────────────────────────────────────────
function detectContributionType(labelNames: string[]): ContributionType | null {
  const lower = normalizeLabels(labelNames)

  for (const [type, keywords] of Object.entries(CONTRIBUTION_TYPE_LABELS) as [ContributionType, string[]][]) {
    if (keywords.length > 0 && keywords.some((kw) => lower.some((l) => l.includes(kw)))) {
      return type
    }
  }
  return null
}

function scoreContributionType(
  issueType: ContributionType | null,
  userTypes: ContributionType[]
): number {
  if (!issueType) return 0
  return userTypes.includes(issueType)
    ? CONTRIBUTION_TYPE_SCORE.MATCH
    : CONTRIBUTION_TYPE_SCORE.NO_MATCH
}

// ── 경쟁도 ────────────────────────────────────────────────
function detectCompetition(
  commentCount: number,
  hasPR: boolean
): { level: CompetitionLevel; penalty: number } {
  if (hasPR) return { level: 'TAKEN', penalty: COMPETITION_PENALTY.PR_EXISTS }
  if (commentCount >= 5) return { level: 'COMPETITIVE', penalty: COMPETITION_PENALTY.HIGH_ACTIVITY }
  if (commentCount >= 2) return { level: 'COMPETITIVE', penalty: COMPETITION_PENALTY.MEDIUM_ACTIVITY }
  return { level: 'OPEN', penalty: COMPETITION_PENALTY.LOW_ACTIVITY }
}

// ── 레포 활성도 보너스 ────────────────────────────────────
function scoreHealth(healthScore: number | null): number {
  if (healthScore === null) return 0
  if (healthScore >= 80) return HEALTH_BONUS.HIGH
  if (healthScore >= 60) return HEALTH_BONUS.MID
  if (healthScore >= 40) return HEALTH_BONUS.LOW
  return 0
}

// ── 메인 스코어링 함수 ────────────────────────────────────
export function scoreIssue(
  raw: RawIssue,
  profile: Pick<UserProfile, 'topLanguages' | 'experienceLevel' | 'contributionTypes'>,
  healthScore: number | null = null
): ScoredIssue {
  const labelNames = raw.labels.nodes.map((l) => l.name)
  const language   = raw.repository.primaryLanguage?.name ?? null
  const commentCount = raw.comments.totalCount
  const hasPR = raw.timelineItems.nodes.some(
    (n) => (n as { __typename: string }).__typename === 'CrossReferencedEvent'
  )

  const difficultyLevel   = detectDifficulty(labelNames)
  const contributionType  = detectContributionType(labelNames)
  const { level: competitionLevel, penalty } = detectCompetition(commentCount, hasPR)

  const score = Math.max(
    0,
    scoreLanguage(language, profile.topLanguages) +
    scoreDifficulty(difficultyLevel, profile.experienceLevel) +
    scoreContributionType(contributionType, profile.contributionTypes) +
    penalty +
    scoreHealth(healthScore)
  )

  return {
    number:          raw.number,
    title:           raw.title,
    url:             raw.url,
    repoFullName:    raw.repository.nameWithOwner,
    language,
    stargazerCount:  raw.repository.stargazerCount,
    labels:          labelNames,
    commentCount,
    createdAt:       raw.createdAt,
    updatedAt:       raw.updatedAt,
    score,
    difficultyLevel,
    contributionType,
    competitionLevel,
    hasPR,
    healthScore,
  }
}
