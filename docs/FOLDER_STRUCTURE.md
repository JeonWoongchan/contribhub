# FOLDER_STRUCTURE.md — 폴더 구조

## 전체 구조

```
oss-matcher/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # 라우트 그룹 — 인증 페이지
│   │   │   └── login/
│   │   │       └── page.tsx          # GitHub 로그인 버튼만 있는 페이지
│   │   │
│   │   ├── (main)/                   # 라우트 그룹 — 인증 필요
│   │   │   ├── layout.tsx            # 인증 가드: 미로그인 → /login 리다이렉트
│   │   │   │                         #            온보딩 미완료 → /onboarding 리다이렉트
│   │   │   ├── onboarding/
│   │   │   │   └── page.tsx          # 설문 다단계 폼 (5단계)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          # 이슈 매칭 메인 페이지
│   │   │   └── bookmarks/
│   │   │       └── page.tsx          # 북마크 목록 + PR 상태 관리
│   │   │
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts      # NextAuth 핸들러
│   │   │   ├── github/
│   │   │   │   ├── issues/
│   │   │   │   │   └── route.ts      # GET: 이슈 검색 + 스코어링
│   │   │   │   ├── repo-health/
│   │   │   │   │   └── route.ts      # GET: 레포 활성도 점수 (캐시 우선)
│   │   │   │   └── profile/
│   │   │   │       └── route.ts      # GET: GitHub 프로필 + 언어 분석
│   │   │   ├── onboarding/
│   │   │   │   └── route.ts          # POST: 설문 저장 → user_profiles upsert
│   │   │   └── bookmarks/
│   │   │       └── route.ts          # GET/POST/PATCH/DELETE: 북마크 CRUD
│   │   │
│   │   ├── layout.tsx                # 루트 레이아웃
│   │   └── page.tsx                  # 랜딩 (로그인 유도, 서비스 소개)
│   │
│   ├── components/
│   │   ├── issue/
│   │   │   ├── IssueCard.tsx         # 이슈 카드 UI (활성도·경쟁도·난이도 표시)
│   │   │   ├── IssueList.tsx         # 이슈 카드 그리드
│   │   │   └── IssueFilter.tsx       # 기여방식 / 난이도 / 언어 필터
│   │   ├── onboarding/
│   │   │   ├── SurveyStep.tsx        # 단계별 설문 컴포넌트
│   │   │   └── ProgressBar.tsx       # 설문 진행률 표시
│   │   ├── repo/
│   │   │   └── RepoHealthBadge.tsx   # 활성도 점수 배지 (색상 + 수치)
│   │   ├── bookmark/
│   │   │   ├── BookmarkCard.tsx      # 북마크 카드 (상태 변경 드롭다운 포함)
│   │   │   └── StatusBadge.tsx       # saved / in_progress / pr_open / merged
│   │   └── ui/                       # 공용 기본 컴포넌트
│   │       ├── Button.tsx
│   │       ├── Badge.tsx
│   │       └── Card.tsx
│   │
│   ├── lib/
│   │   ├── github/
│   │   │   ├── client.ts             # GitHub GraphQL 클라이언트 초기화
│   │   │   ├── queries.ts            # GraphQL 쿼리 모음 (이슈·PR·레포)
│   │   │   ├── scorer.ts             # ★ 규칙 기반 이슈 스코어링 로직
│   │   │   └── repo-health.ts        # 레포 활성도 계산 + DB 캐시 처리
│   │   ├── db/
│   │   │   ├── index.ts              # Neon DB 클라이언트 (@neondatabase/serverless)
│   │   │   └── migrations/
│   │   │       └── 001_initial.sql   # 초기 스키마 (DB_SCHEMA.md 내용)
│   │   ├── auth.ts                   # NextAuth 설정 (GitHub Provider + DB adapter)
│   │   └── matching.ts               # ★ 설문 프로필 × 이슈 매칭 로직
│   │
│   ├── types/
│   │   ├── github.ts                 # GitHub API 응답 타입 정의
│   │   ├── issue.ts                  # ScoredIssue 타입 (이슈 + 점수 + 경쟁도)
│   │   └── user.ts                   # UserProfile 타입 (DB 모델)
│   │
│   └── constants/
│       ├── scoring-rules.ts          # ★ 스코어링 규칙 상수 (SCORING_RULES.md 참고)
│       └── contribution-levels.ts    # 기여 방식별 난이도 기준 상수
│
├── docs/                             # 이 문서들이 있는 폴더
│   ├── README.md
│   ├── SPEC.md
│   ├── ARCHITECTURE.md
│   ├── DB_SCHEMA.md
│   ├── FOLDER_STRUCTURE.md           # 이 파일
│   ├── SCORING_RULES.md
│   └── IMPLEMENTATION_ORDER.md
│
├── .env.example                      # 환경 변수 템플릿
├── .env.local                        # 실제 값 (gitignore)
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 핵심 파일 설명

### `lib/github/scorer.ts` ★
OpenAI 없이 규칙만으로 이슈에 점수를 매기는 핵심 파일.
나중에 AI로 교체하고 싶으면 이 파일만 바꾸면 됨.

```ts
// 입력: GitHub 이슈 raw 데이터 + 유저 프로필
// 출력: 0~100 점수 + 기여 방식 태그 + 난이도 레벨
export function scoreIssue(issue: GitHubIssue, profile: UserProfile): ScoredIssue
```

### `lib/matching.ts` ★
설문 결과(프로필)와 스코어링된 이슈 목록을 받아서 최종 추천 순서 정렬.

```ts
// 입력: ScoredIssue[] + UserProfile
// 출력: 매칭 점수 기준으로 정렬된 ScoredIssue[]
export function matchIssues(issues: ScoredIssue[], profile: UserProfile): ScoredIssue[]
```

### `constants/scoring-rules.ts` ★
스코어링 로직의 기준값들을 상수로 분리. 로직과 규칙 분리.
규칙 조정이 필요할 때 이 파일만 수정하면 됨.

---

## 라우트 가드 로직

`app/(main)/layout.tsx` 에서 처리:

```
세션 없음 → /login
세션 있음 + onboarding_done = false → /onboarding
세션 있음 + onboarding_done = true → 통과 (대시보드 진입)
```
