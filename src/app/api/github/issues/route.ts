import { auth } from '@/lib/auth'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import { githubGraphQL } from '@/lib/github/client'
import { SEARCH_ISSUES_QUERY } from '@/lib/github/queries'
import { scoreIssue } from '@/lib/github/scorer'
import { getRepoHealth } from '@/lib/github/repo-health'
import sql from '@/lib/db'
import type { RawIssue, ScoredIssue } from '@/types/issue'
import type { UserProfile } from '@/types/user'
import { TIME_FILTER, HEALTH_THRESHOLD, STAR_CUTOFF } from '@/constants/scoring-rules'

interface SearchResult {
  search: { nodes: RawIssue[] }
}

// 언어별 × 라벨별 쿼리 생성 — language: AND 조건 문제로 언어별로 분리
function buildIssueQueries(languages: string[]): string[] {
  return languages.slice(0, 2).flatMap((lang) => [
    `is:open is:issue label:"good first issue" language:${lang}`,
    `is:open is:issue label:"help wanted" language:${lang}`,
  ])
}

// URL 기준 중복 이슈 제거
function dedupeIssues(issues: RawIssue[]): RawIssue[] {
  const seen = new Set<string>()
  return issues.filter((issue) => {
    if (seen.has(issue.url)) return false
    seen.add(issue.url)
    return true
  })
}

// 스팸 레포, 레포 활성도, 시간 가용성 기준 필터링
function filterScoredIssues(
  issues: ScoredIssue[],
  allowedTypes: string[]
): ScoredIssue[] {
  return issues.filter((issue) => {
    // star STAR_CUTOFF 미만 레포 제외 (스팸·봇 생성 레포 필터링)
    if (issue.stargazerCount < STAR_CUTOFF) return false
    // 레포 활성도 캐시 있을 때만 HEALTH_THRESHOLD 적용
    if (issue.healthScore !== null && issue.healthScore < HEALTH_THRESHOLD) return false
    // 유저 시간 가용성 기준 기여 방식 필터
    return !(issue.contributionType && !allowedTypes.includes(issue.contributionType));

  })
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.accessToken) {
    return NextResponse.json({ error: 'No access token' }, { status: 401 })
  }

  // 유저 프로필 조회
  const profileRows = await sql`
    SELECT up.top_languages, up.experience_level, up.contribution_types,
           up.weekly_hours, up.english_ok
    FROM user_profiles up
           JOIN users u ON u.id = up.user_id
    WHERE u.github_id = ${session.user.id}
      AND up.onboarding_done = true
  `

  if (profileRows.length === 0) {
    return NextResponse.json({ error: 'Onboarding not complete' }, { status: 400 })
  }

  const row = profileRows[0]
  const profile: Pick<UserProfile, 'topLanguages' | 'experienceLevel' | 'contributionTypes' | 'weeklyHours' | 'englishOk'> = {
    topLanguages:      row.top_languages ?? [],
    experienceLevel:   row.experience_level,
    contributionTypes: row.contribution_types ?? [],
    weeklyHours:       row.weekly_hours,
    englishOk:         row.english_ok,
  }

  // 시간 기반 허용 기여 방식 목록
  const allowedTypes = profile.weeklyHours
    ? TIME_FILTER[profile.weeklyHours] ?? TIME_FILTER[10]
    : TIME_FILTER[10]

  // GitHub 이슈 검색
  const queries = buildIssueQueries(profile.topLanguages)
  const allRaw: RawIssue[] = []

  await Promise.allSettled(
    queries.map(async (q) => {
      const data = await githubGraphQL<SearchResult>(
        SEARCH_ISSUES_QUERY,
        { query: q, first: 30 },
        token.accessToken as string
      )
      allRaw.push(...(data.search.nodes ?? []))
    })
  )

  const unique = dedupeIssues(allRaw)

  // 레포 활성도 캐시 조회
  const repoNames = [...new Set(unique.map((i) => i.repository.nameWithOwner))]
  const healthRows = repoNames.length > 0
    ? await sql`
      SELECT repo_full_name, health_score
      FROM repo_health_cache
      WHERE repo_full_name = ANY(${repoNames})
        AND cached_at > NOW() - INTERVAL '1 hour'
    `
    : []

  const healthMap = new Map<string, number>(
    healthRows.map((r) => [r.repo_full_name, r.health_score])
  )

  // 캐시 없는 레포는 GitHub API로 실시간 계산 후 캐시 저장
  const uncachedRepos = repoNames.filter((name) => !healthMap.has(name))
  await Promise.allSettled(
    uncachedRepos.map(async (name) => {
      const score = await getRepoHealth(name, token.accessToken as string)
      healthMap.set(name, score)
    })
  )

  // 스코어링 → 필터 → 정렬
  const scored = filterScoredIssues(
    unique.map((raw) => {
      const healthScore = healthMap.get(raw.repository.nameWithOwner) ?? null
      return scoreIssue(raw, profile, healthScore)
    }),
    allowedTypes
  )
  .sort((a, b) => b.score - a.score)
  .slice(0, 50)

  return NextResponse.json({ issues: scored, total: scored.length })
}
