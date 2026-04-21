# OSS Matcher — 오픈소스 기여 매칭 서비스

> 내 GitHub 프로필 + 설문 기반으로 실시간 오픈소스 이슈를 매칭해주는 서비스.
> AI 없이 규칙 기반 스코어링 / 과금 0원 / Next.js 15 + Neon + Vercel Hobby

---

## 빠른 시작

```bash
git clone <repo>
cd oss-matcher
cp .env.example .env.local
npm install
npm run db:migrate   # Neon DB 스키마 적용
npm run dev
```

---

## 문서 목록

| 파일 | 내용 |
|---|---|
| `README.md` | 이 파일 — 프로젝트 개요 및 실행 방법 |
| `SPEC.md` | 기능 명세 (MVP / 추가 기능) |
| `ARCHITECTURE.md` | 기술 스택 및 아키텍처 설계 |
| `DB_SCHEMA.md` | DB 테이블 정의 및 관계 |
| `FOLDER_STRUCTURE.md` | 폴더 구조 및 각 파일 역할 |
| `SCORING_RULES.md` | 이슈 스코어링 규칙 (규칙 기반 로직 상세) |
| `IMPLEMENTATION_ORDER.md` | 구현 순서 및 체크리스트 |

---

## 핵심 차별점

일반 AI 대화와 다른 것들:

1. **실시간 GitHub 데이터** — 지금 이 순간 열려있는 이슈만 매칭 (AI는 과거 학습 데이터)
2. **내 GitHub 자동 분석** — 실제 커밋 히스토리·언어 비율로 수준 파악
3. **레포 활성도 필터** — PR 응답 속도, 머지율로 "기여해도 묻히는 레포" 사전 차단
4. **이슈 경쟁도 표시** — 이미 누가 작업 중인지 실시간 확인

---

## 기술 스택 요약

```
Next.js 15 (App Router) + TypeScript
NextAuth v5 (GitHub OAuth)
GitHub GraphQL API
Neon (PostgreSQL — 무료, 자동 정지 없음)
Tailwind CSS
Vercel Hobby (무료 배포)
```

**과금 발생하는 것: 없음**
- OpenAI API → 규칙 기반 로직으로 대체
- Supabase → Neon (무료, 자동 정지 없음)
- Vercel → Hobby 플랜 (비상업적 사용)
