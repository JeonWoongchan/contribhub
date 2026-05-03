// pull-requests.test.ts
// excludeOwnRepoPRs()와 computeSummary()를 검증하는 단위 테스트 파일.
//
// 왜 이 파일이 필요한가?
//   excludeOwnRepoPRs: 본인 레포 PR이 오픈소스 기여 목록에 섞이면
//     PR 히스토리 통계가 부풀려지는 버그가 발생한다.
//   computeSummary: 합산 로직이 잘못되면 PR 히스토리 통계 카드 전체가 틀린 값을 보여준다.

import { describe, it, expect } from 'vitest'
import { excludeOwnRepoPRs, computeSummary } from '@/lib/github/pull-requests'
import type { PullRequestItem } from '@/types/pull-request'

// ─── Factory Function ───────────────────────────────────────────────────────
/** 테스트용 PullRequestItem 기본값 생성 함수. */
function makePRItem(overrides: Partial<PullRequestItem> = {}): PullRequestItem {
    return {
        title: 'Fix login bug',
        url: 'https://github.com/other-owner/repo/pull/1',
        state: 'MERGED',
        createdAt: '2024-01-01T00:00:00Z',
        mergedAt: '2024-01-02T00:00:00Z',
        closedAt: null,
        additions: 10,
        deletions: 5,
        changedFiles: 2,
        commentCount: 1,
        reviewCount: 1,
        commitCount: 1,
        labels: [],
        repoFullName: 'other-owner/repo',
        repoUrl: 'https://github.com/other-owner/repo',
        stargazerCount: 100,
        language: 'TypeScript',
        ...overrides,
    }
}

// ─── excludeOwnRepoPRs ──────────────────────────────────────────────────────
// repoFullName은 "owner/repo" 형식이다.
// viewerLogin이 'my-account'라면 'my-account/my-project'는 본인 레포로 제외한다.
describe('excludeOwnRepoPRs', () => {

    it('본인 레포(my-account/repo)의 PR은 결과에서 제외된다', () => {
        const items = [
            makePRItem({ repoFullName: 'my-account/my-project' }),  // 본인 레포
            makePRItem({ repoFullName: 'other-owner/cool-lib' }),    // 타인 레포
        ]
        const result = excludeOwnRepoPRs(items, 'my-account')
        expect(result).toHaveLength(1)
        expect(result[0].repoFullName).toBe('other-owner/cool-lib')
    })

    it('본인 레포 PR이 없으면 목록 전체를 반환한다', () => {
        const items = [
            makePRItem({ repoFullName: 'owner-a/repo' }),
            makePRItem({ repoFullName: 'owner-b/repo' }),
        ]
        expect(excludeOwnRepoPRs(items, 'my-account')).toHaveLength(2)
    })

    it('viewerLogin이 빈 문자열이면 필터링 없이 전체를 반환한다', () => {
        // viewerLogin을 알 수 없는 경우를 안전하게 처리해야 한다
        const items = [makePRItem({ repoFullName: 'someone/repo' })]
        expect(excludeOwnRepoPRs(items, '')).toHaveLength(1)
    })

    it('모든 PR이 본인 레포면 빈 배열을 반환한다', () => {
        const items = [
            makePRItem({ repoFullName: 'my-account/repo-a' }),
            makePRItem({ repoFullName: 'my-account/repo-b' }),
        ]
        expect(excludeOwnRepoPRs(items, 'my-account')).toHaveLength(0)
    })

    it('소유자 이름만 일치하고 슬래시 이후가 다른 PR은 제외된다', () => {
        // 'my-account/anything' 패턴으로 처리하므로 하위 레포도 제외
        const items = [
            makePRItem({ repoFullName: 'my-account/repo-1' }),
            makePRItem({ repoFullName: 'my-account/repo-2' }),
            makePRItem({ repoFullName: 'other/repo' }),
        ]
        const result = excludeOwnRepoPRs(items, 'my-account')
        expect(result).toHaveLength(1)
        expect(result[0].repoFullName).toBe('other/repo')
    })
})

// ─── computeSummary ─────────────────────────────────────────────────────────
// PR 목록 전체의 요약 통계를 계산한다.
// 총 개수, 상태별 개수(merged/open/closed), 코드 변경량(additions/deletions)이 정확해야 한다.
describe('computeSummary', () => {

    it('빈 배열은 모든 합산값이 0인 요약을 반환한다', () => {
        const summary = computeSummary([])
        expect(summary.totalCount).toBe(0)
        expect(summary.mergedCount).toBe(0)
        expect(summary.openCount).toBe(0)
        expect(summary.closedCount).toBe(0)
        expect(summary.totalAdditions).toBe(0)
        expect(summary.totalDeletions).toBe(0)
    })

    it('PR 상태별 개수를 정확히 센다', () => {
        const items = [
            makePRItem({ state: 'MERGED' }),
            makePRItem({ state: 'MERGED' }),
            makePRItem({ state: 'OPEN' }),
            makePRItem({ state: 'CLOSED' }),
        ]
        const summary = computeSummary(items)
        expect(summary.totalCount).toBe(4)
        expect(summary.mergedCount).toBe(2)
        expect(summary.openCount).toBe(1)
        expect(summary.closedCount).toBe(1)
    })

    it('additions와 deletions를 PR 전체에 걸쳐 합산한다', () => {
        const items = [
            makePRItem({ additions: 100, deletions: 50 }),
            makePRItem({ additions: 200, deletions: 30 }),
        ]
        const summary = computeSummary(items)
        expect(summary.totalAdditions).toBe(300)
        expect(summary.totalDeletions).toBe(80)
    })

    it('PR이 하나뿐이어도 정확히 집계한다', () => {
        const items = [makePRItem({ state: 'MERGED', additions: 42, deletions: 7 })]
        const summary = computeSummary(items)
        expect(summary.totalCount).toBe(1)
        expect(summary.mergedCount).toBe(1)
        expect(summary.totalAdditions).toBe(42)
        expect(summary.totalDeletions).toBe(7)
    })
})
