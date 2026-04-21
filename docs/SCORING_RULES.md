# SCORING_RULES.md — 이슈 스코어링 규칙

OpenAI 대신 규칙 기반으로 이슈를 스코어링하는 로직 상세.
`src/constants/scoring-rules.ts` 와 `src/lib/github/scorer.ts` 를 참고해서 구현.

---

## 이슈 스코어링 (0~100점)

이슈 하나에 대한 "이 유저에게 얼마나 적합한가" 점수.

### 언어 매칭 (30점)

```ts
export const LANGUAGE_SCORE = {
  EXACT_MATCH: 30,      // 유저 top_languages에 정확히 있음
  RELATED: 15,          // 연관 언어 (예: TypeScript ↔ JavaScript)
  NO_MATCH: 0,
}

// 연관 언어 그룹
export const LANGUAGE_GROUPS = [
  ['TypeScript', 'JavaScript'],
  ['Python', 'Jupyter Notebook'],
  ['C', 'C++', 'C#'],
  ['Java', 'Kotlin', 'Scala'],
]
```

### 난이도 매칭 (25점)

```ts
export const DIFFICULTY_SCORE = {
  PERFECT: 25,    // 유저 수준과 정확히 일치
  ONE_ABOVE: 15,  // 한 단계 높음 (도전적)
  TWO_ABOVE: 5,   // 두 단계 높음 (벅참)
  BELOW: 10,      // 낮음 (쉬움, 연습용)
}

// 이슈 난이도 판별 기준 (라벨 기반)
export const DIFFICULTY_LABELS = {
  beginner: ['good first issue', 'good-first-issue', 'beginner', 'starter'],
  junior:   ['help wanted', 'help-wanted', 'easy'],
  mid:      ['medium', 'moderate', 'intermediate'],
  senior:   ['hard', 'complex', 'advanced', 'needs-investigation'],
}
```

### 기여 방식 매칭 (20점)

```ts
// 이슈 라벨 → 기여 방식 분류
export const CONTRIBUTION_TYPE_LABELS: Record<string, string[]> = {
  doc:    ['documentation', 'docs', 'readme', 'translation', 'i18n'],
  bug:    ['bug', 'fix', 'regression', 'defect'],
  feat:   ['feature', 'enhancement', 'feature-request'],
  test:   ['test', 'testing', 'coverage'],
  review: [], // 라벨보다 PR 리뷰 코멘트로 판단
}

export const CONTRIBUTION_TYPE_SCORE = {
  MATCH: 20,
  NO_MATCH: 0,
}
```

### 경쟁도 페널티 (-15점 ~ 0점)

```ts
export const COMPETITION_PENALTY = {
  PR_EXISTS: -15,       // 이미 PR 올라온 이슈
  HIGH_ACTIVITY: -8,    // 코멘트 5개 이상
  MEDIUM_ACTIVITY: -3,  // 코멘트 2~4개
  LOW_ACTIVITY: 0,      // 코멘트 0~1개
}
```

### 레포 활성도 보너스 (0~15점)

```ts
export const HEALTH_BONUS = {
  HIGH: 15,    // 활성도 80점 이상
  MID: 8,      // 활성도 60~79점
  LOW: 3,      // 활성도 40~59점
  // 40점 미만은 기본 노출 제외
}
```

### 시간 가용성 보정

```ts
// 유저 weekly_hours와 이슈 예상 소요 시간 매칭
export const TIME_FILTER = {
  2:  ['doc', 'bug'],         // 주 2시간 → 빠른 기여만
  5:  ['doc', 'bug', 'test'], // 주 5시간
  10: ['doc', 'bug', 'test', 'feat', 'review'], // 주 10시간 → 전부
}
```

---

## 레포 활성도 점수 (0~100점)

`src/lib/github/repo-health.ts` 에서 계산.

```ts
export const REPO_HEALTH_WEIGHTS = {
  RECENT_COMMIT: {
    weight: 30,
    rules: [
      { days: 30,  score: 30 },
      { days: 90,  score: 20 },
      { days: 180, score: 10 },
      { days: Infinity, score: 0 },
    ],
  },
  PR_RESPONSE_SPEED: {
    weight: 30,
    rules: [
      { days: 3,  score: 30 },
      { days: 7,  score: 20 },
      { days: 14, score: 10 },
      { days: Infinity, score: 0 },
    ],
  },
  MERGE_RATE: {
    weight: 25,
    rules: [
      { rate: 0.8, score: 25 },
      { rate: 0.6, score: 15 },
      { rate: 0.4, score: 5  },
      { rate: 0,   score: 0  },
    ],
  },
  MAINTAINER_RESPONSE: {
    weight: 15,
    // 최근 10개 이슈 중 메인테이너 코멘트 있는 비율
    rules: [
      { ratio: 0.7, score: 15 },
      { ratio: 0.4, score: 8  },
      { ratio: 0,   score: 0  },
    ],
  },
}

export const HEALTH_THRESHOLD = 40 // 이 미만은 기본 노출 제외
```

---

## 경쟁도 판별

```ts
export const COMPETITION_LEVELS = {
  OPEN: {
    label: '여유',
    color: 'green',
    condition: (comments: number, hasPR: boolean) =>
      !hasPR && comments <= 1,
  },
  COMPETITIVE: {
    label: '경쟁 중',
    color: 'yellow',
    condition: (comments: number, hasPR: boolean) =>
      !hasPR && comments >= 2,
  },
  TAKEN: {
    label: '진행 중',
    color: 'red',
    condition: (comments: number, hasPR: boolean) => hasPR,
  },
}
```

---

## 기여 방식별 난이도 기준

`src/constants/contribution-levels.ts` 에서 사용.

| 기여 방식 | 난이도 | 예상 소요 시간 | 필요 수준 |
|---|---|---|---|
| 문서 개선 / 번역 | 입문 | 1~3일 | 누구나 |
| 이슈 제보 | 초급 | 1~2일 | 누구나 |
| 테스트 작성 | 초급 | 2일~1주 | 해당 언어 기본기 |
| 버그 수정 (good-first-issue) | 초중급 | 3일~2주 | 코드 읽기 가능 |
| 코드 리뷰 참여 | 중급 | 상시 | 아키텍처 이해 |
| 기능 구현 | 중급 이상 | 1주~1개월 | 설계 논의 가능 |

```ts
// contribution-levels.ts
export const CONTRIBUTION_LEVELS = [
  {
    type: 'doc',
    label: '문서 / 번역',
    difficulty: 'beginner',
    minExperience: 'beginner',
    estimatedDays: { min: 1, max: 3 },
  },
  {
    type: 'bug',
    label: '버그 수정',
    difficulty: 'junior',
    minExperience: 'beginner',
    estimatedDays: { min: 3, max: 14 },
  },
  {
    type: 'test',
    label: '테스트 작성',
    difficulty: 'junior',
    minExperience: 'beginner',
    estimatedDays: { min: 2, max: 7 },
  },
  {
    type: 'feat',
    label: '기능 구현',
    difficulty: 'mid',
    minExperience: 'junior',
    estimatedDays: { min: 7, max: 30 },
  },
  {
    type: 'review',
    label: '코드 리뷰',
    difficulty: 'mid',
    minExperience: 'mid',
    estimatedDays: null, // 상시
  },
] as const
```
