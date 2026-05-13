import { describe, it, expect } from 'vitest'
import {
    decodeBatch,
    encodeBatch,
    INITIAL_BATCH,
    MAX_BATCH_PARAM_LENGTH,
    normalizeBatchCursors,
    parseBatchParam,
} from '@/lib/github/batch'

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

describe('parseBatchParam', () => {
    it('initial sentinel을 빈 cursor 객체로 변환한다', () => {
        expect(parseBatchParam(INITIAL_BATCH)).toEqual({
            ok: true,
            batchParam: INITIAL_BATCH,
            afterCursors: {},
        })
    })

    it('정상 batch cursor 객체를 허용한다', () => {
        const cursors = { TypeScript: 'cursor-abc', Python: null }
        const batchParam = encodeBatch(cursors)

        expect(parseBatchParam(batchParam)).toEqual({
            ok: true,
            batchParam,
            afterCursors: cursors,
        })
    })

    it('깨진 batch 값은 invalid로 거부한다', () => {
        expect(parseBatchParam('!!!invalid!!!')).toEqual({ ok: false, reason: 'invalid' })
    })

    it('객체가 아닌 decoded 값은 invalid로 거부한다', () => {
        expect(parseBatchParam(encodeBatch(['cursor']))).toEqual({ ok: false, reason: 'invalid' })
    })

    it('길이 제한을 초과한 batch 값은 too_long으로 거부한다', () => {
        expect(parseBatchParam('a'.repeat(MAX_BATCH_PARAM_LENGTH + 1))).toEqual({
            ok: false,
            reason: 'too_long',
        })
    })
})

describe('normalizeBatchCursors', () => {
    it('프로필 언어에 해당하는 cursor만 정렬된 순서로 남긴다', () => {
        expect(normalizeBatchCursors(
            { Rust: 'cursor-rust', TypeScript: 'cursor-ts', Python: null },
            ['Python', 'TypeScript']
        )).toEqual({
            Python: null,
            TypeScript: 'cursor-ts',
        })
    })

    it('프로필 언어와 맞는 key가 없으면 빈 객체를 반환한다', () => {
        expect(normalizeBatchCursors({ Rust: 'cursor-rust' }, ['TypeScript'])).toEqual({})
    })
})
