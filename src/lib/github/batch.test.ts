import { describe, it, expect } from 'vitest'
import { encodeBatch, decodeBatch, INITIAL_BATCH } from '@/lib/github/batch'

describe('encodeBatch / decodeBatch', () => {
    it('encode → decode는 원본 객체를 복원한다', () => {
        const value = { TypeScript: 'cursor-abc', Python: 'cursor-xyz' }
        expect(decodeBatch<typeof value>(encodeBatch(value))).toEqual(value)
    })

    it('null 값을 포함한 객체도 round-trip된다', () => {
        // GitHub 언어별 cursor 중 일부가 null(첫 페이지)인 경우를 포함
        const value = { TypeScript: 'cursor-abc', Go: null }
        expect(decodeBatch<typeof value>(encodeBatch(value))).toEqual(value)
    })

    it('빈 객체도 round-trip된다', () => {
        expect(decodeBatch<object>(encodeBatch({}))).toEqual({})
    })

    it('잘못된 base64url 문자열은 null을 반환한다', () => {
        expect(decodeBatch('!!!invalid!!!')).toBeNull()
    })

    it('유효한 base64url이지만 JSON이 아닌 문자열은 null을 반환한다', () => {
        // 'not-json'을 base64url로 인코딩 — Buffer.from으로 직접 생성하면 JSON 파싱 실패
        const notJson = Buffer.from('not-json').toString('base64url')
        expect(decodeBatch(notJson)).toBeNull()
    })

    it('INITIAL_BATCH는 "initial" sentinel 값이다', () => {
        // service.ts에서 INITIAL_BATCH를 조건으로 decodeBatch 호출 여부를 분기하므로 값이 고정되어야 한다
        expect(INITIAL_BATCH).toBe('initial')
    })
})
