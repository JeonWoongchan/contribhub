# PROGRESS.md — 현재 진행 상황

새 채팅이나 다른 AI에서 이어서 진행할 때 이 파일을 붙여넣으세요.

---

## 프로젝트 개요

**프로젝트명**: OpenIssueMap
**설명**: 내 GitHub 프로필 + 설문 기반으로 실시간 오픈소스 이슈를 매칭해주는 서비스
**목적**: 포트폴리오용 토이프로젝트

---

## 확정된 기술 스택

```
Next.js 15 (App Router) + TypeScript
NextAuth v5 (GitHub OAuth)
GitHub REST / GraphQL API (@octokit/types)
Neon (PostgreSQL) — 무료, 자동 정지 없음
Tailwind CSS + shadcn/ui (Nova 프리셋)
Vercel Hobby (비상업적 무료 배포)
```

**과금 없음**
- OpenAI 제거 → 규칙 기반 스코어링으로 대체
- Supabase 대신 Neon 사용

**패키지**
```bash
@neondatabase/serverless
next-auth@beta
@octokit/types
shadcn/ui (Nova 프리셋)
  - button, card, progress, badge, separator 설치 완료
```

---

## 확정된 설계 결정사항

### 인증 (NextAuth v5)
- **JWT 방식** 사용 (DB 세션 방식 아님)
- accessToken은 **HttpOnly 쿠키 안 JWT에만** 저장
- session 객체에는 accessToken **넣지 않음** (클라이언트 노출 방지)
- 서버에서 GitHub API 호출 시 `getToken()`으로 JWT에서 직접 꺼냄
- 로그인 시 `users` 테이블에 upsert (ON CONFLICT DO UPDATE)

### UI 규칙
- **shadcn/ui 기반**으로 모든 컴포넌트 작성
- Tailwind arbitrary value (`w-[380px]`) 사용 금지
- Tailwind 기본 스케일 토큰만 사용 (`w-full max-w-sm` 등)
- 디자인 시스템은 shadcn 기준

### 폴더 구조 규칙
- `lib/` = 서버 사이드 로직 (DB, GitHub API, 매칭 로직)
- `app/api/` route.ts는 얇게 유지, 실제 로직은 `lib/`에
- `(main)/` 라우트 그룹 = 인증 필요한 페이지
- `(auth)/` 라우트 그룹 = 로그인 페이지
- `onboarding/` = `(main)` 밖에 위치 (무한 리다이렉트 방지)

---

## 완료된 작업

### Phase 1 — 세팅 ✅
- [x] Next.js 15 프로젝트 생성 (`src/` 디렉토리 사용)
- [x] 패키지 설치
- [x] `.env.local` 설정
- [x] Neon 프로젝트 생성 (AWS Asia Pacific Singapore)
- [x] `src/lib/db/index.ts` — Neon 클라이언트
- [x] `src/lib/db/migrations/001_initial.sql` — DB 스키마
- [x] Neon SQL Editor에서 마이그레이션 실행 완료
- [x] DB 테이블 4개 생성 확인 (users, user_profiles, bookmarks, repo_health_cache)

### Phase 2 — 인증 ✅
- [x] GitHub OAuth App 생성 (localhost:3000)
- [x] `src/lib/auth.ts` — NextAuth v5 설정
- [x] `src/app/api/auth/[...nextauth]/route.ts`
- [x] `src/app/(auth)/login/page.tsx` — shadcn Card + Button
- [x] `src/app/(main)/layout.tsx` — 인증 가드 + 온보딩 체크
- [x] `src/types/next-auth.d.ts` — 타입 확장
- [x] 로그인 테스트 완료 — users 테이블에 행 생성 확인

### Phase 3 — 온보딩 (진행 중 🔄)
- [x] `src/types/user.ts` — 도메인 타입 정의
- [x] `src/types/github.ts` — @octokit/types 기반 GitHub 타입
- [x] `src/app/api/github/profile/route.ts` — GitHub 언어 분석 API
- [x] `src/app/api/onboarding/route.ts` — 설문 저장 API
- [x] `src/constants/contribution-levels.ts` — 설문 선택지 상수
- [ ] `src/components/onboarding/SurveyStep.tsx`
- [ ] `src/components/onboarding/ProgressBar.tsx`
- [ ] `src/app/onboarding/page.tsx` — 설문 5단계 UI

---

## 앞으로 할 작업

### Phase 3 나머지 — 온보딩 UI
온보딩 설문 5단계:
1. 경력 선택 (beginner / junior / mid / senior)
2. 기여 목적 (portfolio / growth / community)
3. 선호 기여 방식 다중 선택 (doc / bug / feat / test / review)
4. 주당 시간 (2 / 5 / 10)
5. 영어 가능 여부 (yes / no)

### Phase 4 — GitHub 이슈 수집 + 스코어링
- `src/lib/github/client.ts` — GraphQL 클라이언트
- `src/lib/github/queries.ts` — GraphQL 쿼리
- `src/constants/scoring-rules.ts` — 스코어링 규칙 상수
- `src/lib/github/scorer.ts` — 규칙 기반 스코어링
- `src/app/api/github/issues/route.ts`

### Phase 5 — 레포 활성도
- `src/lib/github/repo-health.ts`
- `src/app/api/github/repo-health/route.ts`
- `src/components/repo/RepoHealthBadge.tsx`

### Phase 6 — 매칭 + 대시보드
- `src/lib/matching.ts`
- `src/types/issue.ts`
- `src/components/issue/IssueCard.tsx`
- `src/components/issue/IssueFilter.tsx`
- `src/components/issue/IssueList.tsx`
- `src/app/(main)/dashboard/page.tsx`

### Phase 7 — 북마크 + PR 추적
- `src/app/api/bookmarks/route.ts`
- `src/components/bookmark/BookmarkCard.tsx`
- `src/components/bookmark/StatusBadge.tsx`
- `src/app/(main)/bookmarks/page.tsx`

### Phase 8 — 마무리 + 배포
- 랜딩 페이지
- 에러 처리
- Vercel 배포

---

## 현재 파일 구조

```
openissuemap/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx          ✅
│   │   ├── (main)/
│   │   │   ├── layout.tsx            ✅
│   │   │   └── dashboard/
│   │   │       └── page.tsx          (임시)
│   │   ├── onboarding/
│   │   │   └── page.tsx              (임시)
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts      ✅
│   │       ├── github/
│   │       │   └── profile/
│   │       │       └── route.ts      ✅
│   │       └── onboarding/
│   │           └── route.ts          ✅
│   ├── constants/
│   │   └── contribution-levels.ts    ✅
│   ├── lib/
│   │   ├── auth.ts                   ✅
│   │   └── db/
│   │       ├── index.ts              ✅
│   │       └── migrations/
│   │           └── 001_initial.sql   ✅
│   └── types/
│       ├── github.ts                 ✅
│       ├── next-auth.d.ts            ✅
│       └── user.ts                   ✅
└── docs/                             ✅ (기획 문서 전체)
```

---
