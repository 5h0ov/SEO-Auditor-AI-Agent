'use client';

import { Button } from '@/app/_components/ui/button';
import { usePRStore } from '@/lib/store/pr-store';
import { ExternalLink, GitPullRequest, X, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function PRResultCard() {
   const { latestPR, clearPR } = usePRStore();

   if (!latestPR) return null;

   return (
      <div className="w-full mb-6">
         <div className="bg-green-100/80 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-xl p-6 relative">
            {/* Close button */}
            <button
               onClick={clearPR}
               className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
               aria-label="Dismiss"
            >
               <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-4">
               <div className="p-2 hidden sm:block bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
               </div>

               <div className="flex-1 space-y-3">
                  <div>
                     <h3 className="font-semibold text-lg text-green-900 dark:text-green-100">
                        Pull Request Created Successfully!
                     </h3>
                     <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                        SEO fixes have been applied and are ready for review
                     </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-3 border-t border-green-200 dark:border-green-800">
                     <div>
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">
                           Repository
                        </p>
                        <p className="text-sm font-mono text-green-900 dark:text-green-100">
                           {latestPR.repository}
                        </p>
                     </div>

                     <div>
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">
                           Branch
                        </p>
                        <p className="text-sm font-mono text-green-900 dark:text-green-100">
                           {latestPR.branchName}
                        </p>
                     </div>

                     <div>
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">
                           Files Fixed
                        </p>
                        <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                           {latestPR.filesFixed} files
                        </p>
                     </div>

                     <div>
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">
                           Created
                        </p>
                        <p className="text-sm text-green-900 dark:text-green-100">
                           {formatDistanceToNow(new Date(latestPR.timestamp), { addSuffix: true })}
                        </p>
                     </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                     <Button
                        onClick={() => window.open(latestPR.pullRequestUrl, '_blank')}
                        className="gap-2 p-2 sm:p-4 text-background flex-1 sm:flex-none"
                        size="sm"
                     >
                        <GitPullRequest className="h-4 w-4" />
                        <span className="hidden sm:inline">View Pull Request #{latestPR.pullRequestNumber}</span>
                        <span className="sm:hidden">View PR #{latestPR.pullRequestNumber}</span>
                        <ExternalLink className="size-2" />
                     </Button>

                     <Button
                        onClick={clearPR}
                        variant="outline"
                        size="sm"
                        className="gap-2 flex-1 p-4 sm:flex-none"
                     >
                        Dismiss
                     </Button>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

