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


