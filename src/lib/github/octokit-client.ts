import { Octokit } from '@octokit/rest';

/**
 * Create an authenticated Octokit client for a user
 */
export function createAuthenticatedOctokit(accessToken: string): Octokit {
  return new Octokit({
    auth: accessToken,
    // Configure retry logic
    retry: {
      doNotRetry: ['400', '401', '403', '404', '422'],
      retryAfterBaseValue: 1000,
      retryAfterMaxValue: 10000,
    },
    // Configure rate limiting
    throttle: {
      onRateLimit: (
        retryAfter: number,
        options: { method: string; url: string }
      ) => {
        console.warn(
          `Rate limit exceeded for request ${options.method} ${options.url}. Retry after ${retryAfter} seconds.`
        );
        return true; // Retry the request
      },
      onAbuseLimit: (
        retryAfter: number,
        options: { method: string; url: string }
      ) => {
        console.warn(
          `Abuse limit exceeded for request ${options.method} ${options.url}. Retry after ${retryAfter} seconds.`
        );
        return true; // Retry the request
      },
    },
  });
}

/**
 * GitHub API error types
 */
export class GitHubAPIError extends Error {
  status: number;
  response?: unknown;

  constructor(message: string, status: number, response?: unknown) {
    super(message);
    this.name = 'GitHubAPIError';
    this.status = status;
    this.response = response;
  }
}

/**
 * Handle GitHub API errors consistently
 */
export function handleGitHubError(error: unknown): never {
  if (error && typeof error === 'object' && 'status' in error) {
    const githubError = error as {
      status: number;
      message?: string;
      response?: unknown;
    };
    throw new GitHubAPIError(
      githubError.message || 'GitHub API error',
      githubError.status,
      githubError.response
    );
  }

  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  throw new Error(`GitHub API error: ${errorMessage}`);
}

/**
 * GitHub API service class
 */
export class GitHubService {
  private octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = createAuthenticatedOctokit(accessToken);
  }

  /**
   * Get authenticated user information
   */
  async getUser() {
    try {
      const { data } = await this.octokit.rest.users.getAuthenticated();
      return data;
    } catch (error) {
      handleGitHubError(error);
    }
  }

  /**
   * Get user's email addresses
   */
  async getUserEmails() {
    try {
      const { data } =
        await this.octokit.rest.users.listEmailsForAuthenticated();
      return data;
    } catch (error) {
      handleGitHubError(error);
    }
  }

  /**
   * Get user's repositories with pagination
   */
  async getRepositories(options?: {
    per_page?: number;
    page?: number;
    sort?: 'created' | 'updated' | 'pushed' | 'full_name';
    direction?: 'asc' | 'desc';
  }) {
    try {
      const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
        per_page: options?.per_page ?? 100,
        page: options?.page ?? 1,
        sort: options?.sort ?? 'pushed', // "pushed" is better than "updated" for our case
        direction: options?.direction ?? 'desc',
      });
      return data;
    } catch (error) {
      handleGitHubError(error);
    }
  }

  /**
   * Get repository information
   */
  async getRepository(owner: string, repo: string) {
    try {
      const { data } = await this.octokit.rest.repos.get({
        owner,
        repo,
      });
      return data;
    } catch (error) {
      handleGitHubError(error);
    }
  }

  /**
   * Get repository branches
   */
  async getBranches(owner: string, repo: string) {
    try {
      const { data } = await this.octokit.rest.repos.listBranches({
        owner,
        repo,
        per_page: 100,
      });
      return data;
    } catch (error) {
      handleGitHubError(error);
    }
  }

  /**
   * Get repository file tree
   */
  async getFileTree(owner: string, repo: string, branch: string) {
    try {
      // First get the branch reference to get the commit SHA
      const { data: branchData } = await this.octokit.rest.repos.getBranch({
        owner,
        repo,
        branch,
      });

      const commitSha = branchData.commit.sha;

      // Then get the tree using the commit SHA
      const { data } = await this.octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: commitSha,
        recursive: '1',
      });
      return data;
    } catch (error) {
      handleGitHubError(error);
    }
  }

  /**
   * Get repository default branch
   */
  async getDefaultBranch(owner: string, repo: string) {
    try {
      const repoData = await this.getRepository(owner, repo);
      return repoData.default_branch;
    } catch (error) {
      handleGitHubError(error);
    }
  }

  /**
   * Get file content from repository
   */
  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ) {
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref,
      });

      if ('content' in data && !Array.isArray(data)) {
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        return {
          content,
          sha: data.sha,
          path: data.path,
          size: data.size,
        };
      }

      throw new Error(`Path ${path} is not a file`);
    } catch (error) {
      handleGitHubError(error);
    }
  }

  /**
   * Update file content in repository
   */
  async updateFileContent(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    sha: string,
    branch: string
  ) {
    try {
      const { data } = await this.octokit.rest.repos.createOrUpdateFileContents(
        {
          owner,
          repo,
          path,
          message,
          content: Buffer.from(content).toString('base64'),
          sha,
          branch,
        }
      );
      return data;
    } catch (error) {
      handleGitHubError(error);
    }
  }

  /**
   * Create a pull request
   */
  async createPullRequest(
    owner: string,
    repo: string,
    title: string,
    head: string,
    base: string,
    body?: string
  ) {
    try {
      const { data } = await this.octokit.rest.pulls.create({
        owner,
        repo,
        title,
        head,
        base,
        body,
      });
      return data;
    } catch (error) {
      handleGitHubError(error);
    }
  }

  /**
   * Create a new branch from base branch
   */
  async createBranch(
    owner: string,
    repo: string,
    branchName: string,
    baseBranch: string
  ) {
    try {
      // get the SHA of the base branch
      const { data: refData } = await this.octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${baseBranch}`,
      });

      // create new branch from base branch SHA
      const { data } = await this.octokit.rest.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branchName}`,
        sha: refData.object.sha,
      });

      return data;
    } catch (error) {
      handleGitHubError(error);
    }
  }
}
