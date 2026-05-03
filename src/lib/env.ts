// 서버 모듈 임포트 시점에 필수 env를 검증한다.
// !non-null assertion은 undefined를 조용히 통과시켜 요청마다 500을 유발하지만,
// 이 파일은 누락 시 명시적 오류 메시지와 함께 즉시 실패한다.
function requireEnv(name: string): string {
    const value = process.env[name]
    if (!value) {
        throw new Error(`필수 환경변수가 누락되었습니다: ${name}`)
    }
    return value
}

export const env = {
    DATABASE_URL: requireEnv('DATABASE_URL'),
    GITHUB_CLIENT_ID: requireEnv('GITHUB_CLIENT_ID'),
    GITHUB_CLIENT_SECRET: requireEnv('GITHUB_CLIENT_SECRET'),
    AUTH_SECRET: requireEnv('AUTH_SECRET'),
} as const
