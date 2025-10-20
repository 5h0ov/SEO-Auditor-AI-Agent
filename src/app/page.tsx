'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/app/_components/ui/button';
import { Input } from '@/app/_components/ui/input';
import { useWebsiteAudit } from '@/hooks/use-website-audit';
import { SeoAuditResults } from '@/components/seo-audit-results';
import { GitHubIntegrationDialog } from '@/components/github-integration-dialog';
import { PRResultCard } from '@/components/pr-result-card';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuditStore } from '@/lib/store/audit-store';
import { useGitHubConnection } from '@/hooks/use-github-connection';
import { Loading03Icon } from 'hugeicons-react';
import { Globe, Zap, Github, X } from 'lucide-react';

export default function Home() {
  const {
    websiteUrl: storedUrl,
    currentAnalysis: storedAnalysis,
    setWebsiteUrl: setStoredUrl,
    setCurrentAnalysis: setStoredAnalysis
  } = useAuditStore();

  const [websiteUrl, setWebsiteUrl] = useState(storedUrl || '');
  const [showGitHubDialog, setShowGitHubDialog] = useState(false);
  const { analyzeWebsite, isAnalyzing, currentAnalysis } = useWebsiteAudit();
  const { isConnected, handleDisconnect } = useGitHubConnection();

  useEffect(() => {
    if (storedUrl) {
      setWebsiteUrl(storedUrl);
    }
  }, [storedUrl]);

  const handleAnalyze = async () => {
    if (!websiteUrl.trim()) {
      return;
    }

    try {
      setStoredUrl(websiteUrl);
      const result = await analyzeWebsite(websiteUrl);

      if (result) {
        setStoredAnalysis(result);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isAnalyzing) {
      handleAnalyze();
    }
  };

  return (
    <main className="min-h-screen">
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="container mx-auto px-4 py-16 space-y-12">

        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-5xl font-bold tracking-tight">
              SEO Auditor AI Agent
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Analyze your website's SEO and automatically fix issues via GitHub pull requests
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-transparent rounded-lg shadow-lg p-8 space-y-6">
            <div className="flex flex-col space-y-4">
              <label htmlFor="website-url" className="font-medium">
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="website-url"
                    type="url"
                    placeholder="https://example.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isAnalyzing}
                    className="pl-10 h-12 text-base rounded-full placeholder:text-muted-foreground"
                  />
                </div>
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !websiteUrl.trim()}
                  size="lg"
                  className="px-8"
                >
                  {isAnalyzing ? (
                    <>
                      <Loading03Icon className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      Audit Website
                    </>
                  )}
                </Button>
              </div>
            </div>

            {isConnected && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Github className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span>GitHub Connected!</span>
                <button
                  onClick={handleDisconnect}
                  className="text-destructive hover:text-destructive/80 underline text-xs ml-2"
                  title="Disconnect from GitHub"
                >
                  Click here to remove connection
                </button>
              </div>
            )}


          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          <PRResultCard />
        </div>

        {isAnalyzing && (
          <div className="text-center py-8">
            <Loading03Icon className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">
              Running comprehensive SEO analysis...
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              This may take 30-60 seconds
            </p>
          </div>
        )}

        {(currentAnalysis || storedAnalysis) && !isAnalyzing && (
          <div className="max-w-7xl mx-auto space-y-6">
            <SeoAuditResults
              auditData={currentAnalysis || storedAnalysis!}
              onAutoFix={() => setShowGitHubDialog(true)}
            />
          </div>
        )}

        {!currentAnalysis && !storedAnalysis && !isAnalyzing && (
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-card-foreground">Comprehensive Analysis</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Analyze 50+ SEO factors including meta tags, images, mobile usability, and advanced SEO
                </p>
              </div>

              <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-card-foreground">AI-Powered Fixes</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Automatically generate SEO fixes using AI and apply them to your repository
                </p>
              </div>

              <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <svg className="h-5 w-5 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-card-foreground">GitHub Integration</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Create pull requests with fixes directly in your GitHub repository
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <GitHubIntegrationDialog
        open={showGitHubDialog}
        onOpenChange={setShowGitHubDialog}
        websiteUrl={websiteUrl || storedUrl || ''}
        auditData={currentAnalysis || storedAnalysis}
      />
    </main>
  );
}
