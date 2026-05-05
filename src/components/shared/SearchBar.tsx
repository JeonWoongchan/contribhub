import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type SearchBarProps = {
  value: string
  onChangeAction: (value: string) => void
  placeholder?: string
  resultCount?: number
  totalCount?: number
  className?: string
}

export function SearchBar({
  value,
  onChangeAction,
  placeholder = '이슈 제목 또는 레포명 검색',
  resultCount,
  totalCount,
  className,
}: SearchBarProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={value}
          onChange={(event) => onChangeAction(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-8 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChangeAction('')}
            aria-label="검색어 초기화"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      {value && resultCount !== undefined ? (
        <span className="shrink-0 text-xs text-muted-foreground">
          {resultCount}개 결과
          {totalCount !== undefined ? ` · 로드된 ${totalCount}개 항목 기준` : null}
        </span>
      ) : null}
    </div>
  )
}
