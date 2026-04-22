'use client'

import { useEffect, useState } from 'react'
import { IssueCard } from '@/components/dashboard/IssueCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { ScoredIssue } from '@/types/issue'

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'done'; issues: ScoredIssue[]; partial: boolean; failedCount: number }

export function IssueList() {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    fetch('/api/github/issues')
      .then(async (res) => {
        const json = await res.json()

        if (!json.ok) {
          setState({ status: 'error', message: json.error?.message ?? '오류가 발생했어요.' })
          return
        }

        setState({
          status: 'done',
          issues: json.data.issues,
          partial: json.data.partialResults ?? false,
          failedCount: json.data.failedQueryCount ?? 0,
        })
      })
      .catch(() => setState({ status: 'error', message: '네트워크 오류가 발생했어요.' }))
  }, [])

  if (state.status === 'loading') {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} size="sm" className="border border-border py-4">
            <CardContent className="animate-pulse space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="h-3 w-28 rounded bg-muted" />
                <div className="h-5 w-12 rounded-md bg-interactive-action" />
              </div>
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-4/5 rounded bg-muted" />
              <div className="flex gap-2">
                <div className="h-5 w-16 rounded-md bg-muted" />
                <div className="h-5 w-14 rounded-md bg-muted" />
              </div>
              <div className="flex gap-2 pt-4">
                <div className="h-3 w-12 rounded bg-muted" />
                <div className="h-3 w-10 rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <Card className="border border-status-danger-border bg-status-danger py-8 text-center">
        <CardContent className="flex flex-col items-center gap-3">
          <p className="text-sm font-medium text-status-danger-foreground">{state.message}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setState({ status: 'loading' })
              window.location.reload()
            }}
            className="border-status-danger-border bg-background"
          >
            다시 시도
          </Button>
        </CardContent>
      </Card>
    )
  }

  const { issues, partial, failedCount } = state

  return (
    <div className="flex flex-col gap-4">
      {partial && (
        <Card size="sm" className="border border-status-warning-border bg-status-warning py-4">
          <CardContent>
            <p className="text-xs text-status-warning-foreground">
              일부 쿼리({failedCount}개)에서 오류가 발생해 결과가 일부만 표시되고 있어요.
            </p>
          </CardContent>
        </Card>
      )}

      {issues.length === 0 ? (
        <Card className="border border-border py-12 text-center">
          <CardContent>
            <p className="text-sm text-muted-foreground">
              추천할 이슈가 없어요. 프로필 설정을 확인하거나 잠시 후 다시 시도해 주세요.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {issues.map((issue) => (
            <IssueCard key={issue.url} issue={issue} />
          ))}
        </div>
      )}
    </div>
  )
}
