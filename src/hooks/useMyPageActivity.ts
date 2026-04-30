'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchApi } from '@/lib/fetch-api'
import type { MyPageActivity } from '@/lib/user/my-page'
import { QUERY_KEYS, toBaseResult, type BaseQueryResult } from './queryKeys'

export type UseMyPageActivityResult = BaseQueryResult & {
    data: MyPageActivity | null
}

const DEFAULT_ERROR_MESSAGE = '활동 데이터를 불러오지 못했습니다.'

export function useMyPageActivity(): UseMyPageActivityResult {
    const query = useQuery({
        queryKey: QUERY_KEYS.myPageActivity,
        queryFn: () => fetchApi<MyPageActivity>('/api/mypage/activity', DEFAULT_ERROR_MESSAGE),
    })

    return {
        ...toBaseResult(query, DEFAULT_ERROR_MESSAGE),
        data: query.data ?? null,
    }
}
