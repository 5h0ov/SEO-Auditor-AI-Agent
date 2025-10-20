'use client';

import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressStep {
   message: string;
   completed: boolean;
   active: boolean;
}

interface SeoFixProgressOverlayProps {
   isOpen: boolean;
   currentStep: string;
   steps: Array<{ message: string }>;
   issues?: {
      metaTitle?: boolean;
      metaDescription?: boolean;
      imageAlt?: { missingAlt?: number };
      unsafeCrossOriginLinks?: { unsafeTargetBlankLinks?: number };
      plaintextEmails?: { plaintextEmails?: number };
      canonicalUrl?: boolean;
      keywordUsage?: { keywords?: Record<string, unknown> };
   };
}

export function SeoFixProgressOverlay({
   isOpen,
   currentStep,
   steps,
   issues,
}: SeoFixProgressOverlayProps) {
   if (!isOpen) return null;

   const currentIndex = steps.findIndex((step) => step.message === currentStep);

   const progressSteps: ProgressStep[] = steps.map((step, index) => ({
      message: step.message,
      completed: index < currentIndex,
      active: index === currentIndex,
   }));

   const issuesList: string[] = [];
   if (issues) {
      if (issues.metaTitle) issuesList.push('Meta Title Optimization');
      if (issues.metaDescription) issuesList.push('Meta Description Optimization');
      if (issues.imageAlt?.missingAlt) {
         issuesList.push('Image Alt Text');
      }
      if (issues.unsafeCrossOriginLinks?.unsafeTargetBlankLinks) {
         issuesList.push('Unsafe Cross-Origin Links');
      }
      if (issues.plaintextEmails?.plaintextEmails) {
         issuesList.push('Plaintext Email Protection');
      }
      if (issues.canonicalUrl) issuesList.push('Canonical URL');
      if (issues.keywordUsage?.keywords) {
         issuesList.push('Keyword Usage Optimization');
      }
   }

   return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
         <div className="bg-background border border-border rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center mb-8">
               <h3 className="text-xl font-semibold mb-2">Applying SEO Fixes</h3>
               <p className="text-sm text-muted-foreground">
                  Please wait while we optimize your SEO...
               </p>
            </div>

            <div className="space-y-1">
               {progressSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                     <div className="flex flex-col items-center">
                        <div
                           className={cn(
                              'relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300',
                              step.completed &&
                              'bg-green-500 border-green-500 text-white',
                              step.active &&
                              'bg-primary border-primary text-primary-foreground animate-pulse',
                              !step.completed &&
                              !step.active &&
                              'bg-muted border-muted-foreground/30 text-muted-foreground'
                           )}
                        >
                           {step.completed ? (
                              <Check className="w-4 h-4" />
                           ) : step.active ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                           ) : (
                              <div className="w-2 h-2 rounded-full bg-current" />
                           )}
                        </div>

                        {index < progressSteps.length - 1 && (
                           <div
                              className={cn(
                                 'w-0.5 h-6 transition-all duration-300',
                                 step.completed ? 'bg-green-500' : 'bg-muted-foreground/20'
                              )}
                           />
                        )}
                     </div>

                     <div className="flex-1 pt-1.5 pb-4">
                        <p
                           className={cn(
                              'text-sm font-medium transition-colors duration-300',
                              step.completed && 'text-green-600 dark:text-green-400',
                              step.active && 'text-primary font-semibold',
                              !step.completed && !step.active && 'text-muted-foreground'
                           )}
                        >
                           {step.message}
                        </p>
                     </div>
                  </div>
               ))}
            </div>

            {issuesList.length > 0 && (
               <div className="mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                  <h4 className="text-sm font-semibold mb-3 text-green-800 dark:text-green-300">
                     What we are looking for:
                  </h4>
                  <ul className="space-y-2">
                     {issuesList.map((issue, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs text-green-700 dark:text-green-400">
                           <span className="mt-0.5">✓</span>
                           <span>{issue}</span>
                        </li>
                     ))}
                  </ul>
               </div>
            )}

            {/* <div className="mt-6 pt-6 border-t border-border">
               <p className="text-xs text-muted-foreground text-center">
                  ⚠️ Do not close this window or refresh the page
               </p>
            </div> */}
         </div>
      </div>
   );
}

