import type React from 'react';

// Base types for keyword analysis
export interface KeywordUsage {
  inTitle: boolean;
  inMetaDescription: boolean;
  inHeadings: boolean;
}

export interface KeywordUsageMap {
  [keyword: string]: KeywordUsage;
}

export interface KeywordOccurrence {
  word: string;
  count: number;
}

// Category scores for different audit areas
export interface WebsiteAuditCategoryScores {
  commonSeoIssues: number;
  serverAndSecurity: number;
  mobileUsability: number;
  advancedSeo: number;
}

// Raw audit result from API
export interface AuditResult {
  passed: boolean | null;
  text?: string;
  length?: number;
  status?: string;
  recommendation?: string;
  description?: string;
  bestPractices?: string[];
  note?: string;
  severity?: 'high' | 'medium' | 'low';
  keywords?: KeywordUsageMap;
  frequency?: Record<string, number>;
  top10Keywords?: string[];
  multipleOccurrence?: Array<{ word: string; count: number }>;
  singleOccurrence?: Array<{ word: string; count: number }>;
  totalUniqueWords?: number;
  multipleOccurrenceCount?: number;
  singleOccurrenceCount?: number;
  openGraph?: Record<string, string>;
  twitter?: Record<string, string>;
  headings?: Record<string, string[]>;
  desktop?: { url?: string; description?: string };
  mobile?: { url?: string; description?: string };
  totalLinks?: number;
  seoFriendlyLinks?: number;
  totalImages?: number;
  imagesWithAlt?: number;
  missingAlt?: number;
  responsiveImages?: number;
  responsiveContentImages?: number;
  contentImages?: number;
  svgImages?: number;
  nonResponsiveContentImages?: number;
  responsiveTotalImages?: number;
  imageDetails?: Array<{
    src: string;
    alt: string;
    hasAlt: boolean;
    isSVG: boolean;
    requiresAlt: boolean;
  }>;
  images?: Array<{
    src: string;
    alt: string;
    width: number;
    height: number;
    className: string;
    hasSrcset: boolean;
    hasSizes: boolean;
    isInPicture: boolean;
    isSVG: boolean;
    shouldBeResponsive: boolean;
    isResponsive: boolean;
    reason: string;
  }>;
  urlDetails?: Array<{
    url: string;
    isSeoFriendly: boolean;
  }>;
  charset?: string;
  deprecatedTags?: string[];
  emails?: string[];
  unsafeLinksFound?: number;
  // Server & Security specific fields
  canonicalUrl?: string | null;
  mixedContentFound?: number;
  detailedResults?: Array<{
    path: string;
    isDirectoryListing: boolean;
    hasContent: boolean;
    analysis: {
      secure: boolean;
      reason: string;
    };
  }>;
  vulnerableCount?: number;
  secureCount?: number;
  totalChecked?: number;
  emailsFound?: number;
  // Mobile Usability specific fields
  content?: string;
  // Advanced SEO specific fields
  jsonLdFound?: number;
  microdataFound?: boolean;
  rdfaFound?: boolean;
  hasMetaRefresh?: boolean;
  nofollowLinksFound?: number;
  robotsContent?: string;
  hasNoindex?: boolean | null;
  // JavaScript Error specific fields
  jsErrors?: number;
  criticalErrors?: number;
  errorDetails?: Array<{
    type: string;
    text: string;
    stack: string;
    timestamp: number;
    category: string;
    isCritical: boolean;
  }>;
  jsError?: {
    passed: boolean;
    severity: string;
    status: string;
    criticalErrors: number;
    jsErrors: number;
    errorDetails: Array<{
      type: string;
      text: string;
      stack: string;
      timestamp: number;
      category: string;
      isCritical: boolean;
    }>;
  };
}

export interface CategoryResults {
  [auditKey: string]: AuditResult;
}

// Raw API response from external audit service
export interface WebsiteAuditApiResponse {
  url: string;
  seoAudit: {
    overallScore: number;
    totalTests: number;
    passedTests: number;
    categoryScores: WebsiteAuditCategoryScores;
    timestamp: string;
    results: {
      commonSeoIssues: CategoryResults;
      serverAndSecurity: CategoryResults;
      mobileUsability: CategoryResults;
      advancedSeo: CategoryResults;
    };
    auditSummary: {
      score: number;
      grade: string;
      status: string;
      categories: {
        commonSeo: { score: number; status: string };
        security: { score: number; status: string };
        mobile: { score: number; status: string };
        advanced: { score: number; status: string };
      };
    };
  };
  screenshot: string | null;
}

// Transformed SEO issue for frontend display
export interface TransformedSeoIssue {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  severity: 'high' | 'medium' | 'low';
  status: 'fail' | 'warning' | 'pass';
  statusText?: string;
  recommendation: string;
  howToFix?: string;
  bestPractices?: string[];
  note?: string;
  text?: string;
  length?: number;
  moreDetails: {
    // Keyword-related fields
    keywords?: KeywordUsageMap;
    frequency?: Record<string, number>;
    top10Keywords?: string[];
    multipleOccurrence?: Array<{ word: string; count: number }>;
    singleOccurrence?: Array<{ word: string; count: number }>;
    totalUniqueWords?: number;
    multipleOccurrenceCount?: number;
    singleOccurrenceCount?: number;

    // Meta tags
    openGraph?: Record<string, string>;
    twitter?: Record<string, string>;

    // Heading tags
    headings?: Record<string, string[]>;

    // Search preview
    desktop?: { url?: string; description?: string };
    mobile?: { url?: string; description?: string };

    // Image-related fields
    totalImages?: number;
    imagesWithAlt?: number;
    missingAlt?: number;
    responsiveImages?: number;
    imagesWithMissingAlt?: string[];
    imagesWithNonResponsive?: string[];
    responsiveTotalImages?: number;

    // Link-related fields
    totalLinks?: number;
    seoFriendlyLinks?: number;
    nonSeoFriendlyUrls?: string[];

    // Other fields
    charset?: string;
    deprecatedTags?: string[];
    emails?: string[];
    unsafeLinksFound?: number;

    // Server & Security specific fields
    canonicalUrl?: string | null;
    mixedContentFound?: number;
    detailedResults?: Array<{
      path: string;
      isDirectoryListing: boolean;
      hasContent: boolean;
      analysis: {
        secure: boolean;
        reason: string;
      };
    }>;
    vulnerableCount?: number;
    secureCount?: number;
    totalChecked?: number;
    emailsFound?: number;

    // Mobile Usability specific fields
    content?: string;

    // Advanced SEO specific fields
    jsonLdFound?: number;
    microdataFound?: boolean;
    rdfaFound?: boolean;
    hasMetaRefresh?: boolean;
    nofollowLinksFound?: number;
    robotsContent?: string;
    hasNoindex?: boolean | null;

    // JavaScript Error specific fields
    jsErrors?: number;
    criticalErrors?: number;
    errorDetails?: Array<{
      type: string;
      text: string;
      stack: string;
      timestamp: number;
      category: string;
      isCritical: boolean;
    }>;
    jsError?: {
      passed: boolean;
      severity: string;
      status: string;
      criticalErrors: number;
      jsErrors: number;
      errorDetails: Array<{
        type: string;
        text: string;
        stack: string;
        timestamp: number;
        category: string;
        isCritical: boolean;
      }>;
    };
  };
}

// Transformed SEO category for frontend display
export interface TransformedSeoCategory {
  name: string;
  score: number;
  failed: number;
  warnings: number;
  passed: number;
  issues: TransformedSeoIssue[];
}

// Final transformed response for frontend consumption
export interface TransformedWebsiteAuditResponse {
  overallScore: number;
  totalTests: number;
  passedTests: number;
  categoryScores: WebsiteAuditCategoryScores;
  url: string;
  timestamp: string;
  auditSummary: {
    score: number;
    grade: string;
    status: string;
    categories: {
      commonSeo: { score: number; status: string };
      security: { score: number; status: string };
      mobile: { score: number; status: string };
      advanced: { score: number; status: string };
    };
  };
  categories: {
    commonSeoIssues: TransformedSeoCategory;
    serverSecurity: TransformedSeoCategory;
    mobileUsability: TransformedSeoCategory;
    advancedSeo: TransformedSeoCategory;
  };
}

export type WebsiteAuditStoredResultData = TransformedWebsiteAuditResponse;

// Frontend component types (extended from backend types)
export interface SeoIssue extends TransformedSeoIssue {
  codeExample?: string;
  learnMoreUrl?: string;
  seoImpact?: string;
  passRate?: string;
  rawData?: {
    keywords?: Record<string, unknown>;
    [key: string]: unknown;
  };
  // moreDetails is inherited from TransformedSeoIssue, no need to redefine
}

export interface SeoCategory extends TransformedSeoCategory {
  issues: SeoIssue[];
  status?: string;
}

// Frontend audit results interface
export interface WebsiteAuditResults extends TransformedWebsiteAuditResponse {
  categories: {
    commonSeoIssues: SeoCategory;
    serverSecurity: SeoCategory;
    mobileUsability: SeoCategory;
    advancedSeo: SeoCategory;
  };
}

// Audit summary for summary cards
export interface AuditSummary {
  score: number;
  grade: string;
  status: string;
  categories: {
    commonSeo: { score: number; status: string };
    security: { score: number; status: string };
    mobile: { score: number; status: string };
    advanced: { score: number; status: string };
  };
}

// Category stats for summary cards
export interface CategoryStats {
  failed: number;
  warnings: number;
  passed: number;
}

// Props for audit summary card
export interface AuditSummaryCardProps {
  auditSummary: AuditSummary;
  categoryStats?: {
    commonSeo: CategoryStats;
    security: CategoryStats;
    mobile: CategoryStats;
    advanced: CategoryStats;
  };
  websiteUrl?: string;
}

// Props for category issue section
export interface CategoryIssueSectionProps {
  category: SeoCategory;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
  defaultExpanded?: boolean;
}
