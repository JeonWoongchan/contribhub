import { auth } from '@/lib/auth'
import { err, ErrorCode, ok } from '@/lib/api-response'
import { getMyPageData } from '@/lib/user/my-page'

export async function GET() {
  const session = await auth()
  if (!session) return err('Unauthorized', 401, ErrorCode.UNAUTHORIZED)

  const data = await getMyPageData(session.user.id, session.user.name ?? null)
  if (!data) return err('마이페이지 데이터를 불러오지 못했습니다.', 500, ErrorCode.INTERNAL_ERROR)

  return ok(data)
}
