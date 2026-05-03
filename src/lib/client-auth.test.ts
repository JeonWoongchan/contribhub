import { describe, it, expect } from 'vitest'
import { isUnauthorizedApiResponse } from '@/lib/client-auth'
import type { ApiResponse } from '@/types/api'

function res(status: number): Response {
  return { status } as Response
}

function errJson(code?: string): ApiResponse<never> {
  return { ok: false, error: code ? { code } : undefined }
}

describe('isUnauthorizedApiResponse', () => {
  it('401 + UNAUTHORIZED 코드는 true를 반환한다', () => {
    expect(isUnauthorizedApiResponse(res(401), errJson('UNAUTHORIZED'))).toBe(true)
  })

  it('401 + NO_ACCESS_TOKEN 코드는 true를 반환한다', () => {
    expect(isUnauthorizedApiResponse(res(401), errJson('NO_ACCESS_TOKEN'))).toBe(true)
  })

  it('200 + UNAUTHORIZED 코드는 false를 반환한다', () => {
    expect(isUnauthorizedApiResponse(res(200), errJson('UNAUTHORIZED'))).toBe(false)
  })

  it('401이어도 ok=true이면 false를 반환한다', () => {
    const json: ApiResponse<null> = { ok: true, data: null }
    expect(isUnauthorizedApiResponse(res(401), json)).toBe(false)
  })

  it('401 + 다른 에러 코드는 false를 반환한다', () => {
    expect(isUnauthorizedApiResponse(res(401), errJson('GITHUB_ERROR'))).toBe(false)
  })

  it('401이어도 에러 코드가 없으면 false를 반환한다', () => {
    expect(isUnauthorizedApiResponse(res(401), errJson())).toBe(false)
  })
})
