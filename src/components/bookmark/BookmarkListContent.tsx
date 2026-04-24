import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Bookmark, BookmarkStatus } from '@/types/bookmark'

type BookmarkListContentProps = {
  bookmarks: Bookmark[]
}

const STATUS_LABELS: Record<BookmarkStatus, string> = {
  saved: '저장됨',
  in_progress: '진행 중',
  pr_open: 'PR 열림',
  merged: '머지됨',
  abandoned: '중단됨',
}

export function BookmarkListContent({ bookmarks }: BookmarkListContentProps) {
  return (
    <div className="grid gap-4">
      {bookmarks.map((bookmark) => {
        const githubIssue = bookmark.githubIssue

        return (
          <Card key={bookmark.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{bookmark.repoFullName}</p>
                <CardTitle className="text-base leading-6">
                  {githubIssue?.title ?? bookmark.issueTitle}
                </CardTitle>
              </div>
              <Badge variant="secondary">{STATUS_LABELS[bookmark.status]}</Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">#{bookmark.issueNumber}</Badge>
                {bookmark.contributionType ? (
                  <Badge variant="outline">{bookmark.contributionType}</Badge>
                ) : null}
                {/*{githubIssue?.state ? <Badge variant="outline">{githubIssue.state}</Badge> : null}*/}
              </div>
              <p>저장일 {new Date(bookmark.createdAt).toLocaleDateString('ko-KR')}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
