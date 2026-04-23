import { MessageCircle, Star } from 'lucide-react'
import type { ScoredIssue } from '@/types/issue'

type IssueMetricsProps = {
  commentCount: ScoredIssue['commentCount']
  stargazerCount: ScoredIssue['stargazerCount']
}

export function IssueMetrics({ commentCount, stargazerCount }: IssueMetricsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="flex items-center gap-1">
        <Star className="h-3 w-3" />
        {stargazerCount.toLocaleString()}
      </span>
      <span className="flex items-center gap-1">
        <MessageCircle className="h-3 w-3" />
        {commentCount}
      </span>
    </div>
  )
}
