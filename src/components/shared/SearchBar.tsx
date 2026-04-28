import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type SearchBarProps = {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    resultCount?: number
    className?: string
}

export function SearchBar({
    value,
    onChange,
    placeholder = '이슈 제목 또는 레포명 검색',
    resultCount,
    className,
}: SearchBarProps) {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-8 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                {value && (
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        aria-label="검색어 초기화"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
            {value && resultCount !== undefined && (
                <span className="shrink-0 text-xs text-muted-foreground">{resultCount}개 결과</span>
            )}
        </div>
    )
}
