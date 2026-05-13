// 첫 번째 배치임을 나타내는 sentinel — cursor 없이 GitHub 첫 페이지 요청
export const INITIAL_BATCH = 'initial' as const
export const MAX_BATCH_PARAM_LENGTH = 2048

export type BatchCursors = Record<string, string | null>

type ParseBatchResult =
    | { ok: true; batchParam: string; afterCursors: BatchCursors }
    | { ok: false; reason: 'too_long' | 'invalid' }

export function encodeBatch(value: unknown): string {
    return Buffer.from(JSON.stringify(value)).toString('base64url')
}

export function decodeBatch<T>(encoded: string): T | null {
    try {
        return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8')) as T
    } catch {
        return null
    }
}

function isBatchCursors(value: unknown): value is BatchCursors {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false

    return Object.entries(value).every(([key, cursor]) =>
        key.length > 0 && (cursor === null || typeof cursor === 'string')
    )
}

export function parseBatchParam(batchParam: string): ParseBatchResult {
    if (batchParam.length > MAX_BATCH_PARAM_LENGTH) {
        return { ok: false, reason: 'too_long' }
    }

    if (batchParam === INITIAL_BATCH) {
        return { ok: true, batchParam: INITIAL_BATCH, afterCursors: {} }
    }

    const decoded = decodeBatch<unknown>(batchParam)
    if (!isBatchCursors(decoded)) {
        return { ok: false, reason: 'invalid' }
    }

    return {
        ok: true,
        batchParam: encodeBatch(decoded),
        afterCursors: decoded,
    }
}

export function normalizeBatchCursors(
    cursors: BatchCursors,
    languages: readonly string[]
): BatchCursors {
    return languages
        .slice()
        .sort()
        .reduce<BatchCursors>((normalized, language) => {
            if (Object.prototype.hasOwnProperty.call(cursors, language)) {
                normalized[language] = cursors[language]
            }
            return normalized
        }, {})
}
