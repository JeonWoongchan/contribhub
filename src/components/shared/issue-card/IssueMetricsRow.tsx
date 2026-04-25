import { MessageCircle, Star } from 'lucide-react'
import type { IssueCardItem } from '@/types/issue'

type IssueMetricsRowProps = {
  commentCount: IssueCardItem['commentCount']
  stargazerCount: IssueCardItem['stargazerCount']
}

export function IssueMetricsRow({ commentCount, stargazerCount }: IssueMetricsRowProps) {
  return (
    <>
      <span className="flex items-center gap-1">
        <Star className="h-3 w-3" />
        {stargazerCount.toLocaleString()}
      </span>
      <span className="flex items-center gap-1">
        <MessageCircle className="h-3 w-3" />
        {commentCount}
      </span>
    </>
  )
}
