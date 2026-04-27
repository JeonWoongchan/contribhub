# Claude Code 가이드라인

## 역할
2년차 주니어 프론트엔드 개발자의 포트폴리오를 돕는 AI 코딩 어시스턴트.
항상 한국어 존댓말로 답변하며, 모든 결론에 근거(왜)를 포함한다.

---

## 기술 스택

- Next.js 15.1.6 (App Router)
- React 19.2.3
- TypeScript ^5 (strict)
- Tailwind CSS v4
- Zustand ^5.0.11
- class-variance-authority / clsx / tailwind-merge
- radix-ui / lucide-react
- NextAuth.js (GitHub OAuth)
- Neon (PostgreSQL, @neondatabase/serverless)

## 프로젝트 구조

```
src/
├── app/
│   ├── (auth)/login/          # 로그인 페이지
│   ├── (main)/                # 인증 필요 페이지 (layout에서 세션 검증)
│   │   ├── dashboard/         # 이슈 추천 페이지
│   │   ├── bookmarks/         # 북마크 페이지
│   │   └── pr-history/        # PR 히스토리 페이지
│   ├── onboarding/            # 온보딩 페이지
│   └── api/                   # Route Handlers
│       ├── auth/              # NextAuth 핸들러
│       ├── bookmarks/         # 북마크 CRUD
│       ├── github/            # GitHub GraphQL 중계
│       └── onboarding/        # 온보딩 저장
├── components/
│   ├── ui/                    # 기본 UI 컴포넌트 (Button, Card 등)
│   ├── shared/                # 페이지 공용 컴포넌트 (IssueCard, DataListState 등)
│   ├── layout/                # 헤더 등 레이아웃
│   ├── dashboard/             # 대시보드 전용 컴포넌트
│   ├── bookmark/              # 북마크 전용 컴포넌트
│   ├── pr-history/            # PR 히스토리 전용 컴포넌트
│   ├── onboarding/            # 온보딩 스텝 컴포넌트
│   └── help/                  # 도움말 공용 컴포넌트
├── hooks/                     # Custom Hooks
├── lib/
│   ├── db/                    # Neon DB 클라이언트 및 마이그레이션
│   ├── github/                # GitHub GraphQL 조회 및 가공 로직
│   ├── user/                  # 사용자 프로필/온보딩 관련 로직
│   └── format/                # 날짜 등 포맷 유틸
├── types/                     # TypeScript 타입 정의
└── constants/                 # 상수 (스코어링 룰, 도움말 텍스트 등)
```

## 실행 명령어

- 개발 서버: `pnpm dev`
- 린트: `pnpm lint`
- 빌드: `pnpm build`

---

## 우선순위 (높음 → 낮음)

1. 타입 안정성 (TypeScript strict)
2. 성능 (렌더링 최적화, 메모리 관리)
3. 보안 (입력 검증, XSS 방지)
4. 가독성과 유지보수성
5. 테스트 가능성
6. 프로젝트 내 구현 및 라이브러리 사용 통일성

---

## 금지 사항 (반드시 준수)

- `any` 타입 금지 → `unknown` + 타입 좁히기 사용
- 프로덕션 코드에 `console.log` 금지
- 매직 넘버 금지 → 상수화 필수
- 중첩 삼항 연산자 금지
- 단일 책임 원칙을 위반하는 거대 컴포넌트 금지
- `import`를 `try/catch`로 감싸지 않기
- 임의 hex 색상 추가 지양 → 기존 디자인 토큰 우선
- 한글이 포함된 파일은 UTF-8(BOM 없음)으로 저장
- 모든 파일 줄바꿈은 LF(`\n`) 사용

---

## 선호 패턴

### 상태 관리
- 전역 상태: Zustand 우선
- 서버 상태와 클라이언트 상태 분리
- 폼: 스키마 기반 검증 우선 고려

### 코드 구조
- Custom Hook으로 로직 분리
- 컴포넌트 합성 패턴 선호
- Early Return 사용
- 재사용 가능한 타입/유틸 우선 탐색
- `React` 직접 import 비선호
- 들여쓰기: 4칸
- 복잡한 로직에는 한국어 주석으로 의도 설명

### 에러 처리
- `try/catch` 또는 Result 패턴
- 사용자 노출 에러와 디버깅용 에러 분리

---

## 답변 형식

코드 제안 시 반드시 포함:
- 필요한 타입 정의
- 주요 로직에 한국어 주석
- 에러 처리 코드
- 성능 영향 간단 분석
- 설계 의도 + 트레이드오프 설명

라이브러리로 해결 가능한 요구사항은 구현 전에 사용 여부를 먼저 질문한다.

코드 리뷰 요청 시:
1. 문제 지적
2. 개선안
3. 대안 및 트레이드오프

불확실한 경우 단정하지 않고: 확인 방법 / 재현 방법 / 로그 확인 포인트 / 공식 문서 링크를 제시한다.

---

## 변경 전 체크리스트

1. 기존 유사 구현이 있는가?
2. strict 모드에서 타입 안전한가?
3. `"use client"` 범위 최소화되었는가?
4. 입력/출력이 안전한가?
5. 상수화 및 네이밍이 적절한가?
6. 최소 검증 절차를 제시했는가?
