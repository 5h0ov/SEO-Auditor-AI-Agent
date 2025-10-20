'use client';

import { useState, useEffect } from 'react';
import { useGitHubStore } from '@/lib/store/github-store';
import { usePRStore } from '@/lib/store/pr-store';
import { api } from '@/lib/trpc/react';
import { toast } from 'sonner';

type SEOIssue = {
  metaTitle?: {
    text?: string;
    length?: number;
    recommendation?: string;
  };
  metaDescription?: {
    text?: string;
    length?: number;
    recommendation?: string;
  };
  imageAlt?: {
    totalImages?: number;
    missingAlt?: number;
    imagesWithMissingAlt?: string[];
    recommendation?: string;
  };
  unsafeCrossOriginLinks?: {
    totalTargetBlankLinks?: number;
    unsafeTargetBlankLinks?: number;
    complianceRate?: number;
    recommendation?: string;
    status?: string;
  };
  plaintextEmails?: {
    totalEmails?: number;
    plaintextEmails?: number;
    complianceRate?: number;
    recommendation?: string;
    status?: string;
  };
  canonicalUrl?: {
    canonicalUrl?: string;
    status?: string;
    recommendation?: string;
  };
  keywordUsage?: {
    keywords?: Record<string, {
      inTitle: boolean;
      inMetaDescription: boolean;
      inHeadings: boolean;
    }>;
    status?: string;
    recommendation?: string;
  };
};

export function useSeoFixes() {
  const { integration, getAccessToken } = useGitHubStore();
  const { setLatestPR } = usePRStore();
  const utils = api.useUtils();
  const [isFixing, setIsFixing] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [progressSteps, setProgressSteps] = useState<Array<{ message: string }>>([]);
  const [currentIssues, setCurrentIssues] = useState<any>(null);

  useEffect(() => {
    if (!isFixing) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isFixing]);

  const applySeoFixes = async (seoIssues: SEOIssue, websiteUrl: string) => {
    if (!integration?.selectedRepository || !integration?.selectedBranch) {
      toast.error('Please configure GitHub integration first');
      return;
    }

    setIsFixing(true);
    setProgress('Initializing SEO fixes...');

    setCurrentIssues({
      metaTitle: !!seoIssues.metaTitle,
      metaDescription: !!seoIssues.metaDescription,
      imageAlt: seoIssues.imageAlt,
      unsafeCrossOriginLinks: seoIssues.unsafeCrossOriginLinks,
      canonicalUrl: !!seoIssues.canonicalUrl,
      keywordUsage: seoIssues.keywordUsage,
    });

    const steps: Array<{ message: string; duration: number }> = [
      { message: 'Analyzing repository structure...', duration: 5000 },
    ];

    if (integration.autoSelectFiles) {
      steps.push({ message: 'Selecting relevant files...', duration: 10000 });
    }

    steps.push(
      { message: 'Generating SEO fixes...', duration: 20000 },
      { message: 'Applying fixes to files...', duration: 20000 },
      { message: 'Creating pull request...', duration: 3000 },
    );

    setProgressSteps(steps.map(s => ({ message: s.message })));

    let currentStep = 0;
    let progressTimeout: NodeJS.Timeout;

    const updateProgress = () => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep]!.message);
        const duration = steps[currentStep]!.duration;
        currentStep++;
        progressTimeout = setTimeout(updateProgress, duration);
      }
    };

    progressTimeout = setTimeout(updateProgress, 1000);

    try {
      const token = await getAccessToken();
      if (!token) throw new Error('No access token');

      const [owner, repo] = integration.selectedRepository.full_name.split('/');

      const result = await utils.client.github.applySeoFixes.mutate({
        accessToken: token,
        owner,
        repo,
        branch: integration.selectedBranch,
        selectedFiles: integration.selectedFiles,
        autoSelectFiles: integration.autoSelectFiles,
        seoIssues,
        websiteUrl,
      });

      clearTimeout(progressTimeout);

      setLatestPR({
        pullRequestUrl: result.pullRequestUrl || '',
        pullRequestNumber: result.pullRequestNumber || 0,
        branchName: result.branchName || '',
        baseBranch: integration.selectedBranch || '',
        filesFixed: result.filesFixed || 0,
        repository: integration.selectedRepository.full_name,
        timestamp: new Date().toISOString(),
      });

      toast.success(`Pull request created! Fixed ${result.filesFixed} files.`);

      // if (result.pullRequestUrl) {
      //   window.open(result.pullRequestUrl, '_blank');
      // }

      return result;
    } catch (error) {
      clearTimeout(progressTimeout);
      const message = error instanceof Error ? error.message : 'Failed to apply fixes';
      toast.error(message);
      throw error;
    } finally {
      setIsFixing(false);
      setProgress('');
      setProgressSteps([]);
      setCurrentIssues(null);
    }
  };

  return {
    applySeoFixes,
    isFixing,
    progress,
    progressSteps,
    currentIssues,
  };
}
