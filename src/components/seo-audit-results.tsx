'use client';

import { AuditSummaryCard } from '@/app/_components/audit/seo-audit/audit-summary-card';
import { CategoryIssueSection } from '@/app/_components/audit/seo-audit/category-issue-section';
import { IssuesSummaryCard } from '@/app/_components/audit/seo-audit/issues-summary-card';
import { IssuesToFixCard } from '@/app/_components/audit/seo-audit/issues-to-fix-card';
import type { TransformedWebsiteAuditResponse } from '@/lib/types/website-audit';
import { Shield, Smartphone, Zap } from 'lucide-react';
import { Button } from '@/app/_components/ui/button';
import { toast } from 'sonner';

interface SeoAuditResultsProps {
   auditData: TransformedWebsiteAuditResponse;
   onAutoFix?: () => void;
}

export function SeoAuditResults({ auditData, onAutoFix }: SeoAuditResultsProps) {

   const convertCategoryScoresToSummaryCard = () => {
      return {
         commonSeoIssues: {
            name: 'Common SEO Issues',
            score: auditData.categoryScores.commonSeoIssues,
            passed: auditData.categories.commonSeoIssues.passed,
            failed: auditData.categories.commonSeoIssues.failed,
            warnings: auditData.categories.commonSeoIssues.warnings,
            issues: [],
         },
         serverSecurity: {
            name: 'Server & Security',
            score: auditData.categoryScores.serverAndSecurity,
            passed: auditData.categories.serverSecurity.passed,
            failed: auditData.categories.serverSecurity.failed,
            warnings: auditData.categories.serverSecurity.warnings,
            issues: [],
         },
         mobileUsability: {
            name: 'Mobile Usability',
            score: auditData.categoryScores.mobileUsability,
            passed: auditData.categories.mobileUsability.passed,
            failed: auditData.categories.mobileUsability.failed,
            warnings: auditData.categories.mobileUsability.warnings,
            issues: [],
         },
         advancedSeo: {
            name: 'Advanced SEO',
            score: auditData.categoryScores.advancedSeo,
            passed: auditData.categories.advancedSeo.passed,
            failed: auditData.categories.advancedSeo.failed,
            warnings: auditData.categories.advancedSeo.warnings,
            issues: [],
         },
      };
   };

   const handleAutoFix = () => {
      // calling parent auto-fix
      if (onAutoFix) {
         onAutoFix();
      } else {
         toast.error('Please configure GitHub integration first');
      }
   };

   return (
      <div className="space-y-8">
         <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
               <h2 className="font-bold text-2xl">SEO Audit Results</h2>
               <p className="text-muted-foreground">
                  Analyzed: <span className="font-medium">{auditData.url}</span>
               </p>
               <p className="text-muted-foreground text-sm">
                  {new Date(auditData.timestamp).toLocaleString()}
               </p>
            </div>
            <Button
               onClick={handleAutoFix}
               size="lg"
               className="gap-2 text-background"
            >
               <Zap className="h-4 w-4" />
               Auto-Fix with GitHub
            </Button>
         </div>

         <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2">
               <AuditSummaryCard
                  auditSummary={auditData.auditSummary}
                  websiteUrl={auditData.url}
               />
            </div>

            <div className="lg:col-span-3">
               <IssuesSummaryCard
                  categories={convertCategoryScoresToSummaryCard()}
                  overallScore={auditData.overallScore}
               />
            </div>
         </div>

         <IssuesToFixCard categories={auditData.categories} />

         <div className="space-y-6">
            <div className="text-center">
               <h3 className="mb-2 font-semibold text-xl">
                  SEO Performance Breakdown
               </h3>
               <p className="text-muted-foreground text-sm">
                  Detailed analysis with all data integrated into each category
               </p>
            </div>

            <div className="space-y-4">
               {Object.entries(auditData.categories)
                  .sort(([a], [b]) => {
                     const order = [
                        'commonSeoIssues',
                        'serverSecurity',
                        'mobileUsability',
                        'advancedSeo',
                     ];
                     return order.indexOf(a) - order.indexOf(b);
                  })
                  .map(([categoryKey, category]) => {
                     const categoryConfig = {
                        commonSeoIssues: {
                           icon: <Zap className="h-5 w-5" />,
                           color: 'orange' as const,
                        },
                        serverSecurity: {
                           icon: <Shield className="h-5 w-5" />,
                           color: 'blue' as const,
                        },
                        mobileUsability: {
                           icon: <Smartphone className="h-5 w-5" />,
                           color: 'green' as const,
                        },
                        advancedSeo: {
                           icon: <Zap className="h-5 w-5" />,
                           color: 'purple' as const,
                        },
                     }[categoryKey as keyof typeof auditData.categories];

                     if (!categoryConfig) {
                        return null;
                     }

                     return (
                        <CategoryIssueSection
                           key={categoryKey}
                           category={category}
                           icon={categoryConfig.icon}
                           color={categoryConfig.color}
                           defaultExpanded={category.failed > 0}
                        />
                     );
                  })}
            </div>
         </div>
      </div>
   );
}

