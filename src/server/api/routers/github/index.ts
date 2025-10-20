import { mergeRouters } from '@/server/api/trpc';
import { connectionRouter } from './connection';
import { seoFixesRouter } from './seo-fixes';

export const githubRouter = mergeRouters(connectionRouter, seoFixesRouter);

