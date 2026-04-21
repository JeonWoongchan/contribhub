# ARCHITECTURE.md — 기술 스택 및 아키텍처

## 확정 스택

| 레이어 | 기술 | 이유 |
|---|---|---|
| 프레임워크 | Next.js 15 (App Router) | Turbopack 안정화 대기, 실무 안정성 |
| 언어 | TypeScript | |
| 인증 | NextAuth v5 | GitHub OAuth 기본 내장, 별도 서버 불필요 |
| 외부 API | GitHub GraphQL API | 이슈·PR·레포 데이터 한 번에 수집 (REST보다 요청 수 적음) |
| DB | Neon (PostgreSQL) | 무료, 자동 정지 없음, Supabase 대안 |
| 스타일 | Tailwind CSS | |
| 배포 | Vercel Hobby | 비상업적 사용 무료 |
| AI | 없음 | 규칙 기반 스코어링으로 대체, 과금 0원 |

**추가 기능 단계에서 도입**
- Zustand (설문 다단계 상태 관리)
- TanStack Query (이슈 목록 캐싱)
- Vercel Cron (주간 이슈 추천 메일)

---

## 아키텍처 흐름

```
[유저 브라우저]
    |
    | HTTPS
    ↓
[Vercel Edge — Next.js 15]
    |
    ├── Server Components → GitHub GraphQL API (이슈 수집)
    |       └── 캐시: Next.js fetch cache (10분)
    |
    ├── Route Handlers (API)
    |       ├── /api/auth/[...nextauth]  — GitHub OAuth
    |       ├── /api/github/issues      — 이슈 검색 + 스코어링
    |       ├── /api/github/repo-health — 레포 활성도 계산
    |       ├── /api/github/profile     — GitHub 프로필 수집
    |       ├── /api/onboarding         — 설문 저장
    |       └── /api/bookmarks          — 북마크 CRUD
    |
    └── Neon DB (PostgreSQL)
            ├── users
            ├── user_profiles
            ├── bookmarks
            └── repo_health_cache
```

---

## GitHub API Rate Limit 대응

GitHub API는 인증된 요청 기준 **5,000회/시간** 제한이 있음.

**전략**
1. `repo_health_cache` 테이블에 레포 활성도 점수를 1시간 저장 → 동일 레포 재요청 시 DB에서 읽기
2. 이슈 목록은 Next.js fetch cache로 10분 캐시
3. GraphQL로 한 번에 여러 필드 수집 (REST 대비 요청 수 절약)

```ts
// lib/github/repo-health.ts 예시 흐름
async function getRepoHealth(repoFullName: string) {
  // 1. 캐시 확인
  const cached = await db.query(
    `SELECT * FROM repo_health_cache
     WHERE repo_full_name = $1
     AND cached_at > NOW() - INTERVAL '1 hour'`,
    [repoFullName]
  )
  if (cached.rows.length > 0) return cached.rows[0]

  // 2. 캐시 없으면 GitHub API 호출
  const data = await fetchFromGitHub(repoFullName)
  const score = calculateHealthScore(data)

  // 3. 캐시 저장
  await db.query(
    `INSERT INTO repo_health_cache (...) VALUES (...)
     ON CONFLICT (repo_full_name) DO UPDATE SET ...`,
    [repoFullName, score, ...]
  )

  return score
}
```

---

## 환경 변수

```bash
# .env.local

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret

# GitHub OAuth App
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret

# Neon DB
DATABASE_URL=postgresql://...neon.tech/ossm?sslmode=require
```

**GitHub OAuth App 생성**
1. GitHub Settings → Developer settings → OAuth Apps → New OAuth App
2. Homepage URL: `http://localhost:3000`
3. Callback URL: `http://localhost:3000/api/auth/callback/github`

---

## 배포 체크리스트

- [ ] Neon 프로젝트 생성 후 `DATABASE_URL` 복사
- [ ] GitHub OAuth App 생성 (Production URL로)
- [ ] Vercel에 환경 변수 설정
- [ ] `npm run db:migrate` 로 스키마 적용 확인
- [ ] Vercel Hobby 플랜 — 비상업적 사용만 가능
