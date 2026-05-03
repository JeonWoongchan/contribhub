/**
 * DB 마이그레이션 러너
 *
 * 실행: pnpm db:migrate
 *
 * 동작 순서:
 *   1. schema_migrations 테이블 생성 (없을 경우 최초 1회)
 *   2. 이미 적용된 마이그레이션 목록 조회
 *   3. src/lib/db/migrations/ 에서 미적용 .sql 파일을 파일명 순으로 실행
 *   4. 각 마이그레이션은 BEGIN~COMMIT 트랜잭션 안에서 실행 — 실패 시 ROLLBACK
 *   5. 성공한 마이그레이션은 schema_migrations에 기록
 *
 * 보안 원칙:
 *   - DATABASE_URL은 어떤 로그에도 출력하지 않는다
 *   - 에러 메시지는 운영자가 원인을 파악할 수 있는 수준으로만 노출한다
 */

import { Client } from 'pg'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

// ─── 환경변수 검증 ────────────────────────────────────────────────────────────
// app이 쓰는 src/lib/env.ts는 임포트하지 않는다.
// 스크립트는 앱과 독립적으로 실행되므로 필요한 변수 하나만 직접 확인한다.
const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
    console.error('[migrate] 오류: DATABASE_URL 환경변수가 설정되지 않았습니다.')
    console.error('[migrate] .env.local 파일이 있는지, 또는 환경변수가 주입되어 있는지 확인하세요.')
    process.exit(1)
}

// pnpm db:migrate는 프로젝트 루트에서 실행되므로 process.cwd()가 루트를 가리킨다
const MIGRATIONS_DIR = path.join(process.cwd(), 'src', 'lib', 'db', 'migrations')

async function run(): Promise<void> {
    const client = new Client({ connectionString: DATABASE_URL })

    // ── DB 연결 ────────────────────────────────────────────────────────────────
    try {
        await client.connect()
    } catch {
        // DATABASE_URL 값은 절대 로그에 남기지 않는다
        console.error('[migrate] DB 연결에 실패했습니다.')
        console.error('[migrate] DATABASE_URL 값과 Neon 콘솔에서 연결 허용 여부를 확인하세요.')
        process.exit(1)
    }

    try {
        // ── 이력 테이블 생성 ────────────────────────────────────────────────────
        // IF NOT EXISTS 덕분에 최초 실행 이후에는 아무 영향이 없다
        await client.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                filename   TEXT PRIMARY KEY,
                applied_at TIMESTAMPTZ DEFAULT NOW()
            )
        `)

        // ── 적용된 마이그레이션 조회 ─────────────────────────────────────────────
        const { rows } = await client.query<{ filename: string }>(
            'SELECT filename FROM schema_migrations ORDER BY filename'
        )
        const applied = new Set(rows.map((r) => r.filename))

        // ── 미적용 파일 목록 결정 ────────────────────────────────────────────────
        // 파일명 오름차순 정렬 → 001, 002, 003 순으로 적용
        const allFiles = (await readdir(MIGRATIONS_DIR))
            .filter((f) => f.endsWith('.sql'))
            .sort()

        const pending = allFiles.filter((f) => !applied.has(f))

        if (pending.length === 0) {
            console.log('[migrate] 적용할 마이그레이션이 없습니다. DB가 최신 상태입니다.')
            return
        }

        // ── 마이그레이션 실행 ────────────────────────────────────────────────────
        for (const filename of pending) {
            const content = await readFile(path.join(MIGRATIONS_DIR, filename), 'utf-8')
            console.log(`[migrate] 적용 중: ${filename}`)

            // BEGIN ~ COMMIT으로 SQL 실행과 이력 기록을 원자적으로 묶는다.
            // SQL 실행이 실패하면 ROLLBACK해 이력 기록도 취소 → 중간 상태 방지
            try {
                await client.query('BEGIN')
                await client.query(content)
                await client.query(
                    'INSERT INTO schema_migrations (filename) VALUES ($1)',
                    [filename]
                )
                await client.query('COMMIT')
                console.log(`[migrate] 완료: ${filename}`)
            } catch (err) {
                await client.query('ROLLBACK').catch(() => {})
                console.error(`[migrate] 실패: ${filename}`)
                // pg 에러 메시지는 SQL 구문 정보를 포함할 수 있으나,
                // 운영자가 원인을 파악하는 데 필요하므로 출력한다.
                // 연결 문자열(DATABASE_URL)은 포함되지 않는다.
                if (err instanceof Error) {
                    console.error(`[migrate] 원인: ${err.message}`)
                }
                throw err
            }
        }

        console.log(`[migrate] 완료 — ${pending.length}개 마이그레이션이 적용되었습니다.`)
    } finally {
        // 성공·실패 무관하게 연결을 반드시 닫는다
        await client.end().catch(() => {})
    }
}

run().catch(() => {
    process.exit(1)
})
