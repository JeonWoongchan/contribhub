# IMPLEMENTATION_ORDER.md — 구현 순서 및 체크리스트

## 원칙
- 각 단계 완료 후 실제로 동작 확인하고 다음 단계 진행
- ★ 표시는 이 프로젝트의 핵심 차별점 — 꼼꼼하게 구현

---

## Phase 1 — 프로젝트 세팅 (반나절)

```bash
npx create-next-app@15 oss-matcher --typescript --tailwind --app --src-dir
cd oss-matcher
npm install @neondatabase/serverless next-auth@beta
```

- [ ] `.env.local` 작성 (ARCHITECTURE.md 환경 변수 참고)
- [ ] Neon 프로젝트 생성 → `DATABASE_URL` 복사
- [ ] GitHub OAuth App 생성 → `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` 복사
- [ ] `src/lib/db/index.ts` — Neon 클라이언트 초기화
- [ ] `src/lib/db/migrations/001_initial.sql` 작성 (DB_SCHEMA.md 참고)
- [ ] `npm run db:migrate` — 스키마 적용 확인

**`src/lib/db/index.ts` 예시**
```ts
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)
export default sql
```

**`package.json` scripts 추가**
```json
{
  "scripts": {
    "db:migrate": "psql $DATABASE_URL -f src/lib/db/migrations/001_initial.sql"
  }
}
```

---

## Phase 2 — 인증 (반나절)

- [ ] `src/lib/auth.ts` — NextAuth v5 설정 (GitHub Provider)
- [ ] `src/app/api/auth/[...nextauth]/route.ts` 생성
- [ ] `src/app/(auth)/login/page.tsx` — 로그인 버튼 페이지
- [ ] `src/app/(main)/layout.tsx` — 인증 가드 (미로그인 → /login)
- [ ] 로그인 → 세션 확인 → 대시보드 진입 동작 확인

**`src/lib/auth.ts` 기본 구조**
```ts
import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: { scope: 'read:user public_repo' }, // 공개 레포 읽기 권한
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      return session
    },
  },
})
```

---

## Phase 3 — 온보딩 설문 (하루)

- [ ] `src/app/api/github/profile/route.ts` — GitHub 언어 분석 API
- [ ] `src/app/api/onboarding/route.ts` — 설문 저장 API
- [ ] `src/components/onboarding/SurveyStep.tsx` — 단계별 설문 UI
- [ ] `src/components/onboarding/ProgressBar.tsx`
- [ ] `src/app/(main)/onboarding/page.tsx` — 설문 5단계 플로우
- [ ] 온보딩 완료 시 `user_profiles.onboarding_done = true` 저장 확인
- [ ] `(main)/layout.tsx` 에 온보딩 미완료 → /onboarding 리다이렉트 추가

**설문 단계 순서**
1. 경력 선택 (beginner / junior / mid / senior)
2. 기여 목적 선택 (portfolio / growth / community)
3. 선호 기여 방식 다중 선택 (doc / bug / feat / test)
4. 주당 시간 선택 (2 / 5 / 10)
5. 영어 가능 여부 (yes / no)

---

## Phase 4 — GitHub 이슈 수집 + 스코어링 ★ (하루~이틀)

- [ ] `src/lib/github/client.ts` — GraphQL 클라이언트
- [ ] `src/lib/github/queries.ts` — 이슈 검색 쿼리 작성
- [ ] `src/constants/scoring-rules.ts` — 스코어링 규칙 상수 (SCORING_RULES.md)
- [ ] `src/constants/contribution-levels.ts` — 난이도 기준 상수
- [ ] `src/lib/github/scorer.ts` — ★ 규칙 기반 스코어링 함수
- [ ] `src/app/api/github/issues/route.ts` — 이슈 검색 API
- [ ] Postman / curl로 이슈 API 응답 확인

**GraphQL 이슈 검색 쿼리 기본 구조**
```graphql
query SearchIssues($query: String!, $first: Int!) {
  search(query: $query, type: ISSUE, first: $first) {
    nodes {
      ... on Issue {
        number
        title
        url
        labels(first: 10) { nodes { name } }
        comments { totalCount }
        repository {
          nameWithOwner
          primaryLanguage { name }
          stargazerCount
        }
        createdAt
        updatedAt
      }
    }
  }
}
```

**검색 쿼리 문자열 예시**
```ts
const query = `is:open is:issue label:"good first issue" language:TypeScript`
```

---

## Phase 5 — 레포 활성도 점수 ★ (하루)

- [ ] `src/lib/github/repo-health.ts` — 활성도 계산 + DB 캐시
- [ ] `src/app/api/github/repo-health/route.ts` — 활성도 API
- [ ] `src/components/repo/RepoHealthBadge.tsx` — 배지 UI
- [ ] 캐시 동작 확인 (1시간 이내 재요청 시 DB에서 응답하는지)

---

## Phase 6 — 매칭 로직 + 대시보드 ★ (하루)

- [ ] `src/lib/matching.ts` — 설문 × 이슈 매칭 정렬 로직
- [ ] `src/types/issue.ts` — ScoredIssue 타입
- [ ] `src/components/issue/IssueCard.tsx` — 이슈 카드 UI
- [ ] `src/components/issue/IssueFilter.tsx` — 필터 UI
- [ ] `src/components/issue/IssueList.tsx`
- [ ] `src/app/(main)/dashboard/page.tsx` — 대시보드 완성
- [ ] 실제 GitHub 데이터로 매칭 결과 확인

---

## Phase 7 — 북마크 + PR 추적 (반나절)

- [ ] `src/app/api/bookmarks/route.ts` — CRUD API
- [ ] `src/components/bookmark/BookmarkCard.tsx`
- [ ] `src/components/bookmark/StatusBadge.tsx`
- [ ] `src/app/(main)/bookmarks/page.tsx`
- [ ] 북마크 추가 / 상태 변경 / 삭제 동작 확인

---

## Phase 8 — 마무리 + 배포 (반나절)

- [ ] 랜딩 페이지 (`app/page.tsx`) — 서비스 소개
- [ ] 에러 처리 (API 실패, GitHub rate limit 초과 등)
- [ ] `next.config.ts` 설정 확인
- [ ] Vercel 배포
  - [ ] Vercel에 환경 변수 설정
  - [ ] GitHub OAuth App Callback URL 프로덕션 URL로 업데이트
  - [ ] 배포 후 로그인 → 온보딩 → 대시보드 전체 플로우 확인

---

## 이후 추가 기능 순서 (선택)

1. **주간 이슈 추천 메일** — Vercel Cron + Resend (난이도 낮음, 임팩트 있음)
2. **기여 타임라인** — 북마크 히스토리 시각화
3. **머지 뱃지 + 커리어 페이지** — PR 머지 감지 + 공유 링크
4. **코드 맥락 가이드** — 이슈 → 관련 파일 위치 안내 (난이도 높음)

---

## 예상 총 소요 시간

| Phase | 예상 시간 |
|---|---|
| 1. 세팅 | 2~3시간 |
| 2. 인증 | 3~4시간 |
| 3. 온보딩 | 6~8시간 |
| 4. 이슈 수집 + 스코어링 | 8~12시간 |
| 5. 레포 활성도 | 4~6시간 |
| 6. 매칭 + 대시보드 | 6~8시간 |
| 7. 북마크 | 3~4시간 |
| 8. 마무리 + 배포 | 2~3시간 |
| **합계** | **약 4~6일** |
