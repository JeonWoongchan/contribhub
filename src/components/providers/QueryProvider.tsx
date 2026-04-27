'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GITHUB_API_CACHE_TTL_SECONDS } from '@/constants/scoring-rules'

export function QueryProvider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: GITHUB_API_CACHE_TTL_SECONDS * 1000,
                        retry: 1,
                    },
                },
            })
    )

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
