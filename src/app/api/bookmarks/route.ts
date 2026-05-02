import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { err, ErrorCode, ok } from '@/lib/api-response'
import { requireGithubToken } from '@/lib/auth-utils'
import { createBookmark, deleteBookmark } from '@/lib/bookmarks'
import { getBookmarkList } from '@/lib/bookmark-list'
import { bookmarkDeleteSchema, bookmarkPostSchema } from '@/lib/validators/bookmarks'
import { offsetSchema } from '@/lib/validators/pagination'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  // GitHub 토큰 기반 사용자 인증 단계.
  const authResult = await requireGithubToken(req)
  if (!authResult.ok) return err(authResult.error, authResult.status, authResult.code)

  // 페이지네이션 쿼리 파라미터 정규화 단계.
  const { searchParams } = new URL(req.url)
  const limit = z.coerce.number().int().min(1).max(20).catch(10).parse(searchParams.get('limit'))
  const offset = offsetSchema.parse(searchParams.get('offset'))

  // 북마크 목록 조회 서비스 호출 단계.
  const bookmarkList = await getBookmarkList({
    userId: authResult.userId,
    accessToken: authResult.accessToken,
    limit,
    offset,
  })

  // 북마크 목록 응답 반환 단계.
  return ok(bookmarkList)
}

export async function POST(req: Request) {
  // 세션 기반 사용자 인증 단계.
  const session = await auth()
  if (!session) return err('Unauthorized', 401, ErrorCode.UNAUTHORIZED)

  // 요청 본문 파싱 및 유효성 검증 단계.
  const body = (await req.json().catch(() => null)) as unknown
  const parsed = bookmarkPostSchema.safeParse(body)
  if (!parsed.success) {
    return err('Invalid bookmark payload', 400)
  }

  // 북마크 저장 단계.
  await createBookmark(session.user.id, {
    issueNumber: parsed.data.issueNumber,
    repoFullName: parsed.data.repoFullName,
    issueTitle: parsed.data.issueTitle,
    issueUrl: parsed.data.issueUrl,
    contributionType: parsed.data.contributionType ?? null,
  })

  // 저장 결과 응답 반환 단계.
  return ok({ saved: true }, 201)
}

export async function DELETE(req: Request) {
  // 세션 기반 사용자 인증 단계.
  const session = await auth()
  if (!session) return err('Unauthorized', 401, ErrorCode.UNAUTHORIZED)

  // 요청 본문 파싱 및 유효성 검증 단계.
  const body = (await req.json().catch(() => null)) as unknown
  const parsed = bookmarkDeleteSchema.safeParse(body)
  if (!parsed.success) {
    return err('Invalid bookmark payload', 400)
  }

  // 북마크 삭제 단계.
  await deleteBookmark(session.user.id, parsed.data.repoFullName, parsed.data.issueNumber)

  // 삭제 결과 응답 반환 단계.
  return ok({ deleted: true })
}
