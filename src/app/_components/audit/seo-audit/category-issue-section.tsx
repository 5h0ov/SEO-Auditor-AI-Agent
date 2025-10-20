import { Badge } from '@/app/_components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/app/_components/ui/collapsible';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/_components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/app/_components/ui/tooltip';
import { WordcloudChart } from '@/app/_components/ui/word-cloud';
import type {
  CategoryIssueSectionProps,
  KeywordOccurrence,
  KeywordUsage,
  KeywordUsageMap,
  SeoIssue,
} from '@/lib/types/website-audit';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Info,
  Lightbulb,
  Star,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

const formatTitle = (title: string): string => {
  let formattedTitle = title;

  const spacedFixes: Record<string, string> = {
    'H T M L': 'HTML',
    'C S S': 'CSS',
    'U R L': 'URL',
  };

  for (const [wrong, correct] of Object.entries(spacedFixes)) {
    formattedTitle = formattedTitle.replace(new RegExp(wrong, 'gi'), correct);
  }

  formattedTitle = formattedTitle
    .replace(/\bUrl\b/gi, 'URL')
    .replace(/\bSeo\b/gi, 'SEO')
    .replace(/\bJs\b/gi, 'JS')
    .replace(/\bSsl\b/gi, 'SSL')
    .replace(/\bHttp\b/gi, 'HTTP')
    .replace(/\bHttps\b/gi, 'HTTPS')
    .replace(/\bHttp2\b/gi, 'HTTP2')
    .replace(/\bHsts\b/gi, 'HSTS')
    .replace(/\bSpf\b/gi, 'SPF');
  return formattedTitle;
};

export const CategoryIssueSection = ({
  category,
  icon,
  color,
  defaultExpanded = false,
}: CategoryIssueSectionProps) => {
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);

  const toggleCategory = () => {
    setIsCategoryExpanded(!isCategoryExpanded);
  };

  const hasMeaningfulDetails = (moreDetails: SeoIssue['moreDetails']) => {
    if (!moreDetails) return false;

    if (moreDetails.top10Keywords && moreDetails.top10Keywords.length > 0)
      return true;
    if (moreDetails.keywords && Object.keys(moreDetails.keywords).length > 0)
      return true;
    if (
      moreDetails.multipleOccurrence &&
      moreDetails.multipleOccurrence.length > 0
    )
      return true;
    if (moreDetails.singleOccurrence && moreDetails.singleOccurrence.length > 0)
      return true;

    if (moreDetails.openGraph && Object.keys(moreDetails.openGraph).length > 0)
      return true;
    if (moreDetails.twitter && Object.keys(moreDetails.twitter).length > 0)
      return true;

    if (moreDetails.headings && Object.keys(moreDetails.headings).length > 0)
      return true;

    if (moreDetails.desktop || moreDetails.mobile) return true;

    if (moreDetails.totalImages !== undefined && moreDetails.totalImages > 0)
      return true;
    if (
      moreDetails.imagesWithAlt !== undefined &&
      moreDetails.imagesWithAlt > 0
    )
      return true;
    if (moreDetails.missingAlt !== undefined && moreDetails.missingAlt > 0)
      return true;
    if (
      moreDetails.responsiveImages !== undefined &&
      moreDetails.responsiveImages > 0
    )
      return true;

    if (moreDetails.deprecatedTags && moreDetails.deprecatedTags.length > 0)
      return true;

    // Check for unsafe links
    if (
      moreDetails.unsafeLinksFound !== undefined &&
      moreDetails.unsafeLinksFound > 0
    )
      return true;

    // Check for plaintext emails
    if (moreDetails.emails && moreDetails.emails.length > 0) return true;

    // Check for charset
    if (moreDetails.charset) return true;

    // Check for link-related details
    if (moreDetails.totalLinks !== undefined && moreDetails.totalLinks > 0)
      return true;
    if (
      moreDetails.seoFriendlyLinks !== undefined &&
      moreDetails.seoFriendlyLinks > 0
    )
      return true;

    // Check for server & security specific details
    if (moreDetails.canonicalUrl !== undefined) return true;
    if (
      moreDetails.mixedContentFound !== undefined &&
      moreDetails.mixedContentFound > 0
    )
      return true;
    if (moreDetails.detailedResults && moreDetails.detailedResults.length > 0)
      return true;
    if (
      moreDetails.vulnerableCount !== undefined &&
      moreDetails.vulnerableCount > 0
    )
      return true;
    if (moreDetails.secureCount !== undefined && moreDetails.secureCount > 0)
      return true;
    if (moreDetails.totalChecked !== undefined && moreDetails.totalChecked > 0)
      return true;
    if (moreDetails.emailsFound !== undefined && moreDetails.emailsFound > 0)
      return true;

    // Check for Mobile Usability
    if (moreDetails.content !== undefined) return true;

    // Check for Advanced SEO
    if (moreDetails.jsonLdFound !== undefined && moreDetails.jsonLdFound > 0)
      return true;
    if (moreDetails.microdataFound !== undefined) return true;
    if (moreDetails.rdfaFound !== undefined) return true;
    if (moreDetails.hasMetaRefresh !== undefined) return true;
    if (
      moreDetails.nofollowLinksFound !== undefined &&
      moreDetails.nofollowLinksFound > 0
    )
      return true;
    if (moreDetails.robotsContent !== undefined) return true;
    if (moreDetails.hasNoindex !== undefined) return true;

    if (moreDetails.jsErrors !== undefined && moreDetails.jsErrors > 0)
      return true;
    if (
      moreDetails.criticalErrors !== undefined &&
      moreDetails.criticalErrors > 0
    )
      return true;
    if (moreDetails.errorDetails && moreDetails.errorDetails.length > 0)
      return true;
    if (moreDetails.jsError) return true;

    return false;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return (
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
        );
      case 'warning':
        return (
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        );
      case 'fail':
        return (
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        );
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return (
          <Badge
            variant="outline"
            className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
          >
            ✅ Passed
          </Badge>
        );
      case 'warning':
        return (
          <Badge
            variant="outline"
            className="border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300"
          >
            ⚠️ Warning
          </Badge>
        );
      case 'fail':
        return (
          <Badge
            variant="destructive"
            className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
          >
            ❌ Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) {
      return 'text-green-600 dark:text-green-400';
    }
    if (score >= 50) {
      return 'text-yellow-600 dark:text-yellow-400';
    }
    return 'text-red-600 dark:text-red-400';
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return (
          <Badge variant="destructive" className="font-bold text-xs">
            🔥 HIGH
          </Badge>
        );
      case 'medium':
        return (
          <Badge
            variant="secondary"
            className="bg-orange-100 text-orange-800 text-xs dark:bg-orange-950 dark:text-orange-200"
          >
            🟡 MEDIUM
          </Badge>
        );
      case 'low':
        return (
          <Badge
            variant="outline"
            className="border-blue-200 bg-blue-50 text-blue-700 text-xs dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
          >
            🔵 LOW
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            Unknown
          </Badge>
        );
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          border: 'border-l-blue-500',
          bg: 'bg-blue-50/20 dark:bg-blue-950/20',
          text: 'text-blue-700 dark:text-blue-300',
          icon: 'text-blue-600 dark:text-blue-400',
          score: 'text-blue-600 dark:text-blue-400',
        };
      case 'green':
        return {
          border: 'border-l-green-500',
          bg: 'bg-green-50/20 dark:bg-green-950/20',
          text: 'text-green-700 dark:text-green-300',
          icon: 'text-green-600 dark:text-green-400',
          score: 'text-green-600 dark:text-green-400',
        };
      case 'purple':
        return {
          border: 'border-l-purple-500',
          bg: 'bg-purple-50/20 dark:bg-purple-950/20',
          text: 'text-purple-700 dark:text-purple-300',
          icon: 'text-purple-600 dark:text-purple-400',
          score: 'text-purple-600 dark:text-purple-400',
        };
      case 'orange':
        return {
          border: 'border-l-orange-500',
          bg: 'bg-orange-50/20 dark:bg-orange-950/20',
          text: 'text-orange-700 dark:text-orange-300',
          icon: 'text-orange-600 dark:text-orange-400',
          score: 'text-orange-600 dark:text-orange-400',
        };
      default:
        return {
          border: 'border-l-gray-500',
          bg: 'bg-gray-50/60 dark:bg-gray-950/20',
          text: 'text-gray-700 dark:text-gray-300',
          icon: 'text-gray-600 dark:text-gray-400',
          score: 'text-gray-600 dark:text-gray-400',
        };
    }
  };

  const colorClasses = getColorClasses(color);
  const totalIssues = category.issues.length;
  const passPercentage =
    totalIssues > 0 ? Math.round((category.passed / totalIssues) * 100) : 0;

  return (
    <Card
      id={category.name.toLowerCase().replace(/\s+/g, '-')}
      className={`transition-all duration-300 ${colorClasses.bg}`}
    >
      <Collapsible
        open={isCategoryExpanded}
        onOpenChange={setIsCategoryExpanded}
      >
        <CollapsibleTrigger className="w-full" onClick={toggleCategory}>
          <CardHeader
            className={cn(
              'cursor-pointer transition-all duration-200',
              isCategoryExpanded
                ? 'bg-opacity-100'
                : 'bg-opacity-60 hover:bg-opacity-80'
            )}
          >
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`rounded-full border-2 p-2 ${colorClasses.icon} border-current`}
                >
                  {icon}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className={`font-bold text-lg ${colorClasses.text}`}>
                      {category.name}
                    </h3>
                    {category.score >= 90 && (
                      <div className="flex animate-pulse">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Zap className="h-4 w-4 text-yellow-500" />
                      </div>
                    )}
                    {category.score >= 80 && category.score < 90 && (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div className="mt-1 flex items-center space-x-4 text-sm">
                    <span className="text-muted-foreground">
                      <strong>{passPercentage}%</strong> of {totalIssues} checks
                      passed
                    </span>
                  </div>
                  {!isCategoryExpanded && (
                    <div className="mt-2 flex flex-wrap items-center space-x-4 text-xs">
                      {category.failed > 0 && (
                        <div className="flex items-center space-x-1 rounded-md bg-red-50 px-2 py-1 text-red-700 dark:bg-red-950/50 dark:text-red-400">
                          <AlertCircle className="h-3 w-3" />
                          <span className="font-bold">{category.failed}</span>
                          <span>Failed</span>
                        </div>
                      )}
                      {category.warnings > 0 && (
                        <div className="flex items-center space-x-1 rounded-md bg-yellow-50 px-2 py-1 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400">
                          <AlertTriangle className="h-3 w-3" />
                          <span className="font-bold">{category.warnings}</span>
                          <span>Warnings</span>
                        </div>
                      )}
                      {category.passed > 0 && (
                        <div className="flex items-center space-x-1 rounded-md bg-green-50 px-2 py-1 text-green-700 dark:bg-green-950/50 dark:text-green-400">
                          <CheckCircle2 className="h-3 w-3" />
                          <span className="font-bold">{category.passed}</span>
                          <span>Passed</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div
                    className={`font-bold text-3xl ${getScoreColor(category.score)}`}
                  >
                    {category.score}
                  </div>
                  <div className="text-muted-foreground text-sm">Score</div>
                </div>
                <div className="flex items-center space-x-2">
                  <ChevronDown
                    className={cn(
                      'h-6 w-6 transition-transform duration-200 ease-out',
                      isCategoryExpanded
                        ? 'rotate-0 text-primary'
                        : '-rotate-90 text-muted-foreground'
                    )}
                  />
                </div>
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-6 pt-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1 text-center">
                <div className="flex items-center justify-center space-x-1">
                  <span className="font-bold text-2xl text-red-600 dark:text-red-400">
                    {category.failed}
                  </span>
                </div>
                <p className="font-medium text-red-600 text-xs dark:text-red-400">
                  Failed
                </p>
              </div>

              <div className="space-y-1 text-center">
                <div className="flex items-center justify-center space-x-1">
                  <span className="font-bold text-2xl text-yellow-600 dark:text-yellow-400">
                    {category.warnings}
                  </span>
                </div>
                <p className="font-medium text-xs text-yellow-600 dark:text-yellow-400">
                  Warnings
                </p>
              </div>

              <div className="space-y-1 text-center">
                <div className="flex items-center justify-center space-x-1">
                  <span className="font-bold text-2xl text-green-600 dark:text-green-400">
                    {category.passed}
                  </span>
                </div>
                <p className="font-medium text-green-600 text-xs dark:text-green-400">
                  Passed
                </p>
              </div>
            </div>

            {/* Issues List */}
            <div className="space-y-3">
              {category.issues.map((issue: SeoIssue, index: number) => (
                <Card
                  key={index}
                  id={issue.title.replace(/\s+/g, '')}
                  className="border border-muted-foreground/20 bg-muted/10 transition-all duration-200 hover:shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row">
                    <CardHeader className="w-full border-muted-foreground/20 border-r pb-3 sm:w-1/3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(issue.status)}
                            <h5 className="font-semibold text-sm">
                              {formatTitle(issue.title)}
                            </h5>
                            {issue.note && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div>
                                      <Info className="h-4 w-4 text-blue-500" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{issue.note}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          <div className="mt-2 flex items-center space-x-2">
                            {/* Show status badges */}
                            {(issue.status === 'fail' ||
                              issue.status === 'warning') &&
                              getStatusBadge(issue.status)}
                            {issue.status === 'pass' &&
                              getStatusBadge(issue.status)}
                            {getSeverityBadge(issue.severity)}
                            {issue.passRate && (
                              <Badge variant="outline" className="text-xs">
                                {issue.passRate} of top 100 sites passed
                              </Badge>
                            )}
                          </div>

                          <div className="mt-4">
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {issue.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 space-y-4 p-4">
                      {/* Best Practices Popover - Top Right */}
                      {issue.bestPractices &&
                        issue.bestPractices.length > 0 && (
                          <div className="flex justify-end">
                            <Popover>
                              <PopoverTrigger asChild>
                                <div className="flex cursor-pointer items-center space-x-1 text-muted-foreground hover:text-foreground">
                                  <Info className="h-4 w-4" />
                                  <span className="text-xs">
                                    Best Practices
                                  </span>
                                </div>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-80"
                                side="top"
                                align="end"
                              >
                                <div className="space-y-2">
                                  <h6 className="font-semibold text-sm">
                                    Best Practices
                                  </h6>
                                  <ul className="list-disc space-y-1 pl-4 text-sm">
                                    {issue.bestPractices.map(
                                      (practice, idx) => (
                                        <li key={idx}>{practice}</li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        )}

                      {/* Description */}
                      {/* <div>
                        <div className="mb-2 flex items-center space-x-2">
                          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <h6 className="font-semibold text-sm">
                            What this means
                          </h6>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {issue.description}
                        </p>
                      </div> */}

                      {/* Status */}
                      <div>
                        <div className="mb-2 flex items-center space-x-2">
                          <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          <h6 className="font-semibold text-sm">Status</h6>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {issue.statusText ||
                            issue.howToFix ||
                            issue.recommendation}
                        </p>
                      </div>

                      {/* Code Example */}
                      {issue.codeExample && (
                        <div>
                          <h6 className="mb-2 font-semibold text-sm">
                            Example
                          </h6>
                          <div className="rounded-md bg-black p-3 font-mono text-green-400 text-xs">
                            <code>{issue.codeExample}</code>
                          </div>
                        </div>
                      )}

                      {/* Meta Title/Description Content Details */}
                      {(issue.text !== undefined ||
                        issue.length !== undefined) && (
                        <div className="mb-4">
                          <h6 className="mb-2 font-medium text-muted-foreground text-sm">
                            Content Details
                          </h6>
                          <div className="space-y-2 rounded-lg border p-3">
                            {issue.text !== undefined && (
                              <div>
                                <span className="font-medium text-sm">
                                  Text:
                                </span>
                                <div className="mt-1 rounded bg-muted p-2 font-mono text-sm">
                                  {issue.text || 'No text found'}
                                </div>
                              </div>
                            )}
                            {issue.length !== undefined && (
                              <div className="text-muted-foreground text-sm">
                                Length: {issue.length} characters
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* More Details */}
                      {hasMeaningfulDetails(issue.moreDetails) && (
                        <div>
                          <h6 className="mb-3 font-semibold text-sm">
                            Additional Details
                          </h6>

                          {/* Most Common Keywords */}
                          {issue.moreDetails?.top10Keywords &&
                            issue.moreDetails.top10Keywords.length > 0 && (
                              <div className="mb-4">
                                <h6 className="mb-2 font-medium text-muted-foreground text-sm">
                                  Most Common Keywords
                                </h6>
                                <div className="flex flex-wrap gap-2">
                                  {issue.moreDetails.top10Keywords.map(
                                    (keyword: string, index: number) => {
                                      const frequency =
                                        issue.moreDetails?.frequency?.[
                                          keyword
                                        ] || 0;
                                      return (
                                        <TooltipProvider key={index}>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <span className="cursor-help rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm">
                                                {keyword} ({frequency})
                                              </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>
                                                Found {frequency} time
                                                {frequency > 1 ? 's' : ''}
                                              </p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      );
                                    }
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Keyword Usage Table */}
                          {issue.moreDetails?.keywords &&
                            issue.title
                              .toLowerCase()
                              .includes('keyword usage') && (
                              <div className="mb-4">
                                <h6 className="mb-2 font-medium text-muted-foreground text-sm">
                                  Keyword Usage Analysis
                                </h6>
                                <div className="overflow-x-auto">
                                  <table className="w-full border-collapse text-sm">
                                    <thead>
                                      <tr className="border-b">
                                        <th className="p-2 text-left font-medium">
                                          Keyword
                                        </th>
                                        <th className="p-2 text-center font-medium">
                                          In Title
                                        </th>
                                        <th className="p-2 text-center font-medium">
                                          In Meta Description
                                        </th>
                                        <th className="p-2 text-center font-medium">
                                          In Headings
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {Object.entries(
                                        (issue.moreDetails
                                          ?.keywords as KeywordUsageMap) || {}
                                      ).map(
                                        ([keyword, usage]: [
                                          string,
                                          KeywordUsage,
                                        ]) => (
                                          <tr
                                            key={keyword}
                                            className="border-b"
                                          >
                                            <td className="p-2 font-mono">
                                              {keyword}
                                            </td>
                                            <td className="p-2 text-center">
                                              {usage.inTitle ? (
                                                <span className="text-green-600">
                                                  ✓
                                                </span>
                                              ) : (
                                                <span className="text-red-600">
                                                  ✗
                                                </span>
                                              )}
                                            </td>
                                            <td className="p-2 text-center">
                                              {usage.inMetaDescription ? (
                                                <span className="text-green-600">
                                                  ✓
                                                </span>
                                              ) : (
                                                <span className="text-red-600">
                                                  ✗
                                                </span>
                                              )}
                                            </td>
                                            <td className="p-2 text-center">
                                              {usage.inHeadings ? (
                                                <span className="text-green-600">
                                                  ✓
                                                </span>
                                              ) : (
                                                <span className="text-red-600">
                                                  ✗
                                                </span>
                                              )}
                                            </td>
                                          </tr>
                                        )
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                          {/* Keyword Cloud */}
                          {issue.moreDetails?.multipleOccurrence && (
                            <div className="mb-4">
                              <h6 className="mb-2 font-medium text-muted-foreground text-sm">
                                Keyword Cloud
                              </h6>
                              {/* Keyword Statistics */}
                              {(issue.moreDetails.totalUniqueWords !==
                                undefined ||
                                issue.moreDetails.multipleOccurrenceCount !==
                                  undefined ||
                                issue.moreDetails.singleOccurrenceCount !==
                                  undefined) && (
                                <div className="mb-3 space-y-1 rounded-lg border p-3 text-sm">
                                  {issue.moreDetails.totalUniqueWords !==
                                    undefined && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">
                                        Total Unique Words:
                                      </span>
                                      <span className="font-medium">
                                        {issue.moreDetails.totalUniqueWords}
                                      </span>
                                    </div>
                                  )}
                                  {typeof issue.moreDetails
                                    .multipleOccurrenceCount === 'number' && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">
                                        Multiple Occurrence Words:
                                      </span>
                                      <span className="font-medium">
                                        {
                                          issue.moreDetails
                                            .multipleOccurrenceCount
                                        }
                                      </span>
                                    </div>
                                  )}
                                  {typeof issue.moreDetails
                                    .singleOccurrenceCount === 'number' && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">
                                        Single Occurrence Words:
                                      </span>
                                      <span className="font-medium">
                                        {
                                          issue.moreDetails
                                            .singleOccurrenceCount
                                        }
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Word Cloud Component */}
                              <div className="rounded-lg bg-muted/30">
                                {(() => {
                                  const multipleOccurrence =
                                    issue.moreDetails.multipleOccurrence?.map(
                                      (item: KeywordOccurrence) => ({
                                        text: item.word,
                                        value: item.count,
                                      })
                                    ) || [];

                                  let finalWords = multipleOccurrence;
                                  if (
                                    multipleOccurrence.length < 25 &&
                                    issue.moreDetails.singleOccurrence
                                  ) {
                                    const singleOccurrence =
                                      issue.moreDetails.singleOccurrence
                                        .slice(
                                          0,
                                          30 - multipleOccurrence.length
                                        )
                                        .map((item: KeywordOccurrence) => ({
                                          text: item.word,
                                          value: item.count,
                                        }));
                                    finalWords = [
                                      ...multipleOccurrence,
                                      ...singleOccurrence,
                                    ];
                                  }

                                  if (finalWords.length === 0) {
                                    return null;
                                  }

                                  return (
                                    <>
                                      {/*
                                      <div className="mb-2 text-muted-foreground text-xs">
                                        Debug: {finalWords.length} words in
                                        cloud ({multipleOccurrence.length}{' '}
                                        multiple +{' '}
                                        {finalWords.length - multipleOccurrence.length}{' '}
                                        single)
                                        <br />
                                        Multiple words:{' '}
                                        {multipleOccurrence
                                          .map((w: {text: string, value: number}) => `${w.text}(${w.value})`)
                                          .join(', ')}
                                      </div>
                                      */}
                                      <WordcloudChart
                                        width={500}
                                        height={300}
                                        words={finalWords}
                                        showTooltips={true}
                                        tooltipFormatter={(word) =>
                                          `Found ${word.value} time${word.value > 1 ? 's' : ''}`
                                        }
                                      />
                                    </>
                                  );
                                })()}
                              </div>

                              {/* Show single occurrences only if multiple occurrences are less than 20 */}
                              {/* {issue.moreDetails?.singleOccurrence &&
                                issue.moreDetails.multipleOccurrence.length <
                                  20 &&
                                (
                                  issue.moreDetails
                                    .singleOccurrence as KeywordOccurrence[]
                                ).length > 0 && (
                                  <div className="mt-3 border-t pt-3">
                                    <h6 className="mb-2 font-medium text-muted-foreground text-sm">
                                      Single Occurrence Keywords
                                    </h6>
                                    <div className="flex flex-wrap gap-1">
                                      {(
                                        issue.moreDetails
                                          .singleOccurrence as KeywordOccurrence[]
                                      )
                                        .slice(0, 30)
                                        .map((item, index) => (
                                          <TooltipProvider
                                            key={index}
                                            delayDuration={0}
                                          >
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <span className="cursor-help rounded bg-muted px-2 py-1 text-muted-foreground text-xs">
                                                  {item.word}
                                                </span>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>
                                                  Found {item.count} time
                                                  {item.count > 1 ? 's' : ''}
                                                </p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        ))}
                                      {(
                                        issue.moreDetails
                                          .singleOccurrence as KeywordOccurrence[]
                                      ).length > 20 && (
                                        <span className="text-muted-foreground text-xs">
                                          +
                                          {(
                                            issue.moreDetails
                                              .singleOccurrence as KeywordOccurrence[]
                                          ).length - 20}{' '}
                                          more
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )} */}
                            </div>
                          )}

                          {/* Social Media Tags Table - Only show if there are actual tags */}
                          {(issue.status === 'fail' ||
                            issue.status === 'warning') &&
                            ((issue.moreDetails?.openGraph &&
                              Object.keys(issue.moreDetails.openGraph).length >
                                0) ||
                              (issue.moreDetails?.twitter &&
                                Object.keys(issue.moreDetails.twitter).length >
                                  0)) && (
                              <div className="mb-4">
                                <h6 className="mb-2 font-medium text-muted-foreground text-sm">
                                  Social Media Tags
                                </h6>
                                <div className="overflow-x-auto">
                                  <table className="w-full border-collapse text-sm">
                                    <thead>
                                      <tr className="border-b">
                                        <th className="p-2 text-left font-medium">
                                          Property
                                        </th>
                                        <th className="p-2 text-left font-medium">
                                          Value
                                        </th>
                                        <th className="p-2 text-left font-medium">
                                          Platform
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {/* Open Graph Tags */}
                                      {issue.moreDetails?.openGraph &&
                                        Object.entries(
                                          issue.moreDetails.openGraph as Record<
                                            string,
                                            string
                                          >
                                        ).map(([key, value]) => (
                                          <tr
                                            key={`og-${key}`}
                                            className="border-b"
                                          >
                                            <td className="p-2 font-mono text-muted-foreground">
                                              og:{key}
                                            </td>
                                            <td className="break-all p-2 font-mono">
                                              {String(value)}
                                            </td>
                                            <td className="p-2">
                                              <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-700 text-xs dark:bg-blue-950 dark:text-blue-300">
                                                Facebook
                                              </span>
                                            </td>
                                          </tr>
                                        ))}

                                      {/* Twitter Tags */}
                                      {issue.moreDetails?.twitter &&
                                        Object.entries(
                                          issue.moreDetails.twitter as Record<
                                            string,
                                            string
                                          >
                                        ).map(([key, value]) => (
                                          <tr
                                            key={`twitter-${key}`}
                                            className="border-b"
                                          >
                                            <td className="p-2 font-mono text-muted-foreground">
                                              twitter:{key}
                                            </td>
                                            <td className="break-all p-2 font-mono">
                                              {String(value)}
                                            </td>
                                            <td className="p-2">
                                              <span className="rounded-full bg-sky-100 px-2 py-1 text-sky-700 text-xs dark:bg-sky-950 dark:text-sky-300">
                                                Twitter
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                          {/* Heading Tags Table */}
                          {issue.moreDetails?.headings && (
                            <div className="mb-4">
                              <h6 className="mb-2 font-medium text-muted-foreground text-sm">
                                Heading Tags Structure
                              </h6>
                              <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-sm">
                                  <thead>
                                    <tr className="border-b">
                                      <th className="p-2 text-left font-medium">
                                        Tag
                                      </th>
                                      <th className="p-2 text-left font-medium">
                                        Count
                                      </th>
                                      <th className="p-2 text-left font-medium">
                                        Content
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {Object.entries(
                                      issue.moreDetails.headings as Record<
                                        string,
                                        string[]
                                      >
                                    ).map(([tag, content]) => (
                                      <tr key={tag} className="border-b">
                                        <td className="p-2 font-medium font-mono uppercase">
                                          {tag}
                                        </td>
                                        <td className="p-2">
                                          {Array.isArray(content)
                                            ? content.length
                                            : 0}
                                        </td>
                                        <td className="p-2">
                                          {Array.isArray(content) &&
                                          content.length > 0 ? (
                                            <div className="space-y-1">
                                              {content.map(
                                                (
                                                  text: string,
                                                  index: number
                                                ) => (
                                                  <div
                                                    key={index}
                                                    className="rounded bg-muted px-2 py-1 text-xs"
                                                  >
                                                    {text}
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          ) : (
                                            <span className="text-muted-foreground">
                                              No {tag} tags found
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* Search Preview */}
                          {(issue.moreDetails?.desktop ||
                            issue.moreDetails?.mobile) && (
                            <div className="mb-4 space-y-6">
                              {/* Desktop Preview */}
                              {issue.moreDetails?.desktop && (
                                <div>
                                  <div className="mb-2 font-medium text-muted-foreground text-sm">
                                    Desktop version
                                  </div>
                                  <div className="rounded-lg border bg-muted/30 p-4">
                                    <div className="space-y-1">
                                      <div className="text-emerald-700 text-sm dark:text-emerald-400">
                                        {(
                                          issue.moreDetails.desktop as {
                                            url?: string;
                                          }
                                        ).url || 'website-url.com'}
                                      </div>
                                      <div className="font-medium text-blue-600 text-lg dark:text-blue-400">
                                        {(
                                          issue.moreDetails.desktop as {
                                            title?: string;
                                          }
                                        ).title ||
                                          issue.text ||
                                          'Website Title'}
                                      </div>
                                      <div className="text-muted-foreground text-sm">
                                        {(
                                          issue.moreDetails.desktop as {
                                            description?: string;
                                          }
                                        ).description || ''}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Mobile Preview */}
                              {issue.moreDetails?.mobile && (
                                <div className="flex flex-col">
                                  <div className="mb-2 font-medium text-muted-foreground text-sm">
                                    Mobile version
                                  </div>
                                  <div className="w-full max-w-[350px] rounded-lg border bg-muted/30 p-4">
                                    <div className="space-y-1">
                                      <div className="text-emerald-700 text-xs dark:text-emerald-400">
                                        {(
                                          issue.moreDetails.mobile as {
                                            url?: string;
                                          }
                                        ).url || 'website-url.com'}
                                      </div>
                                      <div className="font-medium text-base text-blue-600 dark:text-blue-400">
                                        {(
                                          issue.moreDetails.mobile as {
                                            title?: string;
                                          }
                                        ).title ||
                                          issue.text ||
                                          'Website Title'}
                                      </div>
                                      <div className="text-muted-foreground text-xs">
                                        {(
                                          issue.moreDetails.mobile as {
                                            description?: string;
                                          }
                                        ).description || ''}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Image Alt Text Details */}
                          {(issue.moreDetails?.imagesWithAlt !== undefined ||
                            issue.moreDetails?.missingAlt !== undefined ||
                            issue.moreDetails?.imagesWithMissingAlt !==
                              undefined) && (
                            <div className="mb-4">
                              <h6 className="mb-2 font-medium text-muted-foreground text-sm">
                                Image Alt Text Analysis
                              </h6>
                              <div className="space-y-2 rounded-lg border p-3">
                                {issue.moreDetails.totalImages !==
                                  undefined && (
                                  <div className="flex justify-between">
                                    <span className="text-sm">
                                      Total Images:
                                    </span>
                                    <span className="font-medium text-sm">
                                      {issue.moreDetails.totalImages}
                                    </span>
                                  </div>
                                )}
                                {issue.moreDetails.imagesWithAlt !==
                                  undefined && (
                                  <div className="flex justify-between">
                                    <span className="text-sm">
                                      Images with Alt Text:
                                    </span>
                                    <span className="font-medium text-sm">
                                      {issue.moreDetails.imagesWithAlt}
                                    </span>
                                  </div>
                                )}
                                {issue.moreDetails.missingAlt !== undefined && (
                                  <div className="flex justify-between">
                                    <span className="text-sm">
                                      Missing Alt Text:
                                    </span>
                                    <span className="font-medium text-sm">
                                      {issue.moreDetails.missingAlt}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Images with Missing Alt Text */}
                              {issue.moreDetails?.imagesWithMissingAlt &&
                                issue.moreDetails.imagesWithMissingAlt.length >
                                  0 && (
                                  <div className="mt-4">
                                    <h6 className="mb-2 font-medium text-muted-foreground text-sm">
                                      Images with Missing Alt Text
                                    </h6>
                                    <div className="space-y-4 rounded-lg border p-3">
                                      {issue.moreDetails.imagesWithMissingAlt.map(
                                        (imageSrc, index) => (
                                          <div
                                            key={index}
                                            className="space-y-2"
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className="text-muted-foreground text-sm">
                                                {index + 1}.
                                              </span>
                                              <code className="break-all rounded bg-muted px-1 py-0.5 text-xs">
                                                {imageSrc}
                                              </code>
                                            </div>
                                            <div className="ml-4">
                                              <img
                                                src={imageSrc}
                                                alt=""
                                                className="max-h-32 max-w-full rounded border object-contain"
                                                onError={(e) => {
                                                  const target =
                                                    e.target as HTMLImageElement;
                                                  target.style.display = 'none';
                                                }}
                                              />
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          )}

                          {/* Responsive Images Details */}
                          {(issue.moreDetails?.responsiveImages !== undefined ||
                            issue.moreDetails?.imagesWithNonResponsive !==
                              undefined) && (
                            <div className="mb-4">
                              <h6 className="mb-2 font-medium text-muted-foreground text-sm">
                                Responsive Images Analysis
                              </h6>
                              <div className="space-y-2 rounded-lg border p-3">
                                {issue.moreDetails.responsiveTotalImages !==
                                  undefined && (
                                  <div className="flex justify-between">
                                    <span className="text-sm">
                                      Total Images:
                                    </span>
                                    <span className="font-medium text-sm">
                                      {issue.moreDetails.responsiveTotalImages}
                                    </span>
                                  </div>
                                )}
                                {issue.moreDetails.responsiveImages !==
                                  undefined && (
                                  <div className="flex justify-between">
                                    <span className="text-sm">
                                      Responsive Images:
                                    </span>
                                    <span className="font-medium text-sm">
                                      {issue.moreDetails.responsiveImages}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Images that Should be Responsive */}
                              {issue.moreDetails?.imagesWithNonResponsive &&
                                issue.moreDetails.imagesWithNonResponsive
                                  .length > 0 && (
                                  <div className="mt-4">
                                    <h6 className="mb-2 font-medium text-muted-foreground text-sm">
                                      Images that Should be Responsive
                                    </h6>
                                    <div className="space-y-4 rounded-lg border p-3">
                                      {issue.moreDetails.imagesWithNonResponsive.map(
                                        (imageSrc, index) => (
                                          <div
                                            key={index}
                                            className="space-y-2"
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className="text-muted-foreground text-sm">
                                                {index + 1}.
                                              </span>
                                              <code className="break-all rounded bg-muted px-1 py-0.5 text-xs">
                                                {imageSrc}
                                              </code>
                                            </div>
                                            <div className="ml-4">
                                              <img
                                                src={imageSrc}
                                                alt=""
                                                className="max-h-32 max-w-full rounded border object-contain"
                                                onError={(e) => {
                                                  const target =
                                                    e.target as HTMLImageElement;
                                                  target.style.display = 'none';
                                                }}
                                              />
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          )}

                          {/* Deprecated HTML Tags */}
                          {issue.moreDetails?.deprecatedTags &&
                            Array.isArray(issue.moreDetails.deprecatedTags) &&
                            issue.moreDetails.deprecatedTags.length > 0 && (
                              <div className="mb-4">
                                <h6 className="mb-2 font-medium text-muted-foreground text-sm">
                                  Deprecated HTML Tags Found
                                </h6>
                                <div className="space-y-2 rounded-lg border p-3">
                                  <div className="text-sm">
                                    <span className="font-medium text-red-600">
                                      Found{' '}
                                      {issue.moreDetails.deprecatedTags.length}{' '}
                                      deprecated tag(s):
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {issue.moreDetails.deprecatedTags.map(
                                      (tag, index) => (
                                        <span
                                          key={index}
                                          className="rounded bg-red-100 px-2 py-1 font-mono text-red-700 text-xs dark:bg-red-950 dark:text-red-300"
                                        >
                                          &lt;{tag}&gt;
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                          {/* Unsafe Cross-Origin Links */}
                          {issue.moreDetails?.unsafeLinksFound !== undefined &&
                            issue.moreDetails.unsafeLinksFound > 0 && (
                              <div className="mb-4">
                                <h6 className="mb-2 font-medium text-muted-foreground text-sm">
                                  Unsafe Cross-Origin Links Found
                                </h6>
                                <div className="space-y-2 rounded-lg border p-3">
                                  <div className="text-sm">
                                    <span className="font-medium text-red-600">
                                      Found {issue.moreDetails.unsafeLinksFound}{' '}
                                      unsafe link(s) without proper rel
                                      attributes.
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                          {/* Plaintext Emails */}
                          {issue.moreDetails?.emails &&
                            Array.isArray(issue.moreDetails.emails) &&
                            issue.moreDetails.emails.length > 0 && (
                              <div className="mb-4">
                                <h6 className="mb-2 font-medium text-muted-foreground text-sm">
                                  Plaintext Emails Found
                                </h6>
                                <div className="space-y-2 rounded-lg border p-3">
                                  <div className="text-sm">
                                    <span className="font-medium text-red-600">
                                      Found {issue.moreDetails.emails.length}{' '}
                                      plaintext email(s):
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {issue.moreDetails.emails.map(
                                      (email, index) => (
                                        <span
                                          key={index}
                                          className="rounded bg-red-100 px-2 py-1 font-mono text-red-700 text-xs dark:bg-red-950 dark:text-red-300"
                                        >
                                          {email}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                          {/* Character Encoding Details */}
                          {issue.moreDetails?.charset && (
                            <div className="mb-4">
                              <h6 className="mb-2 font-medium text-muted-foreground text-sm">
                                Character Encoding
                              </h6>
                              <div className="space-y-2 rounded-lg border p-3">
                                <div className="flex justify-between">
                                  <span className="text-sm">Charset:</span>
                                  <span className="font-medium font-mono text-sm">
                                    {issue.moreDetails.charset}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* SEO Friendly URLs Details */}
                          {issue.moreDetails?.totalLinks !== undefined && (
                            <div className="mb-4">
                              <h6 className="mb-2 font-medium text-muted-foreground text-sm">
                                SEO Friendly URLs Analysis
                              </h6>
                              <div className="space-y-2 rounded-lg border p-3">
                                <div className="flex justify-between">
                                  <span className="text-sm">Total Links:</span>
                                  <span className="font-medium text-sm">
                                    {issue.moreDetails.totalLinks}
                                  </span>
                                </div>
                                {issue.moreDetails.seoFriendlyLinks !==
                                  undefined && (
                                  <div className="flex justify-between">
                                    <span className="text-sm">
                                      SEO Friendly Links:
                                    </span>
                                    <span className="font-medium text-sm">
                                      {issue.moreDetails.seoFriendlyLinks}
                                    </span>
                                  </div>
                                )}

                                {/* Non SEO Friendly URLs */}
                                {issue.moreDetails?.nonSeoFriendlyUrls &&
                                  issue.moreDetails.nonSeoFriendlyUrls.length >
                                    0 &&
                                  issue.moreDetails.seoFriendlyLinks !==
                                    undefined &&
                                  issue.moreDetails.totalLinks !== undefined &&
                                  issue.moreDetails.seoFriendlyLinks <
                                    issue.moreDetails.totalLinks && (
                                    <div className="mt-4">
                                      <h6 className="mb-2 font-medium text-muted-foreground text-sm">
                                        Non SEO Friendly URLs
                                      </h6>
                                      <div className="space-y-2 rounded-lg border p-3">
                                        {issue.moreDetails.nonSeoFriendlyUrls.map(
                                          (url, index) => (
                                            <div
                                              key={index}
                                              className="break-all text-sm"
                                            >
                                              <span className="text-muted-foreground">
                                                {index + 1}.
                                              </span>{' '}
                                              <a
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 hover:underline"
                                              >
                                                {url}
                                              </a>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                          )}

                          {/* Canonical URL Details */}
                          {issue.moreDetails?.canonicalUrl !== undefined && (
                            <div className="mb-4">
                              <h6 className="mb-2 font-medium text-muted-foreground text-sm">
                                Canonical URL
                              </h6>
                              <div className="space-y-2 rounded-lg border p-3">
                                <div className="text-sm">
                                  <span className="font-medium">
                                    Canonical URL:
                                  </span>
                                  <div className="mt-1 rounded bg-muted p-2 font-mono text-sm">
                                    {issue.moreDetails.canonicalUrl ||
                                      'No canonical URL found'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Mixed Content Details */}
                          {issue.moreDetails?.mixedContentFound !==
                            undefined && (
                            <div className="mb-4">
                              <h6 className="mb-2 font-medium text-muted-foreground text-sm">
                                Mixed Content Analysis
                              </h6>
                              <div className="space-y-2 rounded-lg border p-3">
                                <div className="flex justify-between">
                                  <span className="text-sm">
                                    Mixed Content Found:
                                  </span>
                                  <span className="font-medium text-sm">
                                    {issue.moreDetails.mixedContentFound}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Directory Browsing Details */}
                          {issue.moreDetails?.detailedResults && (
                            <div className="mb-4">
                              <h6 className="mb-2 font-medium text-muted-foreground text-sm">
                                Directory Browsing Analysis
                              </h6>
                              <div className="space-y-2 rounded-lg border p-3">
                                {/* Summary Statistics */}
                                {(issue.moreDetails.vulnerableCount !==
                                  undefined ||
                                  issue.moreDetails.secureCount !== undefined ||
                                  issue.moreDetails.totalChecked !==
                                    undefined) && (
                                  <div className="mb-3 space-y-1 text-sm">
                                    {issue.moreDetails.vulnerableCount !==
                                      undefined && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Vulnerable Paths:
                                        </span>
                                        <span className="font-medium text-red-600">
                                          {issue.moreDetails.vulnerableCount}
                                        </span>
                                      </div>
                                    )}
                                    {issue.moreDetails.secureCount !==
                                      undefined && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Secure Paths:
                                        </span>
                                        <span className="font-medium text-green-600">
                                          {issue.moreDetails.secureCount}
                                        </span>
                                      </div>
                                    )}
                                    {issue.moreDetails.totalChecked !==
                                      undefined && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Total Checked:
                                        </span>
                                        <span className="font-medium">
                                          {issue.moreDetails.totalChecked}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Detailed Results */}
                                <div className="space-y-2">
                                  <h6 className="font-medium text-sm">
                                    Detailed Results:
                                  </h6>
                                  {issue.moreDetails.detailedResults.map(
                                    (result, index) => (
                                      <div
                                        key={index}
                                        className="rounded border p-2 text-sm"
                                      >
                                        <div className="flex items-start justify-between">
                                          <span className="font-mono text-primary">
                                            {result.path}
                                          </span>
                                          <span
                                            className={`ml-2 rounded px-2 py-1 font-medium text-xs ${
                                              result.analysis.secure
                                                ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                                                : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                            }`}
                                          >
                                            {result.analysis.secure
                                              ? 'Secure'
                                              : 'Vulnerable'}
                                          </span>
                                        </div>
                                        <div className="mt-1 text-muted-foreground text-xs">
                                          {result.analysis.reason}
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Plaintext Emails Count */}
                          {issue.moreDetails?.emailsFound !== undefined && (
                            <div className="mb-4">
                              <h6 className="mb-2 font-medium text-muted-foreground text-sm">
                                Plaintext Emails Analysis
                              </h6>
                              <div className="space-y-2 rounded-lg border p-3">
                                <div className="flex justify-between">
                                  <span className="text-sm">Emails Found:</span>
                                  <span className="font-medium text-sm">
                                    {issue.moreDetails.emailsFound}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Meta Viewport Content */}
                          {issue.moreDetails?.content !== undefined && (
                            <div className="mb-4">
                              <h6 className="mb-2 font-medium text-muted-foreground text-sm">
                                Meta Viewport Content
                              </h6>
                              <div className="space-y-2 rounded-lg border p-3">
                                <div className="text-sm">
                                  <span className="font-medium">
                                    Viewport Content:
                                  </span>
                                  <div className="mt-1 rounded bg-muted p-2 font-mono text-sm">
                                    {issue.moreDetails.content ||
                                      'No viewport content found'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Structured Data Analysis */}
                          {(issue.moreDetails?.jsonLdFound !== undefined ||
                            issue.moreDetails?.microdataFound !== undefined ||
                            issue.moreDetails?.rdfaFound !== undefined) && (
                            <div className="mb-4">
                              <h6 className="mb-2 font-medium text-muted-foreground text-sm">
                                Structured Data Analysis
                              </h6>
                              <div className="space-y-2 rounded-lg border p-3">
                                {issue.moreDetails?.jsonLdFound !==
                                  undefined && (
                                  <div className="flex justify-between">
                                    <span className="text-sm">
                                      JSON-LD Found:
                                    </span>
                                    <span className="font-medium text-sm">
                                      {issue.moreDetails.jsonLdFound}
                                    </span>
                                  </div>
                                )}
                                {issue.moreDetails?.microdataFound !==
                                  undefined && (
                                  <div className="flex justify-between">
                                    <span className="text-sm">
                                      Microdata Found:
                                    </span>
                                    <span className="font-medium text-sm">
                                      {issue.moreDetails.microdataFound
                                        ? 'Yes'
                                        : 'No'}
                                    </span>
                                  </div>
                                )}
                                {issue.moreDetails?.rdfaFound !== undefined && (
                                  <div className="flex justify-between">
                                    <span className="text-sm">RDFa Found:</span>
                                    <span className="font-medium text-sm">
                                      {issue.moreDetails.rdfaFound
                                        ? 'Yes'
                                        : 'No'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Meta Refresh Analysis */}
                          {issue.moreDetails?.hasMetaRefresh !== undefined && (
                            <div className="mb-4">
                              <h6 className="mb-2 font-medium text-muted-foreground text-sm">
                                Meta Refresh Analysis
                              </h6>
                              <div className="space-y-2 rounded-lg border p-3">
                                <div className="flex justify-between">
                                  <span className="text-sm">
                                    Meta Refresh Found:
                                  </span>
                                  <span className="font-medium text-sm">
                                    {issue.moreDetails.hasMetaRefresh
                                      ? 'Yes'
                                      : 'No'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Nofollow Links Analysis */}
                          {issue.moreDetails?.nofollowLinksFound !==
                            undefined && (
                            <div className="mb-4">
                              <h6 className="mb-2 font-medium text-muted-foreground text-sm">
                                Nofollow Links Analysis
                              </h6>
                              <div className="space-y-2 rounded-lg border p-3">
                                <div className="flex justify-between">
                                  <span className="text-sm">
                                    Nofollow Links Found:
                                  </span>
                                  <span className="font-medium text-sm">
                                    {issue.moreDetails.nofollowLinksFound}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Robots Content Analysis */}
                          {issue.moreDetails?.robotsContent !== undefined && (
                            <div className="mb-4">
                              <h6 className="mb-2 font-medium text-muted-foreground text-sm">
                                Robots Content Analysis
                              </h6>
                              <div className="space-y-2 rounded-lg border p-3">
                                <div className="text-sm">
                                  <span className="font-medium">
                                    Robots Content:
                                  </span>
                                  <div className="mt-1 rounded bg-muted p-2 font-mono text-sm">
                                    {issue.moreDetails.robotsContent ||
                                      'No robots content found'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Noindex Analysis */}
                          {issue.moreDetails?.hasNoindex !== undefined && (
                            <div className="mb-4">
                              <h6 className="mb-2 font-medium text-muted-foreground text-sm">
                                Noindex Analysis
                              </h6>
                              <div className="space-y-2 rounded-lg border p-3">
                                <div className="flex justify-between">
                                  <span className="text-sm">
                                    Noindex Directive:
                                  </span>
                                  <span className="font-medium text-sm">
                                    {issue.moreDetails.hasNoindex === null
                                      ? 'Not detected'
                                      : issue.moreDetails.hasNoindex
                                        ? 'Yes'
                                        : 'No'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* JavaScript Error Details */}
                          {(issue.moreDetails?.jsErrors !== undefined ||
                            issue.moreDetails?.criticalErrors !== undefined ||
                            issue.moreDetails?.errorDetails ||
                            issue.moreDetails?.jsError) && (
                            <div className="mb-4">
                              <h6 className="mb-2 font-medium text-muted-foreground text-sm">
                                JavaScript Error Analysis
                              </h6>
                              <div className="space-y-2 rounded-lg border p-3">
                                {/* jsError nested structure */}
                                {issue.moreDetails.jsError && (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-sm">
                                        Total JS Errors:
                                      </span>
                                      <span className="font-medium text-sm">
                                        {issue.moreDetails.jsError.jsErrors ||
                                          0}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm">
                                        Critical Errors:
                                      </span>
                                      <span className="font-medium text-red-600 text-sm">
                                        {issue.moreDetails.jsError
                                          .criticalErrors || 0}
                                      </span>
                                    </div>
                                    {issue.moreDetails.jsError.errorDetails &&
                                      issue.moreDetails.jsError.errorDetails
                                        .length > 0 && (
                                        <div className="mt-3">
                                          <div className="mb-2 font-medium text-muted-foreground text-xs">
                                            Error Details:
                                          </div>
                                          <div className="space-y-2">
                                            {issue.moreDetails.jsError.errorDetails.map(
                                              (
                                                error: {
                                                  type: string;
                                                  text: string;
                                                  stack: string;
                                                  timestamp: number;
                                                  category: string;
                                                  isCritical: boolean;
                                                },
                                                index: number
                                              ) => (
                                                <div
                                                  key={index}
                                                  className="rounded border-red-200 border-l-4 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950"
                                                >
                                                  <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                      <div className="flex items-center gap-2">
                                                        <span className="font-medium text-red-800 text-sm dark:text-red-200">
                                                          {error.type}
                                                        </span>
                                                        {error.isCritical && (
                                                          <span className="rounded bg-red-200 px-2 py-1 text-red-800 text-xs dark:bg-red-800 dark:text-red-200">
                                                            Critical
                                                          </span>
                                                        )}
                                                      </div>
                                                      <p className="mt-1 text-red-700 text-sm dark:text-red-300">
                                                        {error.text}
                                                      </p>
                                                      {error.stack && (
                                                        <details className="mt-2">
                                                          <summary className="cursor-pointer text-red-600 text-xs hover:text-red-800 dark:text-red-400 dark:hover:text-red-200">
                                                            View Stack Trace
                                                          </summary>
                                                          <pre className="mt-1 overflow-x-auto rounded bg-red-100 p-2 text-red-800 text-xs dark:bg-red-900 dark:text-red-200">
                                                            {error.stack}
                                                          </pre>
                                                        </details>
                                                      )}
                                                      <div className="mt-1 flex items-center gap-4 text-red-600 text-xs dark:text-red-400">
                                                        <span>
                                                          Category:{' '}
                                                          {error.category}
                                                        </span>
                                                        <span>
                                                          Time:{' '}
                                                          {new Date(
                                                            error.timestamp *
                                                              1000
                                                          ).toLocaleString()}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}
                                  </>
                                )}

                                {issue.moreDetails.jsErrors !== undefined && (
                                  <div className="flex justify-between">
                                    <span className="text-sm">
                                      Total JS Errors:
                                    </span>
                                    <span className="font-medium text-sm">
                                      {issue.moreDetails.jsErrors}
                                    </span>
                                  </div>
                                )}
                                {issue.moreDetails.criticalErrors !==
                                  undefined && (
                                  <div className="flex justify-between">
                                    <span className="text-sm">
                                      Critical Errors:
                                    </span>
                                    <span className="font-medium text-red-600 text-sm">
                                      {issue.moreDetails.criticalErrors}
                                    </span>
                                  </div>
                                )}
                                {issue.moreDetails.errorDetails &&
                                  issue.moreDetails.errorDetails.length > 0 && (
                                    <div className="mt-3">
                                      <div className="mb-2 font-medium text-muted-foreground text-xs">
                                        Error Details:
                                      </div>
                                      <div className="space-y-2">
                                        {issue.moreDetails.errorDetails.map(
                                          (error, index) => (
                                            <div
                                              key={index}
                                              className="rounded border-red-200 border-l-4 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950"
                                            >
                                              <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                  <div className="flex items-center gap-2">
                                                    <span className="font-medium text-red-800 text-sm dark:text-red-200">
                                                      {error.type}
                                                    </span>
                                                    {error.isCritical && (
                                                      <span className="rounded bg-red-200 px-2 py-1 text-red-800 text-xs dark:bg-red-800 dark:text-red-200">
                                                        Critical
                                                      </span>
                                                    )}
                                                  </div>
                                                  <p className="mt-1 text-red-700 text-sm dark:text-red-300">
                                                    {error.text}
                                                  </p>
                                                  {error.stack && (
                                                    <details className="mt-2">
                                                      <summary className="cursor-pointer text-red-600 text-xs hover:text-red-800 dark:text-red-400 dark:hover:text-red-200">
                                                        View Stack Trace
                                                      </summary>
                                                      <pre className="mt-1 overflow-x-auto rounded bg-red-100 p-2 text-red-800 text-xs dark:bg-red-900 dark:text-red-200">
                                                        {error.stack}
                                                      </pre>
                                                    </details>
                                                  )}
                                                  <div className="mt-1 flex items-center gap-4 text-red-600 text-xs dark:text-red-400">
                                                    <span>
                                                      Category: {error.category}
                                                    </span>
                                                    <span>
                                                      Time:{' '}
                                                      {new Date(
                                                        error.timestamp * 1000
                                                      ).toLocaleString()}
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Recommendation */}
                      {issue.recommendation &&
                        issue.recommendation !== issue.description && (
                          <div className="pt-2">
                            <div className="mb-2 flex items-center space-x-2">
                              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                              <h6 className="font-semibold text-sm">
                                Recommendation
                              </h6>
                            </div>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {issue.recommendation}
                            </p>
                          </div>
                        )}

                      {/* Learn More */}
                      {issue.learnMoreUrl && (
                        <div className="pt-2">
                          <a
                            href={issue.learnMoreUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 font-medium text-primary text-sm hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>Learn more about this issue</span>
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
