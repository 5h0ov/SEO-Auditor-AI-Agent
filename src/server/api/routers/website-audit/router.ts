import { env } from '@/env';
import type {
  CategoryResults,
  TransformedSeoCategory,
  TransformedSeoIssue,
  TransformedWebsiteAuditResponse,
  WebsiteAuditApiResponse,
  WebsiteAuditCategoryScores,
} from '@/lib/types/website-audit';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import axios from 'axios';
import { z } from 'zod';

const IMPACT_LEVELS = ['high', 'medium', 'low'] as const;
const SEVERITY_LEVELS = ['high', 'medium', 'low'] as const;
const STATUS_LEVELS = ['fail', 'warning', 'pass'] as const;

/**
 * Validate URL format
 */
function validateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Transform backend audit data to frontend format
 */
export function transformWebsiteAuditData(
  backendData: WebsiteAuditApiResponse
): TransformedWebsiteAuditResponse {
  const transformCategoryResults = (
    categoryData: CategoryResults,
    categoryName: string,
    scoreKey: keyof WebsiteAuditCategoryScores
  ): TransformedSeoCategory => {
    const issues: TransformedSeoIssue[] = Object.entries(categoryData).map(
      ([key, audit]) => {
        let status: 'pass' | 'fail' | 'warning';
        if (audit.passed === true) {
          status = 'pass';
        } else if (audit.passed === false) {
          status = 'fail';
        } else {
          status = 'warning';
        }

        return {
          title: key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase()),
          description: audit.description || '',
          statusText: audit.status || '',
          note: audit.note || '',
          impact: 'medium' as const,
          severity: audit.severity || ('medium' as const),
          status,
          recommendation: audit.recommendation || '',
          howToFix: audit.recommendation || '',
          bestPractices: audit.bestPractices || [],
          text: audit.text,
          length: audit.length,
          moreDetails: {
            // Keyword-related
            ...(audit.keywords && { keywords: audit.keywords }),
            ...(audit.frequency && { frequency: audit.frequency }),
            ...(audit.top10Keywords && { top10Keywords: audit.top10Keywords }),
            ...(audit.multipleOccurrence && { multipleOccurrence: audit.multipleOccurrence }),
            ...(audit.singleOccurrence && { singleOccurrence: audit.singleOccurrence }),
            ...(audit.totalUniqueWords !== undefined && { totalUniqueWords: audit.totalUniqueWords }),
            ...(audit.multipleOccurrenceCount !== undefined && { multipleOccurrenceCount: audit.multipleOccurrenceCount }),
            ...(audit.singleOccurrenceCount !== undefined && { singleOccurrenceCount: audit.singleOccurrenceCount }),

            // Social/Headings/Search Preview
            ...(audit.openGraph && { openGraph: audit.openGraph }),
            ...(audit.twitter && { twitter: audit.twitter }),
            ...(audit.headings && { headings: audit.headings }),
            ...(audit.desktop && { desktop: audit.desktop }),
            ...(audit.mobile && { mobile: audit.mobile }),

            // Links
            ...(audit.totalLinks !== undefined && { totalLinks: audit.totalLinks }),
            ...(audit.seoFriendlyLinks !== undefined && { seoFriendlyLinks: audit.seoFriendlyLinks }),
            ...(audit.urlDetails && {
              nonSeoFriendlyUrls: audit.urlDetails
                .filter((u) => !u.isSeoFriendly)
                .map((u) => u.url),
            }),

            // Image-related (keep zeros)
            ...(audit.totalImages !== undefined && { totalImages: audit.totalImages }),
            ...(audit.imagesWithAlt !== undefined && { imagesWithAlt: audit.imagesWithAlt }),
            ...(audit.missingAlt !== undefined && { missingAlt: audit.missingAlt }),
            // responsiveImages: prefer responsiveContentImages, fallback to responsiveImages
            ...(audit.responsiveContentImages !== undefined && { responsiveImages: audit.responsiveContentImages }),
            ...(audit.responsiveImages !== undefined && audit.responsiveContentImages === undefined && { responsiveImages: audit.responsiveImages }),
            ...(audit.contentImages !== undefined && { contentImages: audit.contentImages }),
            ...(audit.svgImages !== undefined && { svgImages: audit.svgImages }),
            ...(audit.nonResponsiveContentImages !== undefined && { nonResponsiveContentImages: audit.nonResponsiveContentImages }),
            // responsiveTotalImages: prefer provided value, fallback to totalImages
            ...(audit.responsiveTotalImages !== undefined && { responsiveTotalImages: audit.responsiveTotalImages }),
            ...(audit.totalImages !== undefined && audit.responsiveTotalImages === undefined && { responsiveTotalImages: audit.totalImages }),
            ...(audit.imageDetails && {
              imagesWithMissingAlt: audit.imageDetails
                .filter((image) => !image.isSVG && image.requiresAlt && !image.hasAlt)
                .map((image) => image.src),
            }),
            // Derive list of non-responsive images from images[] if present
            ...(audit.images && {
              imagesWithNonResponsive: audit.images
                .filter((img) => img.shouldBeResponsive && !img.isResponsive)
                .map((img) => (img.src || (img as any).url || ''))
                .filter((v) => v),
            }),

            // Misc/Security/Advanced flags (keep zeros)
            ...(audit.charset ? { charset: audit.charset } : {}),
            ...(audit.deprecatedTags && { deprecatedTags: audit.deprecatedTags }),
            ...(audit.emails && { emails: audit.emails }),
            ...(audit.unsafeLinksFound !== undefined && { unsafeLinksFound: audit.unsafeLinksFound }),
            ...(audit.canonicalUrl !== undefined && { canonicalUrl: audit.canonicalUrl }),
            ...(audit.mixedContentFound !== undefined && { mixedContentFound: audit.mixedContentFound }),
            ...(audit.detailedResults && { detailedResults: audit.detailedResults }),
            ...(audit.vulnerableCount !== undefined && { vulnerableCount: audit.vulnerableCount }),
            ...(audit.secureCount !== undefined && { secureCount: audit.secureCount }),
            ...(audit.totalChecked !== undefined && { totalChecked: audit.totalChecked }),
            ...(audit.emailsFound !== undefined && { emailsFound: audit.emailsFound }),
            ...(audit.content !== undefined && { content: audit.content }),
            ...(audit.jsonLdFound !== undefined && { jsonLdFound: audit.jsonLdFound }),
            ...(audit.microdataFound !== undefined && { microdataFound: audit.microdataFound }),
            ...(audit.rdfaFound !== undefined && { rdfaFound: audit.rdfaFound }),
            ...(audit.hasMetaRefresh !== undefined && { hasMetaRefresh: audit.hasMetaRefresh }),
            ...(audit.nofollowLinksFound !== undefined && { nofollowLinksFound: audit.nofollowLinksFound }),
            ...(audit.robotsContent !== undefined && { robotsContent: audit.robotsContent }),
            ...(audit.hasNoindex !== undefined && { hasNoindex: audit.hasNoindex }),
            ...(audit.jsErrors !== undefined && { jsErrors: audit.jsErrors }),
            ...(audit.criticalErrors !== undefined && { criticalErrors: audit.criticalErrors }),
            ...(audit.errorDetails && { errorDetails: audit.errorDetails }),
            ...(audit.jsError && { jsError: audit.jsError }),
          },
        };
      }
    );

    const passed = issues.filter((i) => i.status === 'pass').length;
    const failed = issues.filter((i) => i.status === 'fail').length;
    const warnings = issues.filter((i) => i.status === 'warning').length;
    const total = passed + failed + warnings;
    const score = total > 0 ? Math.round((passed / total) * 100) : 0;

    return {
      name: categoryName,
      score,
      passed,
      failed,
      warnings,
      issues,
    };
  };

  const categories = {
    commonSeoIssues: transformCategoryResults(
      backendData.seoAudit.results.commonSeoIssues,
      'Common SEO Issues',
      'commonSeoIssues'
    ),
    serverSecurity: transformCategoryResults(
      backendData.seoAudit.results.serverAndSecurity,
      'Server & Security',
      'serverAndSecurity'
    ),
    mobileUsability: transformCategoryResults(
      backendData.seoAudit.results.mobileUsability,
      'Mobile Usability',
      'mobileUsability'
    ),
    advancedSeo: transformCategoryResults(
      backendData.seoAudit.results.advancedSeo,
      'Advanced SEO',
      'advancedSeo'
    ),
  };

  const overallScore = Math.round(backendData.seoAudit.overallScore);
  const totalTests =
    categories.commonSeoIssues.issues.length +
    categories.serverSecurity.issues.length +
    categories.mobileUsability.issues.length +
    categories.advancedSeo.issues.length;

  const passedTests =
    categories.commonSeoIssues.passed +
    categories.serverSecurity.passed +
    categories.mobileUsability.passed +
    categories.advancedSeo.passed;

  return {
    overallScore,
    totalTests,
    passedTests,
    url: backendData.url,
    timestamp: new Date().toISOString(),
    categoryScores: {
      commonSeoIssues: categories.commonSeoIssues.score,
      serverAndSecurity: categories.serverSecurity.score,
      mobileUsability: categories.mobileUsability.score,
      advancedSeo: categories.advancedSeo.score,
    },
    auditSummary: {
      score: overallScore,
      grade: overallScore >= 90 ? 'A' : overallScore >= 80 ? 'B' : overallScore >= 70 ? 'C' : 'D',
      status:
        overallScore >= 90
          ? 'excellent'
          : overallScore >= 80
            ? 'good'
            : overallScore >= 60
              ? 'needs-improvement'
              : 'poor',
      categories: {
        commonSeo: {
          score: categories.commonSeoIssues.score,
          status: categories.commonSeoIssues.score >= 80 ? 'good' : 'needs-improvement',
        },
        security: {
          score: categories.serverSecurity.score,
          status: categories.serverSecurity.score >= 80 ? 'good' : 'needs-improvement',
        },
        mobile: {
          score: categories.mobileUsability.score,
          status: categories.mobileUsability.score >= 80 ? 'good' : 'needs-improvement',
        },
        advanced: {
          score: categories.advancedSeo.score,
          status: categories.advancedSeo.score >= 80 ? 'good' : 'needs-improvement',
        },
      },
    },
    categories,
  };
}

/**
 * Run website audit analysis via internal API
 */
export async function runWebsiteAuditAnalysis(
  url: string
): Promise<WebsiteAuditApiResponse> {
  try {
    const apiKey = env.INTERNAL_API_KEY;
    if (!apiKey) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'INTERNAL_API_KEY is not configured',
      });
    }

    const urlForApi = url.endsWith('/') ? url : `${url}/`;

    console.log(`🚀 Running Website Audit analysis for: ${urlForApi}`);

    const response = await axios.get<WebsiteAuditApiResponse>(
      `${env.INTERNAL_API_URL}/website-audit`,
      {
        params: { url: urlForApi },
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'User-Agent': 'SnowSEO/3.0.0',
        },
        timeout: 60000, // 60 second timeout
      }
    );

    console.log('✅ Website Audit analysis completed for:', url);
    return response.data;
  } catch (error) {
    console.error('Website Audit API Error:', error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      if (status === 429) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Rate limit exceeded. Please try again later.',
        });
      }

      if (status === 401) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid API key',
        });
      }

      const errorMessage = error.response?.data?.message || error.message;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to run audit: ${errorMessage}`,
      });
    }

    if (error instanceof TRPCError) {
      throw error;
    }

    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Failed to run audit: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
}

/**
 * Website Audit Router
 */
export const websiteAuditRouter = createTRPCRouter({
  analyzeWebsite: publicProcedure
    .input(
      z.object({
        url: z.string().url('Please provide a valid URL'),
      })
    )
    .mutation(async ({ input }) => {
      const { url } = input;

      if (!validateUrl(url)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid URL format',
        });
      }

      console.log('[Website Audit] Starting analysis for:', url);

      try {
        const analysisResult = await runWebsiteAuditAnalysis(url);

        const transformedData = transformWebsiteAuditData(analysisResult);

        console.log('[Website Audit] Analysis complete:', {
          url,
          score: transformedData.overallScore,
        });

        return transformedData;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error('[Website Audit] Analysis failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to analyze website',
        });
      }
    }),
});

