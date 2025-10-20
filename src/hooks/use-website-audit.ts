'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc/react';
import { toast } from 'sonner';
import type { TransformedWebsiteAuditResponse } from '@/lib/types/website-audit';
import { validateAndFormatUrl } from '@/lib/utils';

/**
 * Website Audit Hook
 */
export function useWebsiteAudit() {
  const utils = api.useUtils();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<TransformedWebsiteAuditResponse | null>(null);


  /**
   * Analyze a website for SEO issues
   */
  const analyzeWebsite = async (url: string) => {
    setIsAnalyzing(true);
    setCurrentAnalysis(null);

    try {
      const formattedUrl = validateAndFormatUrl(url);
      console.log('[Website Audit] Starting analysis for:', formattedUrl);

      const result = await utils.client.websiteAudit.analyzeWebsite.mutate({ url: formattedUrl });

      setCurrentAnalysis(result);

      toast.success(`Analysis complete! SEO Score: ${result.overallScore}/100`, {
        description: `${result.passedTests}/${result.totalTests} checks passed`,
      });

      return result;
    } catch (error) {
      console.error('[Website Audit] Analysis failed:', error);

      const message = error instanceof Error ? error.message : 'Failed to analyze website';
      toast.error('Analysis failed', {
        description: message,
      });

      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Clear current analysis
   */
  const clearAnalysis = () => {
    setCurrentAnalysis(null);
  };

  return {
    analyzeWebsite,
    clearAnalysis,
    isAnalyzing,
    currentAnalysis,
  };
}

