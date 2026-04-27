// 인증된 사용자의 PR 목록 조회 — 상태 필터 및 커서 페이지네이션 지원
export const VIEWER_PULL_REQUESTS_QUERY = `
  query ViewerPullRequests($first: Int!, $after: String, $states: [PullRequestState!]) {
    viewer {
      pullRequests(
        first: $first
        after: $after
        states: $states
        orderBy: { field: CREATED_AT, direction: DESC }
      ) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          title
          url
          state
          createdAt
          mergedAt
          closedAt
          additions
          deletions
          changedFiles
          comments { totalCount }
          reviews { totalCount }
          labels(first: 5) {
            nodes { name }
          }
          commits { totalCount }
          repository {
            nameWithOwner
            url
            stargazerCount
            primaryLanguage { name }
          }
        }
      }
    }
  }
`

export const SEARCH_ISSUES_QUERY = `
  query SearchIssues($query: String!, $first: Int!) {
    search(query: $query, type: ISSUE, first: $first) {
      nodes {
        ... on Issue {
          number
          title
          url
          body
          createdAt
          updatedAt
          comments { totalCount }
          labels(first: 10) {
            nodes { name }
          }
          repository {
            nameWithOwner
            url
            primaryLanguage { name }
            stargazerCount
          }
          timelineItems(first: 5, itemTypes: [CROSS_REFERENCED_EVENT]) {
            nodes {
              __typename
              ... on CrossReferencedEvent {
                source {
                  __typename
                }
              }
            }
          }
        }
      }
    }
  }
`


