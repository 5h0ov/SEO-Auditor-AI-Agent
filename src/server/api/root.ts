import { createCallerFactory, createTRPCRouter } from '@/server/api/trpc';
import { githubRouter } from './routers/github';
import { websiteAuditRouter } from './routers/website-audit';

export const appRouter = createTRPCRouter({
  github: githubRouter,
  websiteAudit: websiteAuditRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
