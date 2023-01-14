const getLastCommit = `
query { 
    repository(owner: "Azure-samples", name: "js-e2e") {
        defaultBranchRef {
          name
          target {
            ... on Commit {
              history(first: 1) {
                edges {
                  node {
                    committedDate
                  }
                }
              }
            }
          }
        }
      }
    }
    `