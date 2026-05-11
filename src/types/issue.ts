import type { ScoreThreshold, StarThreshold } from '@/constants/scoring-rules'
import type { ContributionType, ExperienceLevel } from './user'

export type CompetitionLevel = 'OPEN' | 'ACTIVE' | 'HAS_PR'
export type DifficultyLevel = ExperienceLevel

export type IssueFilters = {
  language: string | null
  difficultyLevel: DifficultyLevel | null
  contributionTypes: ContributionType[]
  minScore: ScoreThreshold | null
  minStars: StarThreshold | null
}

export const EMPTY_ISSUE_FILTERS: IssueFilters = {
  language: null,
  difficultyLevel: null,
  contributionTypes: [],
  minScore: null,
  minStars: null,
}

export interface RawIssue {
  number: number
  title: string
  url: string
  body: string | null
  createdAt: string
  updatedAt: string
  comments: { totalCount: number }
  labels: { nodes: { name: string }[] }
  repository: {
    nameWithOwner: string
    url: string
    primaryLanguage: { name: string } | null
    stargazerCount: number
  }
  // GraphQL로 연결된 PR 존재 여부
  timelineItems: {
    nodes: { __typename: string }[]
  }
}

export interface ScoredIssue {
  // 원본 데이터
  number: number
  title: string
  url: string
  repoFullName: string
  repoUrl: string
  language: string | null
  stargazerCount: number
  labels: string[]
  commentCount: number
  createdAt: string
  updatedAt: string

  // 스코어링 결과
  score: number
  difficultyLevel: DifficultyLevel | null
  contributionType: ContributionType | null
  competitionLevel: CompetitionLevel
  hasPR: boolean
  isBookmarked?: boolean
}

export interface IssueCardItem {
  number: number
  title: string
  url: string
  repoFullName: string
  repoUrl: string
  language: string | null
  stargazerCount: number
  labels: string[]
  commentCount: number
  createdAt: string
  updatedAt: string
  score: number | null
  difficultyLevel: DifficultyLevel | null
  contributionType: ContributionType | null
  competitionLevel: CompetitionLevel | null
  hasPR: boolean
  isBookmarked?: boolean
}
