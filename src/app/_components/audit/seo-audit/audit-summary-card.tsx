import { Badge } from '@/app/_components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card';
import type { AuditSummaryCardProps } from '@/lib/types/website-audit';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';

export const AuditSummaryCard = ({
  auditSummary,
  websiteUrl,
}: AuditSummaryCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent':
        return 'text-green-600 dark:text-green-400';
      case 'good':
        return 'text-blue-600 dark:text-blue-400';
      case 'needs-improvement':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'poor':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent':
      case 'good':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'poor':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-500" />;
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

  const getScoreStroke = (score: number) => {
    if (score >= 90) {
      return 'stroke-green-600 dark:stroke-green-400';
    }
    if (score >= 50) {
      return 'stroke-yellow-600 dark:stroke-yellow-400';
    }
    return 'stroke-red-600 dark:stroke-red-400';
  };

  const formatWebsiteUrl = (url?: string) => {
    if (!url) return null;

    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname;
    } catch {
      return url.replace(/^https?:\/\//, '');
    }
  };

  return (
    <Card className="flex h-full flex-col justify-center">
      <CardHeader className="items-center pb-4">
        <CardTitle className="flex flex-col items-center space-x-2 pb-4">
          <div className="flex items-center space-x-2">
            {getStatusIcon(auditSummary.status)}
            <span>Audit Summary</span>
          </div>
          {websiteUrl && (
            <div className="mt-2 text-muted-foreground text-sm">
              <span className="font-medium">Website:</span>{' '}
              {formatWebsiteUrl(websiteUrl)}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-[150px] flex-grow flex-col items-center justify-center">
        <div className="flex w-full flex-grow flex-col items-center justify-center">
          <div className="relative mx-auto mb-4 h-40 w-40">
            <svg
              className="-rotate-90 h-40 w-40 transform"
              viewBox="0 0 120 120"
            >
              <title>Audit Score Progress Indicator</title>
              <circle
                cx="60"
                cy="60"
                r="48"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted-foreground/20"
              />
              <circle
                cx="60"
                cy="60"
                r="48"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={
                  2 * Math.PI * 48 -
                  (auditSummary.score / 100) * 2 * Math.PI * 48
                }
                className={`transition-all duration-1000 ease-out ${getScoreStroke(auditSummary.score)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div
                className={`font-bold text-4xl ${getScoreColor(auditSummary.score)}`}
              >
                {auditSummary.score}
              </div>
              <div className="text-base text-muted-foreground">/100</div>
            </div>
          </div>

          <Badge
            variant="secondary"
            className="mb-3 px-3 py-1.5 font-semibold text-base"
          >
            Grade {auditSummary.grade}
          </Badge>

          <p
            className={`font-semibold text-lg ${getStatusColor(auditSummary.status)}`}
          >
            {auditSummary.status === 'needs-improvement'
              ? 'Needs Improvement'
              : auditSummary.status.charAt(0).toUpperCase() + auditSummary.status.slice(1)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};


