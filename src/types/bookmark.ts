import type { RawIssue } from './issue'
import type { ContributionType } from './user'

export interface Bookmark {
  id: string
  issueNumber: number
  repoFullName: string
  issueTitle: string
  issueUrl: string
  contributionType: ContributionType | null
  createdAt: string
  updatedAt: string
  githubIssue: RawIssue | null
}
