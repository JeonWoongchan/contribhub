// 서버 api-response.ts의 ok(), err() 응답 형태에 대응하는 클라이언트 타입
export type ApiResponse<T> =
    | { ok: true; data: T }
    | { ok: false; error?: { message?: string; code?: string } }
