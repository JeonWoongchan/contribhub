import type { ReactNode } from 'react'
import {
    COMPETITION_PENALTY,
    CONTRIBUTION_TYPE_SCORE,
    DIFFICULTY_SCORE,
    EXPERIENCE_COMPETITION_BONUS,
    LANGUAGE_SCORE,
    MIN_CANDIDATE_REPO_STARS,
    PURPOSE_SCORE_RULES,
    REPO_STAR_SCORE_TIERS,
    TIME_BUDGET_RULES,
} from '@/constants/scoring-rules'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type ScoreRow = {
    label: string
    score: string
    positive?: boolean
    negative?: boolean
}

type CompetitionRow = {
    level: string
    open: string
    active: string
    hasPr: string
    activeNeg?: boolean
    hasPrNeg?: boolean
}

// 기여 유형 코드 → 한국어 레이블
const CONTRIBUTION_TYPE_LABEL: Record<string, string> = {
    doc: '문서', bug: '버그', feat: '기능', test: '테스트', review: '리뷰',
}

// 경험 수준 코드 → 한국어 레이블
const EXPERIENCE_LEVEL_LABEL: Record<string, string> = {
    beginner: '입문', junior: '초급', mid: '중급', senior: '고급',
}

// 점수를 +N / −N / 0 형태 문자열로 변환
function fmt(n: number): string {
    if (n > 0) return `+${n}`
    if (n < 0) return `−${Math.abs(n)}`
    return '0'
}

// TIME_BUDGET_RULES의 기여 유형 배열을 한국어 쉼표 목록으로 변환
function formatPreferredTypes(types: readonly string[]): string {
    return types.map((t) => CONTRIBUTION_TYPE_LABEL[t] ?? t).join(', ')
}


// 기여 목적 이론적 최대 가산점: 경쟁도·유형·난이도·저장소 인지도 보너스 합산
const MAX_PURPOSE_SCORE = Math.max(
    ...(['portfolio', 'growth', 'community'] as const).map((p) => {
        const r = PURPOSE_SCORE_RULES[p]
        return (
            Math.max(r.openCompetitionBonus, r.activeCompetitionBonus) +
            r.preferredTypeBonus +
            r.preferredDifficultyBonus +
            r.recognizedRepoBonus
        )
    }),
)

// 경쟁도 이론적 최대 가산점: OPEN·댓글 0개·입문/초급 시나리오가 최고
const MAX_COMPETITION_SCORE =
    Math.max(EXPERIENCE_COMPETITION_BONUS.beginner.OPEN, EXPERIENCE_COMPETITION_BONUS.junior.OPEN) +
    COMPETITION_PENALTY.NO_COMMENT

// 투입 시간 이론적 최대 가산점: 세 시간대 중 최대
const MAX_TIME_BUDGET_SCORE = ([2, 5, 10] as const).reduce((max, h) => {
    const r = TIME_BUDGET_RULES[h]
    return Math.max(max, r.typeMatchBonus + r.difficultyMatchBonus + r.lowCommentBonus)
}, 0)

// EXPERIENCE_COMPETITION_BONUS 상수를 컴포넌트 매트릭스 형태로 변환
const COMPETITION_MATRIX: CompetitionRow[] = (
    ['beginner', 'junior', 'mid', 'senior'] as const
).map((level) => {
    const bonus = EXPERIENCE_COMPETITION_BONUS[level]
    return {
        level: EXPERIENCE_LEVEL_LABEL[level],
        open: fmt(bonus.OPEN),
        active: fmt(bonus.ACTIVE),
        hasPr: fmt(bonus.HAS_PR),
        activeNeg: bonus.ACTIVE < 0,
        hasPrNeg: bonus.HAS_PR < 0,
    }
})

function ScoreTable({ rows }: { rows: readonly ScoreRow[] }) {
    return (
        <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-xs">
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.label} className="border-t border-border/60 first:border-t-0">
                            <td className="px-3 py-2 text-muted-foreground">{row.label}</td>
                            <td
                                className={cn(
                                    'px-3 py-2 text-right font-semibold tabular-nums',
                                    row.positive && 'text-status-success-foreground',
                                    row.negative && 'text-status-danger-foreground',
                                    !row.positive && !row.negative && 'text-muted-foreground',
                                )}
                            >
                                {row.score}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function NoteBox({ title, children }: { title?: string; children: ReactNode }) {
    return (
        <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
            {title ? <p className="mb-1.5 text-xs font-medium text-foreground">{title}</p> : null}
            {children}
        </div>
    )
}

function Section({
    number,
    title,
    badge,
    description,
    children,
}: {
    number: number
    title: string
    badge?: string
    description: string
    children?: ReactNode
}) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-interactive-selected text-[10px] font-semibold text-interactive-selected-foreground">
                    {number}
                </span>
                <span className="text-sm font-semibold text-foreground">{title}</span>
                {badge ? (
                    <Badge variant="secondary" className="ml-auto shrink-0 text-xs">
                        {badge}
                    </Badge>
                ) : null}
            </div>
            <p className="text-xs leading-5 text-muted-foreground">{description}</p>
            {children}
        </div>
    )
}

export function DashboardScoringGuide() {
    return (
        <div className="space-y-5">
            <p className="text-xs leading-5 text-muted-foreground">
                추천 점수는 온보딩 설문 답변을 바탕으로 아래 7가지 항목을 평가해 합산합니다.
                높은 점수일수록 지금 설정에 더 잘 맞는 이슈입니다.
            </p>

            {/* 1. 언어 일치 */}
            <Section
                number={1}
                title="언어 일치"
                badge={`최대 +${LANGUAGE_SCORE.EXACT}`}
                description="이슈 저장소의 주 언어와 선택한 언어를 비교합니다. 선택한 언어이면 순위에 관계없이 동일한 점수를, 같은 계열 언어면 부분 점수를 드립니다."
            >
                <ScoreTable
                    rows={[
                        { label: '선택한 언어 일치', score: fmt(LANGUAGE_SCORE.EXACT), positive: true },
                        { label: '계열 언어 일치', score: fmt(LANGUAGE_SCORE.RELATED), positive: true },
                        { label: '불일치', score: fmt(LANGUAGE_SCORE.NO_MATCH) },
                    ]}
                />
                <p className="text-xs leading-5 text-muted-foreground">
                    계열 언어: TypeScript ↔ JavaScript / C ↔ C++ / Java ↔ Kotlin ↔ Scala ↔ Groovy / Swift ↔ Objective-C
                </p>
            </Section>

            <Separator />

            {/* 2. 난이도 적합도 */}
            <Section
                number={2}
                title="난이도 적합도"
                badge={`최대 +${DIFFICULTY_SCORE.PERFECT}`}
                description="GitHub은 공식 난이도 필드를 제공하지 않으므로 이슈 라벨로 난이도를 추정한 뒤 내 경험 수준과 비교합니다."
            >
                <ScoreTable
                    rows={[
                        { label: '내 수준과 일치', score: fmt(DIFFICULTY_SCORE.PERFECT), positive: true },
                        { label: '한 단계 위 (도전)', score: fmt(DIFFICULTY_SCORE.ONE_ABOVE), positive: true },
                        { label: '두 단계 위', score: fmt(DIFFICULTY_SCORE.TWO_ABOVE), positive: true },
                        { label: '세 단계 이상 위', score: fmt(DIFFICULTY_SCORE.THREE_ABOVE) },
                        { label: '한 단계 아래', score: fmt(DIFFICULTY_SCORE.ONE_BELOW), positive: true },
                        { label: '두 단계 아래', score: fmt(DIFFICULTY_SCORE.TWO_BELOW), positive: true },
                        { label: '세 단계 아래', score: fmt(DIFFICULTY_SCORE.THREE_BELOW) },
                        { label: '난이도 라벨 없음', score: fmt(DIFFICULTY_SCORE.UNKNOWN), positive: true },
                    ]}
                />
                <p className="text-xs leading-5 text-muted-foreground">
                    내 수준보다 쉬운 이슈도 기여 자체로 의미가 있으므로 한·두 단계 아래는 낮은 가산점을 부여합니다. 세 단계 이상 차이나면 0점이며, 난이도 라벨이 없는 이슈는 어떤 수준에도 해당할 수 있어 부분 점수를 드립니다.
                </p>
                <NoteBox title="주요 난이도 추정 레이블 (이슈 라벨 기준)">
                    <div className="space-y-0.5 text-xs text-muted-foreground">
                        <p><span className="font-medium text-foreground">입문</span> — good first issue, first-timers-only, mentored, easy, difficulty:easy</p>
                        <p><span className="font-medium text-foreground">초급</span> — good second issue, junior, e-mentored</p>
                        <p><span className="font-medium text-foreground">중급</span> — medium, moderate, intermediate, difficulty:medium, e-medium</p>
                        <p><span className="font-medium text-foreground">고급</span> — hard, complex, advanced, difficulty:hard, e-hard</p>
                    </div>
                </NoteBox>
            </Section>

            <Separator />

            {/* 3. 기여 방식 일치 */}
            <Section
                number={3}
                title="기여 방식 일치"
                badge={`최대 +${CONTRIBUTION_TYPE_SCORE.MATCH}`}
                description="이슈의 작업 성격과 선택한 기여 방식을 라벨·키워드로 추정해 비교합니다. 선택한 방식이면 순서에 관계없이 동일한 점수를 드립니다."
            >
                <ScoreTable
                    rows={[
                        { label: '선택한 방식 일치', score: fmt(CONTRIBUTION_TYPE_SCORE.MATCH), positive: true },
                        { label: '감지 불가 (라벨·키워드 없음)', score: fmt(CONTRIBUTION_TYPE_SCORE.UNKNOWN), positive: true },
                        { label: '불일치', score: fmt(CONTRIBUTION_TYPE_SCORE.NO_MATCH) },
                    ]}
                />
                <NoteBox title="기여 방식 추정 키워드">
                    <div className="space-y-0.5 text-xs text-muted-foreground">
                        <p><span className="font-medium text-foreground">문서(doc)</span> — documentation, docs, readme, translation, i18n</p>
                        <p><span className="font-medium text-foreground">버그(bug)</span> — bug, fix, regression, defect, error</p>
                        <p><span className="font-medium text-foreground">기능(feat)</span> — feature, enhancement, feature-request, proposal</p>
                        <p><span className="font-medium text-foreground">테스트(test)</span> — test, testing, coverage, qa</p>
                        <p><span className="font-medium text-foreground">리뷰(review)</span> — review, feedback</p>
                    </div>
                </NoteBox>
            </Section>

            <Separator />

            {/* 4. 경쟁도 */}
            <Section
                number={4}
                title="경쟁도"
                badge={`최대 +${MAX_COMPETITION_SCORE}`}
                description="댓글 수와 연결된 PR 여부로 이슈의 진입 경쟁을 추정합니다. 아래 두 항목의 점수를 합산하며, PR이 연결된 이슈는 양쪽 모두에서 감점됩니다."
            >
                <div className="space-y-3">
                    <NoteBox>
                        <p className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">OPEN</span> 댓글 0~1개 &nbsp;·&nbsp; <span className="font-medium text-foreground">ACTIVE</span> 댓글 2개 이상 &nbsp;·&nbsp; <span className="font-medium text-foreground">HAS_PR</span> PR 연결됨
                        </p>
                    </NoteBox>
                    <p className="text-xs font-medium text-foreground">경험 수준 × 경쟁 수준 가산점</p>
                    <div className="overflow-hidden rounded-lg border border-border">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="bg-muted/50">
                                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">경험</th>
                                    <th className="px-3 py-2 text-center font-medium text-muted-foreground">OPEN</th>
                                    <th className="px-3 py-2 text-center font-medium text-muted-foreground">ACTIVE</th>
                                    <th className="px-3 py-2 text-center font-medium text-muted-foreground">HAS_PR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {COMPETITION_MATRIX.map((row) => (
                                    <tr key={row.level} className="border-t border-border/60">
                                        <td className="px-3 py-2 font-medium text-muted-foreground">{row.level}</td>
                                        <td className="px-3 py-2 text-center font-semibold tabular-nums text-status-success-foreground">
                                            {row.open}
                                        </td>
                                        <td
                                            className={cn(
                                                'px-3 py-2 text-center font-semibold tabular-nums',
                                                row.activeNeg
                                                    ? 'text-status-danger-foreground'
                                                    : 'text-status-success-foreground',
                                            )}
                                        >
                                            {row.active}
                                        </td>
                                        <td
                                            className={cn(
                                                'px-3 py-2 text-center font-semibold tabular-nums',
                                                row.hasPrNeg
                                                    ? 'text-status-danger-foreground'
                                                    : 'text-muted-foreground',
                                            )}
                                        >
                                            {row.hasPr}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs font-medium text-foreground">기본 경쟁 보정 (댓글·PR 기준)</p>
                    <ScoreTable
                        rows={[
                            { label: 'PR이 이미 연결됨', score: fmt(COMPETITION_PENALTY.PR_EXISTS), negative: true },
                            { label: '댓글 0개', score: fmt(COMPETITION_PENALTY.NO_COMMENT), positive: true },
                            { label: '댓글 1개', score: fmt(COMPETITION_PENALTY.ONE_COMMENT), positive: true },
                            { label: '댓글 2~4개 (보통 활동)', score: fmt(COMPETITION_PENALTY.MEDIUM_ACTIVITY), negative: true },
                            { label: '댓글 5~9개 (높은 활동)', score: fmt(COMPETITION_PENALTY.HIGH_ACTIVITY), negative: true },
                            { label: '댓글 10개 이상 (매우 높은 활동)', score: fmt(COMPETITION_PENALTY.VERY_HIGH_ACTIVITY), negative: true },
                        ]}
                    />
                </div>
            </Section>

            <Separator />

            {/* 5. 투입 시간 */}
            <Section
                number={5}
                title="투입 시간"
                badge={`최대 +${MAX_TIME_BUDGET_SCORE}`}
                description="설정한 주간 시간에 맞는 작업 유형과 난이도를 우대합니다. 맞지 않는 이슈도 추천되며, 해당 항목에서 가산점만 없습니다."
            >
                <div className="space-y-2">
                    {([2, 5, 10] as const).map((hours) => {
                        const rules = TIME_BUDGET_RULES[hours]
                        return (
                            <div key={hours} className="overflow-hidden rounded-lg border border-border">
                                <div className="bg-muted/50 px-3 py-2 text-xs font-semibold text-foreground">
                                    주 {hours}시간
                                </div>
                                <table className="w-full text-xs">
                                    <tbody>
                                        <tr className="border-t border-border/60">
                                            <td className="px-3 py-2 text-muted-foreground">
                                                권장 방식 — {formatPreferredTypes(rules.preferredTypes)}
                                            </td>
                                            <td className="px-3 py-2 text-right font-semibold tabular-nums text-status-success-foreground">
                                                +{rules.typeMatchBonus}
                                            </td>
                                        </tr>
                                        <tr className="border-t border-border/60">
                                            <td className="px-3 py-2 text-muted-foreground">
                                                권장 난이도 — {rules.preferredDifficulties.map((d) => EXPERIENCE_LEVEL_LABEL[d]).join(', ')}
                                            </td>
                                            <td className="px-3 py-2 text-right font-semibold tabular-nums text-status-success-foreground">
                                                +{rules.difficultyMatchBonus}
                                            </td>
                                        </tr>
                                        <tr className="border-t border-border/60">
                                            <td className="px-3 py-2 text-muted-foreground">
                                                댓글 {rules.preferredMaxComments}개 이하 (적을수록 높음)
                                            </td>
                                            <td className="px-3 py-2 text-right font-semibold tabular-nums text-status-success-foreground">
                                                최대 +{rules.lowCommentBonus}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )
                    })}
                </div>
            </Section>

            <Separator />

            {/* 6. 기여 목적 */}
            <Section
                number={6}
                title="기여 목적"
                badge={`최대 +${MAX_PURPOSE_SCORE}`}
                description="포트폴리오 · 성장 · 커뮤니티 중 선택한 목적에 따라 저장소 성격과 이슈 유형의 가중치가 달라집니다."
            >
                <div className="space-y-2">
                    {[
                        {
                            label: '포트폴리오',
                            preferred: '문서 · 버그 · 기능',
                            desc: `결과물을 설명하기 쉬운 이슈 선호. OPEN 이슈 및 ★${PURPOSE_SCORE_RULES.portfolio.recognizedRepoStars} 이상 저장소에 추가 가산점.`,
                        },
                        {
                            label: '성장',
                            preferred: '기능 · 테스트 · 버그',
                            desc: '학습 효과가 큰 이슈 선호. 약간 도전적인 난이도도 허용. ACTIVE 이슈에 가산점.',
                        },
                        {
                            label: '커뮤니티',
                            preferred: '문서 · 버그 · 테스트',
                            desc: '활발히 유지보수되는 저장소 선호. 꾸준히 참여하기 적합한 이슈를 우대.',
                        },
                    ].map((purpose) => (
                        <div
                            key={purpose.label}
                            className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-xs"
                        >
                            <div className="mb-1 flex items-center gap-2">
                                <span className="font-semibold text-foreground">{purpose.label}</span>
                                <span className="text-muted-foreground">선호: {purpose.preferred}</span>
                            </div>
                            <p className="leading-5 text-muted-foreground">{purpose.desc}</p>
                        </div>
                    ))}
                </div>
            </Section>

            <Separator />

            {/* 7. 저장소 인지도 */}
            <Section
                number={7}
                title="저장소 인지도"
                badge={`최대 +${REPO_STAR_SCORE_TIERS[0].score}`}
                description={`커뮤니티에서 주목받는 저장소일수록 활발한 피드백을 기대할 수 있어 star 수를 기준으로 가산합니다. star ${MIN_CANDIDATE_REPO_STARS}개 미만인 저장소는 추천 후보에서 제외됩니다.`}
            >
                <ScoreTable
                    rows={REPO_STAR_SCORE_TIERS.map((tier) => ({
                        label: `★ ${tier.stars.toLocaleString()} 이상`,
                        score: fmt(tier.score),
                        positive: true,
                    }))}
                />
            </Section>
        </div>
    )
}
