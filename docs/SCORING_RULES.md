# Scoring Rules

이 문서는 현재 `src/constants/scoring-rules.ts`와 `src/lib/github/issues/scorer.ts`, `ranking.ts` 기준의 추천 규칙을 설명한다.

## 기본 설정

| 항목 | 값 | 설명 |
| --- | --- | --- |
| `PAGE_SIZE` | `10` | API page 크기 |
| `MATCH_SCORE_MINIMUM` | `0` | 최종 점수 하한 — 패널티 합산으로 음수가 되어도 0으로 바닥 처리 |
| `GITHUB_API_CACHE_TTL_SECONDS` | `60` | GitHub API server cache TTL |
| `GITHUB_API_TIMEOUT_MS` | `8000` | GitHub API timeout |
| `MIN_CANDIDATE_REPO_STARS` | `50` | 응답 단 post-filter 최소 star 수 |
| `RANK_SCORE_THRESHOLD` | `50` | ranking에서 낮은 점수 이슈 제거 기준 |
| `SCORE_FILTER_THRESHOLDS` | `50, 60, 70, 80, 90` | UI 최소 점수 필터 |
| `STAR_FILTER_THRESHOLDS` | `100, 300, 1000, 3000` | UI 최소 스타 수 필터 |

## 추천 데이터 흐름

1. 온보딩 프로필을 로드한다.
2. GitHub issue search로 언어별 후보 이슈를 가져온다 (`sort:updated-desc` 정렬 포함).
3. 중복 이슈를 URL 기준으로 제거한다.
4. `stargazerCount < MIN_CANDIDATE_REPO_STARS`인 이슈를 응답 단에서 제거한다 (GitHub 검색 인덱스 시차 보정).
5. `scoreIssue()`로 각 이슈를 점수화한다.
6. `RANK_SCORE_THRESHOLD` 미만 이슈를 제거한다.
7. score 우선, 동점이면 deterministic hash 기준으로 정렬한다.
8. `applyFilters()`가 사용자 선택 API query filter(언어, 난이도, 기여 유형, 최소 점수, 최소 스타 수)를 적용하고 page를 잘라 반환한다.
9. 활성 필터가 있고 반환 결과가 PAGE_SIZE에 미달하면 `canLoadMoreCandidates: true`를 설정해 자동 batch 교체를 중단한다.

## 스타 수 필터

`IssueFilters.minStars`는 저장소의 `stargazerCount`를 기준으로 이슈를 걸러낸다.

허용 값: `100 | 300 | 1000 | 3000`

`hasActiveFilters()` (`src/lib/github/issues/filters.ts`)가 language, difficultyLevel, contributionTypes, minScore, minStars 중 하나라도 활성화되어 있는지 판단한다. 이 함수는 서비스 레이어에서 `canLoadMoreCandidates` 계산에도 사용한다.

## 언어 점수

사용자 선호 언어와 저장소 primary language를 비교한다.
선택한 언어이면 순위 무관하게 동일 점수를 부여한다.

| Match | Score |
| --- | --- |
| exact (선택한 언어 일치) | `28` |
| related (계열 언어 일치) | `15` |
| no match | `0` |

관련 언어 그룹:

- `TypeScript`, `JavaScript`
- `C`, `C++`
- `Java`, `Kotlin`, `Scala`, `Groovy`
- `Swift`, `Objective-C`

## 난이도 점수

GitHub issue에는 공식 난이도 필드가 없으므로 **이슈 라벨** 키워드로 난이도를 추정한다.
제목·본문은 부정 문맥("easy fix가 아니다", "hard to reproduce" 등)으로 오탐이 많아 사용하지 않는다.

`help wanted`는 난이도가 아닌 기여 요청 레이블이므로 제외한다.
`needs-investigation`은 상태 레이블이므로 제외한다.

경험 순서:

```text
beginner -> junior -> mid -> senior
```

주요 레이블:

- `beginner`: `good first issue`, `good-first-issue`, `first-timers-only`, `mentored`, `beginner`, `starter`, `easy`, `difficulty:easy`
- `junior`: `good second issue`, `junior`, `e-mentored`
- `mid`: `medium`, `moderate`, `intermediate`, `difficulty:medium`, `e-medium`
- `senior`: `hard`, `complex`, `advanced`, `difficulty:hard`, `difficulty:expert`, `e-hard`

사용자 경험과 이슈 난이도가 가까울수록 높은 점수를 준다. 난이도 라벨이 없으면 모든 수준에 해당할 가능성이 있어 UNKNOWN 부분 점수를 부여한다.

| 조건 | Score |
| --- | --- |
| 내 수준과 일치 | `23` |
| 한 단계 위 (도전) | `12` |
| 두 단계 위 | `6` |
| 세 단계 이상 위 | `0` |
| 한 단계 아래 | `8` |
| 두 단계 아래 | `4` |
| 세 단계 이상 아래 | `0` |
| 난이도 라벨 없음 (UNKNOWN) | `12` |

## 기여 유형 점수

기여 유형은 label, title, body keyword로 추정한다.

| 유형 | 주요 keyword |
| --- | --- |
| `doc` | documentation, docs, readme, translation, i18n |
| `bug` | bug, fix, regression, defect, error, crash, [bug], bug: |
| `feat` | feature, enhancement, feature-request, proposal, feat:, [feature], feature: |
| `test` | test, testing, coverage, qa |
| `review` | review, feedback |

crash·[bug]·bug: 는 제목 오탐이 적은 명시적 버그 신호이고, feat:·[feature]·feature: 는 conventional commit 및 명시적 기능 요청 신호다.

| 조건 | Score |
| --- | --- |
| 선택한 방식 일치 (MATCH) | `16` |
| 감지 불가 — 라벨·키워드 없음 (UNKNOWN) | `10` |
| 감지됐지만 불일치 (NO_MATCH) | `0` |

UNKNOWN은 기여 방식을 특정할 수 없어 선택한 방식에 해당할 가능성이 남아 있을 때 부여한다. NO_MATCH는 타입이 명확히 감지됐지만 선택한 방식과 다를 때 부여한다.

## 경쟁도 점수

경쟁도는 댓글 수와 연결된 PR 존재 여부로 추정한다.

Competition level 판단 기준:

- `HAS_PR`: PR이 연결되어 있음 (우선 판단)
- `ACTIVE`: 댓글 2개 이상
- `OPEN`: 댓글 0~1개

두 가지 점수를 합산한다.

**1. 기본 경쟁 보정 (`COMPETITION_PENALTY`)**

| 조건 | Score |
| --- | --- |
| PR 연결됨 | `-10` |
| 댓글 0개 | `+4` |
| 댓글 1개 | `+3` |
| 댓글 2~4개 (보통 활동) | `-2` |
| 댓글 5~9개 (높은 활동) | `-6` |
| 댓글 10개 이상 (매우 높은 활동) | `-10` |

**2. 경험 수준 × 경쟁 수준 가산점 (`EXPERIENCE_COMPETITION_BONUS`)**

| 경험 | OPEN | ACTIVE | HAS_PR |
| --- | --- | --- | --- |
| beginner | `+4` | `-2` | `-8` |
| junior | `+4` | `+3` | `-5` |
| mid | `+3` | `+8` | `-2` |
| senior | `+3` | `+8` | `0` |

PR이 연결된 이슈는 두 항목 모두에서 감점된다.

## 주간 시간 규칙

사용자가 투입 가능한 시간에 맞춰 과도한 작업을 줄인다.

기여 방식 필터는 별도로 적용하지 않는다.

**점수 가산 (`TIME_BUDGET_RULES`)**: 시간별 권장 기여 방식·난이도·댓글 수 일치 시 가산점을 부여한다. 불일치 감점은 없다.

| Weekly hours | 권장 기여 방식 |
| --- | --- |
| `2` | `doc`, `bug` |
| `5` | `doc`, `bug`, `test` |
| `10` | `doc`, `bug`, `test`, `feat`, `review` |

| Weekly hours | 최대 가산 |
| --- | --- |
| `2` | `+7` (typeBonus 3 + difficultyBonus 2 + lowCommentBonus 2) |
| `5` | `+7` |
| `10` | `+6` (typeBonus 3 + difficultyBonus 2 + lowCommentBonus 1) |

## 목적 점수

온보딩 목적에 따라 다른 이슈를 선호한다.

### `portfolio`

- 결과물을 설명하기 쉬운 이슈 선호
- 선호 유형: `doc`, `bug`, `feat` (+3)
- 선호 난이도: `beginner`, `junior` (+3)
- OPEN 경쟁도 가산: `+3`, ACTIVE 경쟁도 가산: `+2`
- ★300 이상 저장소 추가 가산: `+5` (`recognizedRepoBonus`)
- 최대: `+14`

### `growth`

- 학습 효과가 큰 기능/테스트/버그 이슈 선호
- 약간 도전적인 난이도 허용
- 선호 유형: `feat`, `test`, `bug` (+3)
- 선호 난이도: `junior`, `mid`, `senior` (+3)
- OPEN 경쟁도 가산: `+2`, ACTIVE 경쟁도 가산: `+4` (도전 장려)
- 최대: `+10`

### `community`

- 유지보수가 활발하고 꾸준히 참여하기 좋은 저장소 선호
- 선호 유형: `doc`, `bug`, `test` (+3)
- 선호 난이도: `beginner`, `junior`, `mid` (+3)
- OPEN 경쟁도 가산: `+3`, ACTIVE 경쟁도 가산: `+2`
- 최대: `+9`

## 저장소 인지도 점수

star 수 기반 전역 가산점. GitHub 검색 결과 데이터를 그대로 사용하며 추가 API 호출 없음.

| star 수 | score |
| --- | --- |
| 3000 이상 | `4` |
| 1000 이상 | `3` |
| 300 이상 | `2` |
| 100 이상 | `1` |

## 이론적 최대 점수

| 차원 | 최대 점수 |
| --- | --- |
| 언어 일치 | `28` |
| 난이도 적합 | `23` |
| 기여 방식 일치 | `16` |
| 경쟁도 (fit + penalty) | `8` |
| 투입 시간 | `7` |
| 기여 목적 | `14` (portfolio 기준) |
| 저장소 인지도 | `4` |
| **합계** | **100** |

## 저장소 활성도 표시 (점수 미반영)

추천 점수에는 포함되지 않지만, 이슈 카드에 3단계 활성도 태그로 표시된다.
`detectRepoActivity()` (`src/lib/github/issues/scorer.ts`)가 2가지 신호를 조합해 판별한다.

### 입력 신호

| 신호 | 출처 | 설명 |
| --- | --- | --- |
| `pushedAt` | `repository.pushedAt` | 저장소에 마지막으로 push된 날짜 (주 신호) |
| `reactions.totalCount` | 이슈 `reactions { totalCount }` | 이슈 리액션 수 (커뮤니티 관심도 보조 신호) |

### 판별 기준

| 조건 | 활성도 |
| --- | --- |
| `pushedAt` 30일 이내 | 활성도 활발 |
| `pushedAt` 90일 이내 **AND** `reactions ≥ 5` | 활성도 활발 (리액션 신호로 보정) |
| `pushedAt` 180일 이내 | 활성도 보통 |
| 그 외 | 활성도 낮음 |

상수는 `src/constants/scoring-rules.ts`의 `REPO_ACTIVITY_THRESHOLDS`에 정의된다.

```
ACTIVE_PUSH_DAYS: 30
ACTIVE_COMMUNITY_PUSH_DAYS: 90
MODERATE_PUSH_DAYS: 180
COMMUNITY_BOOST_SIGNAL: 5
```

GitHub 조회 실패로 fallback 처리된 북마크 카드는 태그를 표시하지 않는다.

## 정렬 안정성

동점 이슈는 `userId:batchParam:issue.url` 기반 hash로 정렬한다. 같은 사용자와 batch에서는 page 이동 시 순서가 안정적으로 유지된다.

## 변경 시 체크리스트

점수 규칙을 바꾸면 다음을 함께 확인한다.

1. `src/constants/scoring-rules.ts`
2. `src/lib/github/issues/scorer.ts`
3. `src/lib/github/issues/ranking.ts`
4. `src/lib/github/issues/filters.ts` (필터 허용값·`hasActiveFilters` 포함)
5. `src/components/dashboard/dashboard-help/DashboardScoringGuide.tsx` (사용자 노출 설명)
6. 관련 테스트:
   - `scorer.test.ts`
   - `ranking.test.ts`
   - `service.test.ts`
   - `filters.test.ts`
7. 이 문서
