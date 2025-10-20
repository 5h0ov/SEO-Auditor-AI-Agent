import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/app/_components/ui/chart';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/app/_components/ui/tooltip';
import type { SeoCategory } from '@/lib/types/website-audit';
import { BarChart3 } from 'lucide-react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';

interface IssuesSummaryCardProps {
  categories: {
    commonSeoIssues: SeoCategory;
    serverSecurity: SeoCategory;
    mobileUsability: SeoCategory;
    advancedSeo: SeoCategory;
  };
  overallScore: number;
}

export const IssuesSummaryCard = ({
  categories,
  overallScore,
}: IssuesSummaryCardProps) => {
  // Prepare radar chart data
  const radarChartData = [
    { category: 'Common SEO Issues', score: categories.commonSeoIssues.score },
    { category: 'Server & Security', score: categories.serverSecurity.score },
    { category: 'Mobile Usability', score: categories.mobileUsability.score },
    { category: 'Advanced SEO', score: categories.advancedSeo.score },
  ];

  // Chart config for colors
  const chartConfig = {
    'Common SEO Issues': { color: '#fbbf24', label: 'Common SEO Issues' },
    'Server & Security': { color: '#ef4444', label: 'Server & Security' },
    'Mobile Usability': { color: '#10b981', label: 'Mobile Usability' },
    'Advanced SEO': { color: '#6366f1', label: 'Advanced SEO' },
  };

  let radarColor = '#ef4444'; // red
  if (overallScore >= 90) {
    radarColor = '#10b981'; // green
  } else if (overallScore >= 50) {
    radarColor = '#fbbf24'; // yellow
  }

  const scrollToCategory = (categoryKey: string) => {
    const categoryIdMap: Record<string, string> = {
      commonSeoIssues: 'common-seo-issues',
      serverSecurity: 'server-&-security',
      mobileUsability: 'mobile-usability',
      advancedSeo: 'advanced-seo',
    };

    const elementId = categoryIdMap[categoryKey];
    if (elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>Issues Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-[4/3] max-h-[250px]"
        >
          <RadarChart
            data={radarChartData}
            margin={{ top: 10, right: 10, bottom: 40, left: 10 }}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarAngleAxis
              dataKey="category"
              tick={{ className: 'z-50 truncate', width: 120, fontSize: 11 }}
            />
            <PolarGrid />
            <Radar
              dataKey="score"
              fill={radarColor}
              fillOpacity={0.2}
              stroke={radarColor}
              strokeWidth={2}
            />
          </RadarChart>
        </ChartContainer>

        <div className="space-y-3 border-t pt-4">
          <h4 className="text-center font-medium text-muted-foreground text-sm">
            Category Performance
          </h4>
          <div className="grid grid-cols-1 gap-3 text-center md:grid-cols-2">
            {[
              { key: 'commonSeoIssues', label: 'Common SEO Issues' },
              { key: 'serverSecurity', label: 'Server & Security' },
              { key: 'mobileUsability', label: 'Mobile Usability' },
              { key: 'advancedSeo', label: 'Advanced SEO' },
            ].map(({ key, label }) => {
              const cat = categories[key as keyof typeof categories];
              return (
                <button
                  key={key}
                  className="w-full cursor-pointer space-y-1 rounded-lg p-2 text-left transition-all duration-200 hover:bg-muted/50"
                  onClick={() => scrollToCategory(key)}
                  type="button"
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-left font-medium text-sm">
                      {label}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {cat.failed > 0 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-block cursor-help rounded bg-red-100 px-1.5 text-red-700 text-xs dark:bg-red-900 dark:text-red-300">
                                  {cat.failed}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {cat.failed} check{cat.failed > 1 ? 's' : ''}{' '}
                                  failed
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {cat.warnings > 0 && (
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-block cursor-help rounded bg-yellow-100 px-1.5 text-xs text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                                  {cat.warnings}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {cat.warnings} warning
                                  {cat.warnings > 1 ? 's' : ''} found
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-block cursor-help rounded bg-green-100 px-1.5 text-green-700 text-xs dark:bg-green-900 dark:text-green-300">
                                {cat.passed}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {cat.passed} check{cat.passed > 1 ? 's' : ''}{' '}
                                passed
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <span
                        className={`font-bold text-sm ${cat.score >= 90 ? 'text-green-600 dark:text-green-400' : cat.score >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}
                      >
                        {cat.score}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        cat.score >= 90
                          ? 'bg-green-500'
                          : cat.score >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
