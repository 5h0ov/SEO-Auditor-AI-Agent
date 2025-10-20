'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/app/_components/ui/button';
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
} from '@/app/_components/ui/dialog';
import { GitHubFileManagerDialog } from '@/app/_components/github/github-file-manager-dialog';
import { GitHubRepositorySelector } from '@/app/_components/github/github-repository-selector';
import { useGitHubConnection } from '@/hooks/use-github-connection';
import { useGitHubApi } from '@/hooks/use-github-api';
import { useSeoFixes } from '@/hooks/use-seo-fixes';
import type { TransformedWebsiteAuditResponse } from '@/lib/types/website-audit';
import { toast } from 'sonner';
import { Zap, Github } from 'lucide-react';

interface GitHubIntegrationDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   websiteUrl: string;
   auditData: TransformedWebsiteAuditResponse | null;
}

export function GitHubIntegrationDialog({
   open,
   onOpenChange,
   websiteUrl,
   auditData,
}: GitHubIntegrationDialogProps) {
   const [selectedRepository, setSelectedRepository] = useState<any>(null);
   const [selectedBranch, setSelectedBranch] = useState<string>('');
   const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
   const [autoSelectFiles, setAutoSelectFiles] = useState(true);
   const [showFileManager, setShowFileManager] = useState(false);

   const seoIssues = useMemo(() => {
      if (!auditData) return {};

      const issues = auditData.categories?.commonSeoIssues?.issues || [];

      console.log('[GitHub Integration] All issues:', issues.map(i => ({ title: i.title, description: i.description })));

      const securityIssues = auditData.categories?.serverSecurity?.issues || [];
      console.log('[GitHub Integration] Security issues:', securityIssues.map((i: { title: string }) => ({ title: i.title })));

      const metaTitleIssue = issues.find((i) => i.title.toLowerCase().includes('meta title') || i.title.toLowerCase().includes('title tag'));
      const metaDescIssue = issues.find((i) => i.title.toLowerCase().includes('meta description') || i.title.toLowerCase().includes('description tag'));
      const imageAltIssue = issues.find((i) => i.title.toLowerCase().includes('image') && i.title.toLowerCase().includes('alt'));
      const unsafeLinksIssue = securityIssues.find((i: { title: string }) => i.title.toLowerCase().includes('unsafe') && i.title.toLowerCase().includes('cross origin'));

      console.log('[GitHub Integration] Meta Title Issue:', metaTitleIssue);
      console.log('[GitHub Integration] Meta Desc Issue:', metaDescIssue);
      console.log('[GitHub Integration] Image Alt Issue:', imageAltIssue);
      console.log('[GitHub Integration] Unsafe Links Issue:', unsafeLinksIssue);

      const transformed = {
         metaTitle: metaTitleIssue ? {
            text: metaTitleIssue.description,
            recommendation: metaTitleIssue.recommendation,
         } : undefined,
         metaDescription: metaDescIssue ? {
            text: metaDescIssue.description,
            recommendation: metaDescIssue.recommendation,
         } : undefined,
         imageAlt: imageAltIssue && 'moreDetails' in imageAltIssue ? {
            totalImages: (imageAltIssue.moreDetails as { totalImages?: number })?.totalImages || 0,
            missingAlt: (imageAltIssue.moreDetails as { missingAlt?: number })?.missingAlt || 0,
            imagesWithMissingAlt: (imageAltIssue.moreDetails as { imagesWithMissingAlt?: string[] })?.imagesWithMissingAlt || [],
            recommendation: imageAltIssue.recommendation || imageAltIssue.statusText || '',
         } : undefined,
         unsafeCrossOriginLinks: unsafeLinksIssue && 'moreDetails' in unsafeLinksIssue ? {
            totalTargetBlankLinks: (unsafeLinksIssue.moreDetails as { totalTargetBlankLinks?: number })?.totalTargetBlankLinks || 0,
            unsafeTargetBlankLinks: (unsafeLinksIssue.moreDetails as { unsafeTargetBlankLinks?: number })?.unsafeTargetBlankLinks || 0,
            complianceRate: (unsafeLinksIssue.moreDetails as { complianceRate?: number })?.complianceRate || 0,
            recommendation: unsafeLinksIssue.recommendation || unsafeLinksIssue.statusText || '',
            status: unsafeLinksIssue.status || '',
         } : undefined,
      };

      console.log('[GitHub Integration] Transformed SEO Issues:', transformed);

      return transformed;
   }, [auditData]);

   const { isConnected, handleConnect, isConnecting } = useGitHubConnection();
   const {
      repositories,
      branches,
      files,
      getRepositories,
      getBranches,
      getFiles,
      selectRepository,
      selectBranch,
      selectFiles,
      isLoadingRepositories,
      isLoadingBranches,
      isLoadingFiles,
   } = useGitHubApi();
   const { applySeoFixes, isFixing, progress: fixProgress } = useSeoFixes();

   useEffect(() => {
      if (open && isConnected) {
         selectFiles([], true);
      }
   }, [open, isConnected]);

   const handleRepositorySelect = async (repo: any) => {
      setSelectedRepository(repo);
      selectRepository(repo);

      // Auto-select default branch and fetch branches
      if (repo.default_branch) {
         setSelectedBranch(repo.default_branch);
         selectBranch(repo.default_branch);
         const [owner] = repo.full_name.split('/');
         await getBranches(owner, repo.name);
      }
   };

   const handleBranchSelect = async (branchName: string) => {
      setSelectedBranch(branchName);
      if (selectedRepository) {
         const [owner, repo] = selectedRepository.full_name.split('/');
         await getFiles(owner, repo, branchName);
      }
   };

   const handleFileManagerSave = (branch: string, files: string[], autoSelect: boolean) => {
      setSelectedBranch(branch);
      setSelectedFiles(files);
      setAutoSelectFiles(autoSelect);

      // Sync with store
      selectBranch(branch);
      selectFiles(files, autoSelect); // Pass autoSelect to store

      setShowFileManager(false);
   };

   const handleApplyFixes = async () => {
      if (!selectedRepository || !selectedBranch) {
         toast.error('Please select a repository and branch.');
         return;
      }

      if (!autoSelectFiles && selectedFiles.length === 0) {
         toast.error('Please select files to fix.');
         return;
      }

      try {
         toast.loading('Applying SEO fixes...this may take a few minutes depending on the number of files.', {
            duration: Infinity,
            id: 'seo-fixes-loading',
         });
         await applySeoFixes(seoIssues, websiteUrl);
         onOpenChange(false);
      } catch (error) {
         console.error('Failed to apply SEO fixes:', error);
      } finally {
         toast.dismiss('seo-fixes-loading');
      }
   };

   if (!isConnected) {
      return (
         <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
               <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                     <Github className="h-5 w-5" />
                     Connect to GitHub
                  </DialogTitle>
                  <DialogDescription>
                     Connect your GitHub account to automatically fix SEO issues via pull requests.
                  </DialogDescription>
               </DialogHeader>

               <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                     <h3 className="font-medium mb-2">What you'll get:</h3>
                     <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Automatically fix main SEO-related issues</li>
                        <li>• Create pull requests with fixes</li>
                        <li>• Select specific files to update</li>
                        <li>• AI-powered auto file selection</li>
                     </ul>
                  </div>

                  <Button
                     onClick={handleConnect}
                     disabled={isConnecting}
                     className="w-full text-background"
                  >
                     {isConnecting ? 'Connecting...' : 'Connect GitHub'}
                  </Button>
               </div>
            </DialogContent>
         </Dialog>
      );
   }

   return (
      <>
         <Dialog
            open={open}
            onOpenChange={(newOpen) => {
               if (isFixing && !newOpen) {
                  toast.warning('Please wait for SEO fixes to complete before closing.');
                  return;
               }
               onOpenChange(newOpen);
            }}
         >
            <DialogContent
               className="max-w-2xl"
               onInteractOutside={(e) => {
                  if (isFixing) {
                     e.preventDefault();
                     toast.warning('Please wait for SEO fixes to complete.');
                  }
               }}
               onEscapeKeyDown={(e) => {
                  if (isFixing) {
                     e.preventDefault();
                     toast.warning('Please wait for SEO fixes to complete.');
                  }
               }}
            >
               <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                     <Zap className="h-5 w-5" />
                     Auto-Fix SEO Issues
                  </DialogTitle>
                  <DialogDescription>
                     {isFixing
                        ? '⚠️ Do not close this dialog or refresh the page while fixes are being applied.'
                        : 'Select a repository and files to automatically generate SEO fixes.'
                     }
                  </DialogDescription>
               </DialogHeader>

               {/* TODO: Add a loading overlay while applying fixes */}

               <div className="space-y-6">
                  {/* Repository Selection */}
                  <div className="space-y-2">
                     <label className="text-sm font-medium">Repository</label>
                     <GitHubRepositorySelector
                        repositories={repositories || []}
                        selectedRepository={selectedRepository}
                        onSelect={handleRepositorySelect}
                        disabled={isLoadingRepositories}
                        isLoading={isLoadingRepositories}
                     />
                  </div>


                  {/* File Selection */}
                  {selectedRepository && selectedBranch && (
                     <div className="space-y-2">
                        <label className="text-sm font-medium">Files to Fix</label>
                        <div className="flex items-center gap-2">
                           <Button
                              variant="outline"
                              onClick={() => setShowFileManager(true)}
                              className="flex-1"
                           >
                              {autoSelectFiles
                                 ? 'Select Files & Branch'
                                 : `${selectedFiles.length} files selected (Branch: ${selectedBranch})`
                              }
                           </Button>
                        </div>
                     </div>
                  )}

                  {/* Apply Fixes Button */}
                  <Button
                     onClick={handleApplyFixes}
                     disabled={isFixing || !selectedRepository || !selectedBranch}
                     className="w-full text-background"
                  >
                     {isFixing ? (
                        <>
                           <Zap className="mr-2 h-4 w-4 animate-spin" />
                           {fixProgress}
                        </>
                     ) : !selectedRepository ? (
                        <>
                           <Zap className="mr-2 h-4 w-4" />
                           Select Repository First
                        </>
                     ) : !selectedBranch ? (
                        <>
                           <Zap className="mr-2 h-4 w-4" />
                           Select Branch First
                        </>
                     ) : (
                        <>
                           <Zap className="mr-2 h-4 w-4" />
                           Apply SEO Fixes (PR to Branch: {selectedBranch})
                        </>
                     )}
                  </Button>
               </div>
            </DialogContent>
         </Dialog>

         {/* File Manager Dialog */}
         {selectedRepository && (
            <GitHubFileManagerDialog
               open={showFileManager}
               onOpenChange={setShowFileManager}
               repositoryFullName={selectedRepository.full_name}
               selectedBranch={selectedBranch}
               selectedFiles={selectedFiles}
               autoSelectFiles={autoSelectFiles}
               onSave={handleFileManagerSave}
               isSaving={isFixing}
            />
         )}
      </>
   );
}
