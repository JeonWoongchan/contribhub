import type { ReactNode } from 'react'
import { SearchBar } from './SearchBar'

type SearchBarRowProps = {
    value: string
    onChangeAction: (value: string) => void
    resultCount?: number
    totalCount?: number
    placeholder?: string
    helpSlot?: ReactNode
}

export function SearchBarRow({ helpSlot, ...searchBarProps }: SearchBarRowProps) {
    return (
        <div className="flex items-center gap-2">
            <SearchBar {...searchBarProps} className="flex-1" />
            {helpSlot}
        </div>
    )
}
