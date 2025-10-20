import { mergeRouters } from '@/server/api/trpc';
import { websiteAuditRouter as router } from './router';

export const websiteAuditRouter = mergeRouters(router);

