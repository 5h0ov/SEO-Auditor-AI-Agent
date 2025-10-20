import { GitHubService } from '@/lib/github/octokit-client';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const connectionRouter = createTRPCRouter({
  getRepositories: publicProcedure
    .input(
      z.object({
        accessToken: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const service = new GitHubService(input.accessToken);
        const repos = await service.getRepositories();

        return repos.map((repo) => ({
          id: repo.id.toString(),
          name: repo.name,
          full_name: repo.full_name,
          private: repo.private,
          html_url: repo.html_url,
          default_branch: repo.default_branch,
        }));
      } catch (error) {
        console.error('[GitHub] Failed to fetch repositories:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch repositories from GitHub',
        });
      }
    }),

  getBranches: publicProcedure
    .input(
      z.object({
        accessToken: z.string(),
        owner: z.string(),
        repo: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const service = new GitHubService(input.accessToken);
        const branches = await service.getBranches(input.owner, input.repo);

        return branches.map((branch) => ({
          name: branch.name,
          protected: branch.protected,
        }));
      } catch (error) {
        console.error('[GitHub] Failed to fetch branches:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch branches from GitHub',
        });
      }
    }),

  getFiles: publicProcedure
    .input(
      z.object({
        accessToken: z.string(),
        owner: z.string(),
        repo: z.string(),
        branch: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const service = new GitHubService(input.accessToken);
        const treeData = await service.getFileTree(
          input.owner,
          input.repo,
          input.branch
        );

        return treeData.tree
          .filter((item) => item.type === 'blob')
          .map((item) => ({
            path: item.path || '',
            size: item.size || 0,
            sha: item.sha || '',
          }));
      } catch (error) {
        console.error('[GitHub] Failed to fetch files:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch files from GitHub',
        });
      }
    }),

  getFileContent: publicProcedure
    .input(
      z.object({
        accessToken: z.string(),
        owner: z.string(),
        repo: z.string(),
        path: z.string(),
        branch: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const service = new GitHubService(input.accessToken);
        const fileData = await service.getFileContent(
          input.owner,
          input.repo,
          input.path,
          input.branch
        );

        return {
          content: fileData.content,
          sha: fileData.sha,
          path: fileData.path,
          size: fileData.size,
        };
      } catch (error) {
        console.error('[GitHub] Failed to fetch file content:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch file content from GitHub',
        });
      }
    }),
});

