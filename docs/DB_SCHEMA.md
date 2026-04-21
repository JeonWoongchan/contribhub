# DB_SCHEMA.md — 데이터베이스 스키마

## 테이블 구조

### users
GitHub OAuth 로그인 유저 정보

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id     TEXT NOT NULL UNIQUE,       -- GitHub 유저 ID
  github_login  TEXT NOT NULL,              -- @username
  avatar_url    TEXT,
  access_token  TEXT NOT NULL,              -- GitHub OAuth 토큰 (암호화 권장)
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

### user_profiles
GitHub 분석 + 설문 합산 프로필. users와 1:1 관계.

```sql
CREATE TABLE user_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- GitHub에서 자동 수집
  top_languages       TEXT[],               -- 예: ['TypeScript', 'JavaScript', 'Python']

  -- 설문 결과
  experience_level    TEXT,                 -- 'beginner' | 'junior' | 'mid' | 'senior'
  contribution_types  TEXT[],               -- ['doc', 'bug', 'feat', 'test', 'review']
  weekly_hours        INT,                  -- 2 | 5 | 10 (주당 투자 시간)
  english_ok          BOOLEAN DEFAULT FALSE,
  purpose             TEXT,                 -- 'portfolio' | 'growth' | 'community'

  onboarding_done     BOOLEAN DEFAULT FALSE,
  updated_at          TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);
```

**experience_level 값 정의**
| 값 | 설명 |
|---|---|
| `beginner` | 0~1년, 첫 오픈소스 기여 |
| `junior` | 1~3년, 기초 기여 경험 있음 |
| `mid` | 3년 이상, 기능 구현 가능 |
| `senior` | 아키텍처 이해, 코드 리뷰 가능 |

**contribution_types 값 정의**
| 값 | 기여 방식 |
|---|---|
| `doc` | 문서 개선 / 번역 |
| `bug` | 버그 수정 (good-first-issue) |
| `feat` | 기능 구현 |
| `test` | 테스트 작성 |
| `review` | 코드 리뷰 참여 |

---

### bookmarks
북마크한 이슈 + PR 추적 상태

```sql
CREATE TABLE bookmarks (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 이슈 정보 (GitHub에서 가져온 값 캐시)
  issue_number        INT NOT NULL,
  repo_full_name      TEXT NOT NULL,        -- 예: 'facebook/react'
  issue_title         TEXT NOT NULL,        -- API 절약용 캐시
  issue_url           TEXT NOT NULL,

  -- 분류
  contribution_type   TEXT,                 -- 'doc' | 'bug' | 'feat' | 'test' | 'review'

  -- 진행 상태
  status              TEXT DEFAULT 'saved', -- 아래 상태 정의 참고
  pr_url              TEXT,                 -- 연결된 PR URL (직접 입력)

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, repo_full_name, issue_number)
);
```

**status 상태 정의**
| 값 | 설명 |
|---|---|
| `saved` | 북마크만 한 상태 |
| `in_progress` | 작업 시작 (로컬에서 코드 수정 중) |
| `pr_open` | PR 제출 완료 |
| `merged` | PR 머지됨 🎉 |
| `abandoned` | 포기 |

---

### repo_health_cache
레포 활성도 점수 캐시. GitHub rate limit 대응용.

```sql
CREATE TABLE repo_health_cache (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_full_name        TEXT NOT NULL UNIQUE,   -- 예: 'vercel/next.js'

  -- 점수
  health_score          INT NOT NULL,           -- 0~100
  avg_pr_response_days  FLOAT,                  -- PR 평균 응답 기간 (일)
  merge_rate            FLOAT,                  -- PR 머지율 (0.0~1.0)
  last_commit_at        TIMESTAMPTZ,

  cached_at             TIMESTAMPTZ DEFAULT NOW()  -- 1시간 이내면 재사용
);
```

---

## 마이그레이션 파일

`src/lib/db/migrations/001_initial.sql` 에 위 SQL을 순서대로 작성.

```sql
-- 001_initial.sql

CREATE TABLE users ( ... );
CREATE TABLE user_profiles ( ... );
CREATE TABLE bookmarks ( ... );
CREATE TABLE repo_health_cache ( ... );

-- 인덱스
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_status ON bookmarks(status);
CREATE INDEX idx_repo_health_cache_cached_at ON repo_health_cache(cached_at);
```

**마이그레이션 실행**
```bash
npm run db:migrate
# 내부적으로: psql $DATABASE_URL -f src/lib/db/migrations/001_initial.sql
```

---

## 테이블 관계

```
users (1)
  ├── user_profiles (1)   — 온보딩 완료 시 생성
  └── bookmarks (N)       — 이슈 북마크 시 생성

repo_health_cache          — 유저와 무관한 레포 단위 캐시
```
