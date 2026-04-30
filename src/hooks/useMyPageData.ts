'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchApi } from '@/lib/fetch-api'
import type { MyPageData } from '@/lib/user/my-page'
import { QUERY_KEYS, toBaseResult, type BaseQueryResult } from './queryKeys'

export type UseMyPageDataResult = BaseQueryResult & {
    data: MyPageData | null
}

const DEFAULT_ERROR_MESSAGE = '마이페이지 데이터를 불러오지 못했습니다.'

export function useMyPageData(): UseMyPageDataResult {
    const query = useQuery({
        queryKey: QUERY_KEYS.myPage,
        queryFn: () => fetchApi<MyPageData>('/api/mypage', DEFAULT_ERROR_MESSAGE),
    })

    return {
        ...toBaseResult(query, DEFAULT_ERROR_MESSAGE),
        data: query.data ?? null,
    }
}
