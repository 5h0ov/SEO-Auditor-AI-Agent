import { Badge } from '@/app/_components/ui/badge';
import { Card, CardContent, CardHeader } from '@/app/_components/ui/card';
import type { SeoCategory } from '@/lib/types/website-audit';
import { Link01Icon } from 'hugeicons-react';

type Issue = {
  key: string;
  severity: 'high' | 'medium' | 'low';
  recommendation: string;
  label: string;
  status?: string;
  note?: string;
  description?: string;
};

interface IssuesToFixCardProps {
  categories: Record<string, SeoCategory>;
}

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

const getSeverityPriority = (severity: string) => {
  switch (severity) {
    case 'high':
      return 3;
    case 'medium':
      return 2;
    case 'low':
      return 1;
    default:
      return 0;
  }
};

const getDisplayText = (issue: {
  recommendation?: string;
  statusText?: string;
  note?: string;
  description?: string;
}) => {
  if (issue.recommendation) { return issue.recommendation; }
  if (issue.statusText) { return issue.statusText; }
  if (issue.note) { return issue.note; }
  if (issue.description) { return issue.description; }
  return 'No details available';
};

export function IssuesToFixCard({ categories }: IssuesToFixCardProps) {
  // Flatten all failed issues
  const failedIssues: Issue[] = [];

  for (const [_, cat] of Object.entries(categories)) {
    for (const issue of cat.issues) {
      if (issue.status === 'fail') {
        failedIssues.push({
          key: issue.title.replace(/\s+/g, ''),
          severity: issue.severity,
          recommendation: issue.recommendation,
          label: issue.title,
          status: issue.status,
          note: issue.note,
          description: issue.description,
        });
      }
    }
  }

  // Sort issues by severity (high to low)
  failedIssues.sort(
    (a, b) => getSeverityPriority(b.severity) - getSeverityPriority(a.severity)
  );

  return (
    <Card className="pb-10">
      <CardHeader>
        <h3 className="text-left font-semibold text-xl">Issues to fix</h3>
      </CardHeader>
      <CardContent className="h-72 space-y-3 overflow-y-auto">
        {failedIssues.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No critical issues found!
          </div>
        ) : (
          failedIssues.map((issue, idx) => (
            <div
              key={issue.key + idx}
              className="flex items-start gap-2 border-b py-2 last:border-b-0"
            >
              <div className="flex min-w-[100px] items-center justify-center">
                {getSeverityBadge(issue.severity)}
              </div>
              <a
                href={`#${issue.key}`}
                className="mt-1"
                title={`Jump to ${issue.label}`}
              >
                <Link01Icon className="h-4 w-4 text-blue-500 hover:text-blue-700" />
              </a>
              <span>{getDisplayText(issue)}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
