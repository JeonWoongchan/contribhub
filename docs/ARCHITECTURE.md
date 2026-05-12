# Architecture

## 요약

Open Issue Map은 Next.js App Router 기반의 단일 애플리케이션이다. 서버 컴포넌트, Route Handler, 도메인 서비스, 클라이언트 훅을 분리해 인증, API, GitHub 연동, DB 접근 책임을 나눈다.

## 기술 스택

- Framework: Next.js 15 App Router
- UI: React 19, Tailwind CSS v4, shadcn/ui, Radix UI, lucide-react
- Auth: NextAuth v5 beta, GitHub OAuth
- Server state: TanStack Query
- Database: Neon PostgreSQL
- Validation: Zod
- Test: Vitest
- Path alias: `@/*` -> `src/*`

## 주요 계층

### App Router

- `src/app/page.tsx`: 루트 진입점. 로그인/온보딩 상태에 따라 redirect
- `src/app/(auth)/login/page.tsx`: 로그인 화면
- `src/app/onboarding/page.tsx`: 온보딩 화면
- `src/app/(main)/layout.tsx`: 메인 영역 인증/온보딩 보호
- `src/app/(main)/**/page.tsx`: 대시보드, 북마크, PR 이력, 프로필 화면
- `src/app/api/**/route.ts`: 내부 BFF API

### Route Handler

Route Handler는 얇게 유지한다.

- 인증 확인
- query/body 파싱
- Zod 검증
- 도메인 서비스 호출
- `ok()`/`err()` 응답 변환
- 필요한 경우 운영 로그 기록

공통 API 계약은 [API.md](./API.md)를 따른다.

### Domain Service

도메인 로직은 `src/lib/**`에 둔다.

- `src/lib/user/**`: 온보딩, 마이페이지, 프로필 상태
- `src/lib/bookmarks.ts`: 북마크 DB write/read primitive
- `src/lib/bookmark-list.ts`: 북마크 목록 카드 구성
- `src/lib/github/**`: GitHub API, 추천 이슈, PR 이력, repo health

### Client Hooks

클라이언트 상태와 API 호출은 `src/hooks/**`가 담당한다.

- `useIssueList`: 추천 이슈 infinite query. `hasNextPage`(자동 스크롤용)와 `canLoadMoreCandidates`(수동 조회용)를 분리해 반환한다.
- `useIssueCandidateLoadMoreFeedback`: 수동 추가 조회 피드백 상태 관리. 빈 조회 횟수를 추적해 안내 문구 상태를 결정한다.
- `useIssueBookmarks`: 북마크 낙관적 업데이트 mutation
- `useBookmarkList`: 북마크 목록 infinite query
- `usePullRequestList`: PR 이력 infinite query
- `useMyPageData`, `useMyPageActivity`: 마이페이지 query
- `useOnboardingWizard`: 온보딩 mutation

GET API는 기본적으로 `fetchApi<T>()`를 사용한다.

## 인증 구조

### 로그인

- NextAuth GitHub provider 사용
- 로그인 최초 `jwt` callback에서 GitHub access token, GitHub id, GitHub login을 JWT에 저장
- 같은 시점에 `users` 테이블을 upsert

### 세션

- `auth()`는 HttpOnly 쿠키의 JWT를 읽어 서버에서 session을 만든다.
- `session.user.id`는 GitHub id를 사용한다.
- `session.user.login`은 GitHub login을 사용한다.

### GitHub access token

- 클라이언트에는 노출하지 않는다.
- GitHub API가 필요한 Route Handler는 `requireGithubToken(req)`를 사용한다.
- `requireGithubToken()`은 `auth()`와 `getToken({ secret: env.AUTH_SECRET })`를 함께 사용한다.

## 데이터 흐름

### 온보딩

1. `/onboarding` 서버 페이지가 `auth()`를 확인한다.
2. `getTopLanguagesFromGitHub()`가 GitHub 저장소 언어를 best-effort로 가져온다.
3. 클라이언트 wizard가 `POST /api/onboarding`으로 설문을 저장한다.
4. `user_profiles`에 upsert하고 `onboarding_done = true`로 설정한다.

### 추천 이슈

1. 클라이언트가 `GET /api/github/issues`를 호출한다.
2. Route Handler가 `requireGithubToken()`과 `loadOnboardingProfile()`을 수행한다.
3. `fetchIssueListPage()`가 GitHub 후보 이슈, 북마크 키, repo health를 조합한다.
4. `rankIssues()`가 health 임계값 미달 저장소와 주간 시간 초과 기여 유형을 내부 필터링한 뒤 점수화·정렬한다.
5. `applyFilters()`가 사용자 선택 필터(언어, 난이도, 기여 유형, 최소 점수, 최소 스타 수)를 적용한다.
6. 활성 필터(`hasActiveFilters()`)가 있고 결과 페이지가 PAGE_SIZE 미달이면 자동 batch 교체를 중단하고 `canLoadMoreCandidates: true`를 반환한다.
7. 클라이언트는 `canLoadMoreCandidates`가 `true`이면 수동 조회 안내(`IssueCandidateLoadMoreNotice`)를 표시한다.

### 북마크

- GET은 GitHub access token이 필요하므로 `requireGithubToken()` 사용
- POST/DELETE는 DB write만 수행하므로 `auth()` 사용
- 북마크 목록은 GitHub 조회 실패 시 DB 정보 기반 fallback을 허용한다.

### PR 이력

1. 클라이언트가 `GET /api/github/pull-requests`를 호출한다.
2. `fetchViewerPullRequests()`가 GitHub GraphQL로 viewer PR을 조회한다.
3. 본인 소유 저장소 PR은 제외한다.
4. 상태 필터와 pagination을 적용해 반환한다.

## 캐시

- `GITHUB_API_CACHE_TTL_SECONDS = 60`
- `REPO_HEALTH_CACHE_TTL_HOURS = 1`
- 추천 이슈 후보 조회는 `unstable_cache` 사용
- PR 목록과 마이페이지 활동 PR 조회는 사용자별 `unstable_cache` 사용
- repo health는 `repo_health_cache` DB 테이블 사용

캐시 key에는 사용자별 데이터인 경우 반드시 `userId`를 포함한다. access token은 key에 넣지 않는다.

## 에러 처리

- API 성공/실패 포맷은 `src/lib/api-response.ts`를 사용한다.
- GitHub GraphQL 오류는 `GitHubRateLimitError`, `GitHubUnauthorizedError`, `GitHubNotFoundError`로 변환한다.
- Route Handler는 `getGitHubErrorResponse()`로 GitHub 오류를 구조화한다.
- 일반 내부 오류는 `500 INTERNAL_ERROR`로 반환한다.

## 운영 인프라

### Cold Start 방지

Vercel Hobby 플랜은 일정 시간 요청이 없으면 서버리스 함수가 종료되어 cold start가 발생한다.
이를 방지하기 위해 **UptimeRobot**으로 `/api/health` 엔드포인트를 주기적으로 호출한다.

| 항목 | 내용 |
|------|------|
| 모니터링 도구 | UptimeRobot (무료 플랜) |
| 대상 URL | `https://<도메인>/api/health` |
| 호출 주기 | 5분 |
| 모니터 유형 | HTTP(s) |
| 기대 응답 | `200 OK` + `{ "status": "ok" }` |

**이전 방식 (제거됨)**: `vercel.json`의 Vercel Cron으로 3분마다 `/api/health`를 호출했으나, Vercel Hobby 플랜에서 Cron이 프로덕션 배포에만 동작하고 별도 플랜 비용이 발생할 수 있어 UptimeRobot으로 전환했다.

`/api/health` 구현은 DB 연결 없이 `{ status: "ok" }`만 반환한다(`src/app/api/health/route.ts`).
DB 헬스체크가 필요하면 해당 라우트에서 `sql\`SELECT 1\`` 을 추가하면 된다.

## 테스트

- 단위 테스트: GitHub client, search, scorer, filters, repo health, auth utils
- Route Handler 테스트: issues, bookmarks, onboarding, mypage, mypage activity
- 현재 전체 테스트 기준: 18개 파일, 184개 테스트

검증 명령:

```bash
pnpm lint
pnpm test
pnpm build
```
