import type { RawIssue } from './issue'
import type { ContributionType } from './user'

export type BookmarkStatus = 'saved' | 'in_progress' | 'pr_open' | 'merged' | 'abandoned'

export interface Bookmark {
  id: string
  issueNumber: number
  repoFullName: string
  issueTitle: string
  issueUrl: string
  contributionType: ContributionType | null
  status: BookmarkStatus
  prUrl: string | null
  createdAt: string
  updatedAt: string
  githubIssue: RawIssue | null
}
