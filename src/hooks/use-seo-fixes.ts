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
};

export function useSeoFixes() {
  const { integration, getAccessToken } = useGitHubStore();
  const { setLatestPR } = usePRStore();
  const utils = api.useUtils();
  const [isFixing, setIsFixing] = useState(false);
  const [progress, setProgress] = useState<string>('');

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
    setProgress('Applying SEO fixes...');

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
      });

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

      if (result.pullRequestUrl) {
        window.open(result.pullRequestUrl, '_blank');
      }

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to apply fixes';
      toast.error(message);
      throw error;
    } finally {
      setIsFixing(false);
      setProgress('');
    }
  };

  return {
    applySeoFixes,
    isFixing,
    progress,
  };
}
