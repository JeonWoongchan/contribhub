import { describe, it, expect } from 'vitest'
import { getBookmarkFailureMessage, getBookmarkKey } from './useIssueBookmarks'

// ─── getBookmarkFailureMessage ───────────────────────────────────────────────
// 북마크 실패 시 toast에 표시되는 메시지를 생성하는 함수.
// wasBookmarked 상태에 따라 "저장" 또는 "제거" 동작 문구가 달라진다.

describe('getBookmarkFailureMessage', () => {
    it('북마크 등록 실패 시 "저장" 문구를 포함한 메시지를 반환한다', () => {
        const message = getBookmarkFailureMessage(false)
        expect(message).toContain('저장')
        expect(message).toContain('잠시 후 다시 시도해 주세요')
    })

    it('북마크 제거 실패 시 "제거" 문구를 포함한 메시지를 반환한다', () => {
        const message = getBookmarkFailureMessage(true)
        expect(message).toContain('제거')
        expect(message).toContain('잠시 후 다시 시도해 주세요')
    })

})

// ─── getBookmarkKey ──────────────────────────────────────────────────────────
// 이슈 카드를 고유하게 식별하는 키 생성 함수.
// optimisticIssues 병합, pendingBookmarkKeys 중복 방지에 사용된다.

describe('getBookmarkKey', () => {
    it('"repoFullName#number" 형식의 키를 반환한다', () => {
        const key = getBookmarkKey({ repoFullName: 'owner/repo', number: 42 })
        expect(key).toBe('owner/repo#42')
    })

    it('같은 레포의 다른 이슈 번호는 서로 다른 키를 가진다', () => {
        const key1 = getBookmarkKey({ repoFullName: 'owner/repo', number: 1 })
        const key2 = getBookmarkKey({ repoFullName: 'owner/repo', number: 2 })
        expect(key1).not.toBe(key2)
    })

    it('같은 이슈 번호라도 레포가 다르면 서로 다른 키를 가진다', () => {
        const key1 = getBookmarkKey({ repoFullName: 'owner/repo-a', number: 1 })
        const key2 = getBookmarkKey({ repoFullName: 'owner/repo-b', number: 1 })
        expect(key1).not.toBe(key2)
    })
})
