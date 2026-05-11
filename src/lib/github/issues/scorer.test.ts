// scorer.test.ts
// scoreIssue() 함수의 핵심 동작을 검증하는 단위 테스트 파일.
//
// 단위 테스트(Unit Test)란?
//   함수 하나를 독립적으로 호출해서 입력 → 출력이 기대대로인지 확인하는 테스트.
//   외부 API나 DB 없이 순수하게 로직만 검증한다.
//
// 왜 이 파일이 필요한가?
//   scorer.ts는 8개의 채점 차원을 가진 복잡한 로직이다.
//   리팩토링 후 가중치나 분기가 바뀌었을 때 어디가 깨졌는지
//   이 파일을 실행하면 바로 알 수 있다.

import { describe, it, expect } from 'vitest'
import { scoreIssue } from '@/lib/github/issues/scorer'
import { MATCH_SCORE_MINIMUM } from '@/constants/scoring-rules'
import type { RawIssue } from '@/types/issue'
import type { UserProfile } from '@/types/user'

// ─── Factory Function ───────────────────────────────────────────────────────
// Factory Function이란?
//   테스트에 필요한 목(mock) 데이터를 만들어 주는 헬퍼 함수.
//   매 테스트마다 전체 필드를 손으로 채우면 코드가 길고 의도가 흐려진다.
//   Factory Function에 기본값을 두고, 테스트하려는 필드만 overrides로 덮어쓰면
//   각 테스트가 무엇을 검증하는지 한눈에 보인다.

// scoreIssue의 두 번째 인자(profile) 타입 — UserProfile의 일부 필드만 사용
type ScoringProfile = Pick<
    UserProfile,
    'topLanguages' | 'experienceLevel' | 'contributionTypes' | 'weeklyHours' | 'purpose'
>

/**
 * 테스트용 RawIssue 기본값 생성 함수.
 * 기본 제목 'Improve performance'는 난이도·기여 방식 키워드를 포함하지 않아
 * 특정 채점 차원이 개입하지 않는 중립적인 이슈로 동작한다.
 */
function makeRawIssue(overrides: Partial<RawIssue> = {}): RawIssue {
    return {
        number: 1,
        title: 'Improve performance',
        url: 'https://github.com/owner/repo/issues/1',
        body: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        comments: { totalCount: 0 },
        labels: { nodes: [] },
        repository: {
            nameWithOwner: 'owner/repo',
            url: 'https://github.com/owner/repo',
            primaryLanguage: { name: 'TypeScript' },
            stargazerCount: 100,
        },
        timelineItems: { nodes: [] },
        ...overrides,
    }
}

/** 테스트용 ScoringProfile 기본값 생성 함수. */
function makeProfile(overrides: Partial<ScoringProfile> = {}): ScoringProfile {
    return {
        topLanguages: ['TypeScript'],
        experienceLevel: 'junior',
        contributionTypes: ['bug'],
        weeklyHours: 5,
        purpose: 'growth',
        ...overrides,
    }
}

// ─── 테스트 묶음 ───────────────────────────────────────────────────────────
// describe란?
//   관련 테스트를 하나의 주제로 묶는 블록.
//   중첩해서 쓰면 "어떤 함수의 어떤 동작"을 계층적으로 표현할 수 있다.

describe('scoreIssue', () => {

    // ── 반환 구조 검증 ──────────────────────────────────────────────────────
    // 함수가 어떤 값을 반환하는지보다, 필수 필드가 누락되지 않는지를 확인한다.
    // 타입 정의가 바뀌거나 필드를 실수로 지우면 이 테스트가 먼저 잡는다.
    describe('반환 구조', () => {
        it('ScoredIssue의 필수 필드를 모두 반환한다', () => {
            // it이란? 하나의 테스트 케이스를 정의하는 블록.
            // "scoreIssue를 호출하면 ~해야 한다" 형태로 읽힌다.
            const result = scoreIssue(makeRawIssue(), makeProfile())

            // expect(실제값).toBeDefined(): 해당 값이 undefined가 아닌지 검사.
            // null은 '값이 없음'을 명시적으로 표현한 것이므로 toBeDefined()를 통과한다.
            expect(result.score).toBeDefined()
            expect(result.difficultyLevel).toBeDefined()
            expect(result.contributionType).toBeDefined()
            expect(result.competitionLevel).toBeDefined()
            expect(result.hasPR).toBeDefined()
        })
    })

    // ── 점수 최솟값 보장 ────────────────────────────────────────────────────
    // 모든 차원이 최악이어도 MATCH_SCORE_MINIMUM(0) 미만으로 내려가서는 안 된다.
    // 이 테스트가 실패하면 floorScore() 함수에 버그가 있다는 신호다.
    describe('점수 최솟값', () => {
        it('모든 조건이 미스매치여도 score는 MATCH_SCORE_MINIMUM 이상이다', () => {
            const worstCaseIssue = makeRawIssue({
                labels: { nodes: [{ name: 'hard' }] }, // senior 난이도 → beginner 사용자와 최대 불일치
                comments: { totalCount: 15 },                          // 매우 높은 경쟁도
                timelineItems: { nodes: [{ __typename: 'CrossReferencedEvent' }] }, // PR 연결됨
                repository: {
                    nameWithOwner: 'owner/repo',
                    url: 'https://github.com/owner/repo',
                    primaryLanguage: { name: 'Rust' }, // 프로필에 없는 언어
                    stargazerCount: 0,
                },
            })
            const result = scoreIssue(worstCaseIssue, makeProfile({ experienceLevel: 'beginner' }))
            // toBeGreaterThanOrEqual: 기대값 이상인지 검사
            expect(result.score).toBeGreaterThanOrEqual(MATCH_SCORE_MINIMUM)
        })
    })

    // ── 언어 채점 ──────────────────────────────────────────────────────────
    // 절댓값이 아닌 상대 비교로 채점 방향을 검증한다.
    // 가중치 상수가 바뀌어도 "언어가 맞으면 점수가 더 높다"는 규칙은 유지되어야 한다.
    describe('언어 채점', () => {
        it('1순위 언어가 이슈 언어와 정확히 같으면 미매칭보다 높은 점수를 받는다', () => {
            const tsIssue = makeRawIssue()
            // toBeGreaterThan: 실제값 > 기대값 인지 검사
            expect(
                scoreIssue(tsIssue, makeProfile({ topLanguages: ['TypeScript'] })).score
            ).toBeGreaterThan(
                scoreIssue(tsIssue, makeProfile({ topLanguages: ['Python'] })).score
            )
        })

        it('같은 언어 그룹(TypeScript↔JavaScript)은 완전 미매칭보다 높은 점수를 받는다', () => {
            const tsIssue = makeRawIssue()
            expect(
                scoreIssue(tsIssue, makeProfile({ topLanguages: ['JavaScript'] })).score
            ).toBeGreaterThan(
                scoreIssue(tsIssue, makeProfile({ topLanguages: ['Python'] })).score
            )
        })
    })

    // ── 난이도 감지 ────────────────────────────────────────────────────────
    // scoreIssue는 이슈 라벨로 난이도를 추정해 difficultyLevel에 담는다.
    // 이 테스트가 실패하면 DIFFICULTY_LABELS 상수와 detectDifficulty 로직이 단절된 것이다.
    describe('난이도 감지', () => {
        it('"good first issue" 라벨이 있으면 difficultyLevel이 "beginner"다', () => {
            const issue = makeRawIssue({ labels: { nodes: [{ name: 'good first issue' }] } })
            expect(scoreIssue(issue, makeProfile()).difficultyLevel).toBe('beginner')
        })

        it('"good second issue" 라벨이 있으면 difficultyLevel이 "junior"다', () => {
            const issue = makeRawIssue({ labels: { nodes: [{ name: 'good second issue' }] } })
            expect(scoreIssue(issue, makeProfile()).difficultyLevel).toBe('junior')
        })

        it('"help wanted" 라벨만 있으면 difficultyLevel이 null이다 (기여 요청 레이블이므로 난이도 신호 아님)', () => {
            const issue = makeRawIssue({ labels: { nodes: [{ name: 'help wanted' }] } })
            expect(scoreIssue(issue, makeProfile()).difficultyLevel).toBeNull()
        })

        it('난이도 신호(라벨)가 없으면 difficultyLevel이 null이다', () => {
            // 빈 라벨은 어떤 난이도 키워드도 포함하지 않는다
            const issue = makeRawIssue({ labels: { nodes: [] } })
            expect(scoreIssue(issue, makeProfile()).difficultyLevel).toBeNull()
        })
    })

    // ── 기여 방식 감지 ──────────────────────────────────────────────────────
    // 라벨과 제목·본문으로 이슈의 작업 성격을 추정해 contributionType에 담는다.
    describe('기여 방식 감지', () => {
        it('"bug" 라벨이 있으면 contributionType이 "bug"다', () => {
            const issue = makeRawIssue({ labels: { nodes: [{ name: 'bug' }] } })
            expect(scoreIssue(issue, makeProfile()).contributionType).toBe('bug')
        })

        it('"documentation" 라벨이 있으면 contributionType이 "doc"다', () => {
            const issue = makeRawIssue({ labels: { nodes: [{ name: 'documentation' }] } })
            expect(scoreIssue(issue, makeProfile()).contributionType).toBe('doc')
        })

        it('기여 방식 신호가 없으면 contributionType이 null이다', () => {
            // 기본 이슈: 라벨 없음, PR 없음, 댓글 2개 미만 → 어떤 타입도 추정 불가
            const issue = makeRawIssue({ labels: { nodes: [] }, comments: { totalCount: 0 } })
            expect(scoreIssue(issue, makeProfile()).contributionType).toBeNull()
        })
    })

    // ── 경쟁도 감지 ────────────────────────────────────────────────────────
    // 댓글 수·PR 연결 여부로 진입 경쟁도를 추정한다.
    // competitionLevel과 hasPR은 UI에서 배지와 감점 표시에 사용되므로 정확해야 한다.
    describe('경쟁도 감지', () => {
        it('댓글 없고 PR 없으면 competitionLevel이 "OPEN"이고 hasPR이 false다', () => {
            const issue = makeRawIssue({
                comments: { totalCount: 0 },
                timelineItems: { nodes: [] },
            })
            const result = scoreIssue(issue, makeProfile())
            expect(result.competitionLevel).toBe('OPEN')
            expect(result.hasPR).toBe(false)
        })

        it('CrossReferencedEvent가 있으면 hasPR이 true이고 competitionLevel이 "HAS_PR"이다', () => {
            // CrossReferencedEvent: GitHub GraphQL에서 PR이 이슈를 참조할 때 생성되는 이벤트
            const issue = makeRawIssue({
                timelineItems: { nodes: [{ __typename: 'CrossReferencedEvent' }] },
            })
            const result = scoreIssue(issue, makeProfile())
            expect(result.hasPR).toBe(true)
            expect(result.competitionLevel).toBe('HAS_PR')
        })

        it('댓글 5개 이상이면 competitionLevel이 "ACTIVE"다', () => {
            const issue = makeRawIssue({
                comments: { totalCount: 5 },
                timelineItems: { nodes: [] },
            })
            expect(scoreIssue(issue, makeProfile()).competitionLevel).toBe('ACTIVE')
        })

        it('댓글 1개는 OPEN 상태다', () => {
            // 1개는 ACTIVE 기준(2개) 미만 — 여전히 OPEN이지만 ONE_COMMENT 패널티 적용
            const issue = makeRawIssue({ comments: { totalCount: 1 }, timelineItems: { nodes: [] } })
            expect(scoreIssue(issue, makeProfile()).competitionLevel).toBe('OPEN')
        })

        it('댓글 2개는 ACTIVE의 최소 기준이다', () => {
            // 2개부터 MEDIUM_ACTIVITY로 ACTIVE 전환 — 경계값
            const issue = makeRawIssue({ comments: { totalCount: 2 }, timelineItems: { nodes: [] } })
            expect(scoreIssue(issue, makeProfile()).competitionLevel).toBe('ACTIVE')
        })

        it('댓글 10개는 VERY_HIGH_ACTIVITY 기준이다', () => {
            // 10개 이상은 가장 높은 경쟁도 페널티 적용 — 경계값
            const issue = makeRawIssue({ comments: { totalCount: 10 }, timelineItems: { nodes: [] } })
            expect(scoreIssue(issue, makeProfile()).competitionLevel).toBe('ACTIVE')
        })

        it('댓글 2개 미만이어도 PR이 있으면 HAS_PR이다', () => {
            // hasPR 체크가 commentCount보다 우선 — 댓글 없어도 PR이 있으면 HAS_PR
            const issue = makeRawIssue({
                comments: { totalCount: 0 },
                timelineItems: { nodes: [{ __typename: 'CrossReferencedEvent' }] },
            })
            expect(scoreIssue(issue, makeProfile()).competitionLevel).toBe('HAS_PR')
        })
    })

    // ── UNKNOWN 부분 점수 검증 ─────────────────────────────────────────────
    // 라벨이 없어 감지 불가인 경우 0이 아닌 부분 점수가 나와야 한다.
    describe('UNKNOWN 부분 점수', () => {
        it('난이도 라벨이 없는 이슈는 0보다 높은 난이도 점수를 받는다', () => {
            const noLabelIssue = makeRawIssue({ labels: { nodes: [] } })
            const labeledIssue = makeRawIssue({ labels: { nodes: [{ name: 'hard' }] } })
            const profile = makeProfile({ experienceLevel: 'beginner' })

            // 라벨 없음이 최악의 불일치(THREE_ABOVE)보다 높아야 한다
            expect(scoreIssue(noLabelIssue, profile).score).toBeGreaterThan(
                scoreIssue(labeledIssue, profile).score
            )
        })

        it('기여 방식을 감지할 수 없는 이슈가 불일치 이슈보다 높은 점수를 받는다', () => {
            // 라벨·키워드 없음 → UNKNOWN(부분 점수) vs 감지됐지만 불일치 → NO_MATCH(0점)
            const unknownTypeIssue = makeRawIssue({ labels: { nodes: [] } })
            const mismatchIssue = makeRawIssue({
                labels: { nodes: [{ name: 'documentation' }] }, // doc 타입 → bug 선택 프로필과 불일치
            })
            const bugProfile = makeProfile({ contributionTypes: ['bug'] })

            expect(scoreIssue(unknownTypeIssue, bugProfile).score).toBeGreaterThan(
                scoreIssue(mismatchIssue, bugProfile).score
            )
        })

        it('난이도·기여방식 라벨이 모두 없어도 점수가 MATCH_SCORE_MINIMUM보다 의미 있게 높다', () => {
            const noLabelIssue = makeRawIssue({ labels: { nodes: [] } })
            const result = scoreIssue(noLabelIssue, makeProfile())
            // UNKNOWN 부분 점수 2개(12+10=22)가 합산되어 기본 언어 점수와 함께 충분한 점수 확보
            expect(result.score).toBeGreaterThan(MATCH_SCORE_MINIMUM + 20)
        })
    })

    // ── 채점 방향 검증 ──────────────────────────────────────────────────────
    // 두 이슈를 동일한 프로필로 채점했을 때 점수 순서가 기획 의도와 맞는지 확인한다.
    describe('채점 방향', () => {
        it('PR 없는 이슈가 PR 있는 이슈보다 beginner 프로필에서 더 높은 점수를 받는다', () => {
            const openIssue = makeRawIssue({ timelineItems: { nodes: [] } })
            const hasPRIssue = makeRawIssue({
                timelineItems: { nodes: [{ __typename: 'CrossReferencedEvent' }] },
            })
            const beginnerProfile = makeProfile({ experienceLevel: 'beginner' })
            expect(scoreIssue(openIssue, beginnerProfile).score).toBeGreaterThan(
                scoreIssue(hasPRIssue, beginnerProfile).score
            )
        })

        it('언어가 정확히 일치하는 이슈가 언어가 전혀 다른 이슈보다 높은 점수를 받는다', () => {
            const tsIssue = makeRawIssue() // primaryLanguage: TypeScript
            const rustIssue = makeRawIssue({
                repository: {
                    nameWithOwner: 'owner/repo',
                    url: 'https://github.com/owner/repo',
                    primaryLanguage: { name: 'Rust' },
                    stargazerCount: 100,
                },
            })
            const profile = makeProfile({ topLanguages: ['TypeScript'] })
            expect(scoreIssue(tsIssue, profile).score).toBeGreaterThan(
                scoreIssue(rustIssue, profile).score
            )
        })
    })
})
