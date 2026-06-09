import * as https from "https";

interface LanguageEdge {
  size: number;
  node: {
    name: string;
    color: string | null;
  };
}

interface RepoNode {
  name: string;
  stargazers: { totalCount: number };
  languages: {
    edges: LanguageEdge[];
  };
}

interface GraphQLResponse {
  data?: {
    user?: {
      name: string | null;
      login: string;
      commits: { totalCommitContributions: number };
      reviews: { totalPullRequestReviewContributions: number };
      repositoriesContributedTo: { totalCount: number };
      pullRequests: { totalCount: number };
      openIssues: { totalCount: number };
      closedIssues: { totalCount: number };
      followers: { totalCount: number };
      repositories: {
        totalCount: number;
        nodes: RepoNode[];
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    };
  };
  errors?: { message: string; type?: string }[];
}

function graphqlRequest(
  query: string,
  variables: Record<string, unknown>,
  token: string,
): Promise<GraphQLResponse> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query, variables });
    const req = https.request(
      "https://api.github.com/graphql",
      {
        method: "POST",
        headers: {
          Authorization: `bearer ${token}`,
          "Content-Type": "application/json",
          "User-Agent": "github-stats-creator",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(
              new Error(
                `GitHub API returned HTTP ${res.statusCode}: ${data.substring(0, 200)}`,
              ),
            );
            return;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.data === undefined && !parsed.errors) {
              reject(
                new Error(
                  `Unexpected response from GitHub API (possibly rate limited): ${data.substring(0, 200)}`,
                ),
              );
              return;
            }
            resolve(parsed);
          } catch {
            reject(
              new Error(
                `Failed to parse GitHub API response (possibly rate limited or HTML error page). Status: ${res.statusCode}. Body: ${data.substring(0, 300)}`,
              ),
            );
          }
        });
      },
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

const STATS_QUERY = `
query userInfo($login: String!, $after: String) {
  user(login: $login) {
    name
    login
    commits: contributionsCollection {
      totalCommitContributions
    }
    reviews: contributionsCollection {
      totalPullRequestReviewContributions
    }
    repositoriesContributedTo(first: 1, contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]) {
      totalCount
    }
    pullRequests(first: 1) { totalCount }
    openIssues: issues(states: OPEN) { totalCount }
    closedIssues: issues(states: CLOSED) { totalCount }
    followers { totalCount }
    repositories(first: 100, ownerAffiliations: OWNER, orderBy: {direction: DESC, field: STARGAZERS}, after: $after) {
      totalCount
      nodes {
        name
        stargazers { totalCount }
        languages(first: 10, orderBy: {direction: DESC, field: SIZE}) {
          edges {
            size
            node {
              name
              color
            }
          }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
}
`;

export interface StatsData {
  name: string;
  login: string;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  totalReviews: number;
  totalStars: number;
  contributedTo: number;
  followers: number;
  repos: number;
}

async function fetchAllRepos(
  login: string,
  token: string,
  initialData: GraphQLResponse,
): Promise<RepoNode[]> {
  const allNodes = [
    ...(initialData.data?.user?.repositories.nodes || []),
  ];
  let hasNextPage = initialData.data?.user?.repositories.pageInfo.hasNextPage || false;
  let endCursor = initialData.data?.user?.repositories.pageInfo.endCursor || null;

  while (hasNextPage && allNodes.length < 200) {
    const res = await graphqlRequest(STATS_QUERY, { login, after: endCursor }, token);
    if (!res.data?.user) break;
    const nodes = res.data.user.repositories.nodes || [];
    allNodes.push(...nodes);
    hasNextPage = res.data.user.repositories.pageInfo.hasNextPage;
    endCursor = res.data.user.repositories.pageInfo.endCursor;
  }

  return allNodes;
}

export async function fetchStats(
  username: string,
  token: string,
  includeAllCommits: boolean,
): Promise<StatsData> {
  const res = await graphqlRequest(STATS_QUERY, { login: username }, token);

  if (res.errors?.length) {
    throw new Error(`GraphQL error: ${res.errors.map((e) => e.message).join(", ")}`);
  }
  if (!res.data?.user) {
    throw new Error(`User not found: ${username}`);
  }

  const user = res.data.user;
  const repoNodes = await fetchAllRepos(username, token, res);

  let totalCommits = user.commits.totalCommitContributions;
  if (includeAllCommits) {
    totalCommits = await fetchTotalCommits(username, token);
  }

  const totalStars = repoNodes.reduce(
    (sum, repo) => sum + repo.stargazers.totalCount,
    0,
  );

  return {
    name: user.name || user.login,
    login: user.login,
    totalCommits,
    totalPRs: user.pullRequests.totalCount,
    totalIssues: user.openIssues.totalCount + user.closedIssues.totalCount,
    totalReviews: user.reviews.totalPullRequestReviewContributions,
    totalStars,
    contributedTo: user.repositoriesContributedTo.totalCount,
    followers: user.followers.totalCount,
    repos: user.repositories.totalCount,
  };
}

async function fetchTotalCommits(
  username: string,
  token: string,
): Promise<number> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      `https://api.github.com/search/commits?q=author:${encodeURIComponent(username)}`,
      {
        method: "GET",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.cloak-preview+json",
          "User-Agent": "github-stats-creator",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed.total_count || 0);
          } catch {
            resolve(0);
          }
        });
      },
    );
    req.on("error", reject);
    req.end();
  });
}
