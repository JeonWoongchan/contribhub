import { z } from 'zod'

// 북마크 식별에 필요한 공통 필드 — POST/DELETE 양쪽에서 재사용
const bookmarkBaseSchema = z.object({
    issueNumber: z.number().int().positive(),
    repoFullName: z.string().min(1),
})

export const bookmarkPostSchema = bookmarkBaseSchema.extend({
    issueTitle: z.string().min(1),
    issueUrl: z.string().url(),
    contributionType: z.enum(['doc', 'bug', 'feat', 'test', 'review']).nullable().optional(),
})

export const bookmarkDeleteSchema = bookmarkBaseSchema
