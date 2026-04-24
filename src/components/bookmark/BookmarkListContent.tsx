import type { Bookmark } from '@/types/bookmark'

type BookmarkListContentProps = {
  bookmarks: Bookmark[]
}

export function BookmarkListContent({ bookmarks }: BookmarkListContentProps) {
  return (
    <div className="grid gap-4">
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          className="rounded-xl border border-border bg-card px-4 py-5 text-sm text-card-foreground shadow-xs"
        >
          {bookmark.issueTitle}
        </div>
      ))}
    </div>
  )
}
