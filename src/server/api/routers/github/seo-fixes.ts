import { env } from '@/env';
import { GitHubService } from '@/lib/github/octokit-client';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { createGateway } from '@ai-sdk/gateway';
import { TRPCError } from '@trpc/server';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import {
  generateFileSelectionPrompt,
  generateFixPrompt as generateFixPromptTemplate,
} from '@/server/prompts/seo-fix-prompts';

const MODEL = 'anthropic/claude-sonnet-4';

/**
 * Helper: Get file extension
 */
function getFileExtension(filePath: string): string {
  const parts = filePath.split('.');
  return parts.length > 1 ? parts.at(-1) || '' : '';
}

function generateFixPrompt(
  fileContent: string,
  filePath: string,
  seoIssues: {
    metaTitle?: { text?: string; length?: number; recommendation?: string };
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
  },
  websiteUrl?: string,
  projectSummary?: string
) {
  const issueDescriptions: string[] = [];
  const fileExtension = getFileExtension(filePath);
  const fileType = fileExtension
    ? `${fileExtension.toUpperCase()} file`
    : 'file';

  if (seoIssues.metaTitle) {
    issueDescriptions.push(`
**Meta Title Issue:**
- Current title: "${seoIssues.metaTitle.text || 'Missing'}"
- Current length: ${seoIssues.metaTitle.length || 0} characters
- Recommendation: ${seoIssues.metaTitle.recommendation}
- Fix: Ensure the meta title is between 50-60 characters and includes relevant keywords.
`);
  }

  if (seoIssues.metaDescription) {
    issueDescriptions.push(`
**Meta Description Issue:**
- Current description: "${seoIssues.metaDescription.text || 'Missing'}"
- Current length: ${seoIssues.metaDescription.length || 0} characters
- Recommendation: ${seoIssues.metaDescription.recommendation}
- Fix: Ensure the meta description is between 150-160 characters and provides a compelling summary.
`);
  }

  if (seoIssues.imageAlt) {
    issueDescriptions.push(`
**Image Alt Text Issue:**
- Total images: ${seoIssues.imageAlt.totalImages || 0}
- Images missing alt text: ${seoIssues.imageAlt.missingAlt || 0}
- Recommendation: ${seoIssues.imageAlt.recommendation}
- Fix: Add descriptive, contextually relevant alt text to all images for accessibility and SEO.
  
**Important for Alt Text:**
- Analyze the image's context in the code (header, hero section, product card, etc.)
- Write alt text that describes what the image shows AND its purpose
- Examples:
  * Header logo: "Company Name Logo" or "Brand Logo"
  * Hero image: "Product dashboard showing analytics and reports"
  * Team photo: "Team member Jane Doe, Senior Developer"
  * Product image: "iPhone 15 Pro in titanium blue color"
  * Icon in button: "Search icon" or "Arrow pointing right"
- DO NOT use generic text like "User Avatar", "Image", "Photo", "Picture"
- Match the context: if in navigation → logo/brand, if in gallery → describe content
`);
  }

  if (seoIssues.unsafeCrossOriginLinks) {
    const status = seoIssues.unsafeCrossOriginLinks.status || '';
    const hasUnsafeLinks = !status.includes('pass') ||
      (seoIssues.unsafeCrossOriginLinks.unsafeTargetBlankLinks || 0) > 0;

    if (hasUnsafeLinks) {
      issueDescriptions.push(`
**Unsafe Cross-Origin Links Issue:**
- Status: ${seoIssues.unsafeCrossOriginLinks.status || 'Unsafe links detected'}
- Total target="_blank" links: ${seoIssues.unsafeCrossOriginLinks.totalTargetBlankLinks || 0}
- Unsafe links (missing security attributes): ${seoIssues.unsafeCrossOriginLinks.unsafeTargetBlankLinks || 0}
- Compliance rate: ${seoIssues.unsafeCrossOriginLinks.complianceRate || 0}%
- Recommendation: ${seoIssues.unsafeCrossOriginLinks.recommendation}
- Fix: Add rel="noopener noreferrer" to all links with target="_blank" for security.

**Security Risk:**
Links with target="_blank" without proper rel attributes can:
- Allow the opened page to access the window.opener object
- Enable tabnapping attacks (malicious page can redirect your site)
- Cause performance issues by sharing the same process

**How to Fix:**
- Find all <a> tags with target="_blank"
- Add rel="noopener noreferrer" attribute
- Examples:
  * BEFORE: <a href="https://example.com" target="_blank">Link</a>
  * AFTER:  <a href="https://example.com" target="_blank" rel="noopener noreferrer">Link</a>
- If the link already has rel attribute, append to it:
  * BEFORE: <a href="..." target="_blank" rel="nofollow">Link</a>
  * AFTER:  <a href="..." target="_blank" rel="nofollow noopener noreferrer">Link</a>
`);
    }
  }

  if (seoIssues.plaintextEmails) {
    const status = seoIssues.plaintextEmails.status || '';
    const hasPlaintextEmails = !status.includes('pass') ||
      status.includes('plaintext') ||
      status.includes('unencrypted') ||
      (seoIssues.plaintextEmails.plaintextEmails || 0) > 0;

    if (hasPlaintextEmails) {
      issueDescriptions.push(`
**Plaintext Email Issue:**
- Status: ${seoIssues.plaintextEmails.status || 'Plaintext emails detected'}
- Total emails: ${seoIssues.plaintextEmails.totalEmails || 0}
- Plaintext emails (unencrypted): ${seoIssues.plaintextEmails.plaintextEmails || 0}
- Compliance rate: ${seoIssues.plaintextEmails.complianceRate || 0}%
- Recommendation: ${seoIssues.plaintextEmails.recommendation}
- Fix: Replace @ with [at] in all plaintext email addresses to prevent spam harvesting.

**Security Risk:**
Plaintext email addresses can:
- Be harvested by spam bots and scrapers
- Lead to increased spam and phishing attempts
- Compromise user privacy and security
- Violate GDPR and privacy regulations

**How to Fix:**
- Replace @ symbol with [at] in all plaintext email addresses
- This prevents email harvesting while keeping emails readable
- Examples:
  * BEFORE: contact@example.com
  * AFTER:  contact[at]example.com
  * BEFORE: <a href="mailto:contact@example.com">Email Us</a>
  * AFTER:  <a href="mailto:contact[at]example.com">Email Us</a>
  * BEFORE: Email us at support@company.com
  * AFTER:  Email us at support[at]company.com
  
Do not create any other logic to obsfucate the email, only replacing @ with [at] and note this is only for emails, dont change random @'s in the code.
`);
    }
  }

  if (seoIssues.canonicalUrl) {
    const status = seoIssues.canonicalUrl.status || '';
    const needsCanonical = !status.toLowerCase().includes('properly set') &&
      !status.toLowerCase().includes('canonical url is') ||
      !seoIssues.canonicalUrl.canonicalUrl;

    if (needsCanonical) {
      issueDescriptions.push(`
**Canonical URL Issue:**
- Status: ${seoIssues.canonicalUrl.status || 'No canonical URL found'}
- Current canonical: ${seoIssues.canonicalUrl.canonicalUrl || 'None'}
- Website URL: ${websiteUrl || 'Unknown'}
- Recommendation: ${seoIssues.canonicalUrl.recommendation}
- Fix: Add a canonical tag to prevent duplicate content issues.

**Why It Matters:**
Canonical tags help search engines understand which version of a page is the preferred one:
- Prevents duplicate content penalties
- Consolidates SEO ranking signals
- Clarifies the authoritative version of a page

**How to Fix:**
IMPORTANT: Use the actual Website URL provided above (${websiteUrl}) for the canonical tag.
- For Next.js App Router (Metadata API): Add to metadata export
  * export const metadata = { 
      alternates: { 
        canonical: '${websiteUrl}' 
      } 
    }
- For Next.js Pages Router: Add to <Head> component
  * <link rel="canonical" href="${websiteUrl}" />
- For HTML: Add to <head> section
  * <link rel="canonical" href="${websiteUrl}" />
- CRITICAL: Use the exact URL provided (${websiteUrl}), do NOT make up or hallucinate URLs
- The canonical should point to the website's root or current page URL
`);
    }
  }

  if (seoIssues.keywordUsage) {
    const keywords = seoIssues.keywordUsage.keywords || {};
    const keywordsList = Object.entries(keywords);

    if (keywordsList.length > 0) {
      const missingInTitle = keywordsList.filter(([_, data]) => !data.inTitle).map(([kw]) => kw);
      const missingInDescription = keywordsList.filter(([_, data]) => !data.inMetaDescription).map(([kw]) => kw);
      const missingInHeadings = keywordsList.filter(([_, data]) => !data.inHeadings).map(([kw]) => kw);

      issueDescriptions.push(`
**Keyword Usage Optimization:**
- Status: ${seoIssues.keywordUsage.status || 'Keywords not optimally placed'}
- Recommendation: ${seoIssues.keywordUsage.recommendation || 'Optimize keyword placement in title, description, and headings'}

**Current Keyword Status:**
${keywordsList.map(([keyword, data]) =>
        `- "${keyword}": In Title: ${data.inTitle ? '✓' : '✗'}, In Meta Description: ${data.inMetaDescription ? '✓' : '✗'}, In Headings: ${data.inHeadings ? '✓' : '✗'}`
      ).join('\n')}

**IMPORTANT - Selective Keyword Optimization:**
Analyze the project context and be SELECTIVE about keyword optimization:

1. **Priority Assessment:**
   - Focus on keywords that are RELEVANT to the project's core purpose
   - SKIP generic/irrelevant keywords like "login", "started", "get", "the", etc.
   - Prioritize keywords that describe the project's main features/value proposition
   - Only optimize keywords that make sense in the project's context

2. **Meta Title Optimization (EXISTING ONLY):**
   - ONLY modify the existing meta title, do NOT create new title tags
   - Include relevant keywords naturally: ${missingInTitle.length > 0 ? missingInTitle.slice(0, 3).join(', ') : 'All keywords present'}
   - Keep title between 50-60 characters
   - Make it compelling and describe what the project actually does
   - If a keyword doesn't fit naturally, SKIP it

3. **Meta Description Optimization (EXISTING ONLY):**
   - ONLY modify the existing meta description, do NOT create new description tags
   - Include relevant keywords naturally: ${missingInDescription.length > 0 ? missingInDescription.slice(0, 3).join(', ') : 'All keywords present'}
   - Keep description between 150-160 characters
   - Describe the project accurately - don't force irrelevant keywords

4. **Heading Tags Optimization (EXISTING ONLY):**
   - ONLY modify EXISTING heading tags (H1, H2, H3)
   - DO NOT create new <div>, <section>, or heading elements
   - DO NOT add new content or sections just to include keywords
   - If the file has existing headings, enhance them with relevant keywords
   - If forcing a keyword would make the heading awkward or irrelevant, SKIP it
   - Maintain the existing structure and layout completely

**CRITICAL RULES:**
- Do NOT create new HTML elements (no new divs, sections, headings)
- Do NOT add new content sections
- ONLY modify existing text in existing elements
- Be selective: Skip keywords that don't fit the project context
- Quality over quantity: Natural language is more important than keyword stuffing
- If a file has no relevant place for keywords, return it UNCHANGED
`);
    }
  }


  return generateFixPromptTemplate({
    fileType,
    filePath,
    fileExtension,
    projectSummary,
    issueDescriptions,
    fileContent,
  });
}

export const seoFixesRouter = createTRPCRouter({
  /**
   * Apply SEO fixes to repository
   */
  applySeoFixes: publicProcedure
    .input(
      z.object({
        accessToken: z.string(),
        owner: z.string(),
        repo: z.string(),
        branch: z.string(),
        selectedFiles: z.array(z.string()).optional(),
        autoSelectFiles: z.boolean().default(false),
        seoIssues: z.object({
          metaTitle: z
            .object({
              text: z.string().optional(),
              length: z.number().optional(),
              recommendation: z.string().optional(),
            })
            .optional(),
          metaDescription: z
            .object({
              text: z.string().optional(),
              length: z.number().optional(),
              recommendation: z.string().optional(),
            })
            .optional(),
          imageAlt: z
            .object({
              totalImages: z.number().optional(),
              missingAlt: z.number().optional(),
              imagesWithMissingAlt: z.array(z.string()).optional(),
              recommendation: z.string().optional(),
            })
            .optional(),
          unsafeCrossOriginLinks: z
            .object({
              totalTargetBlankLinks: z.number().optional(),
              unsafeTargetBlankLinks: z.number().optional(),
              complianceRate: z.number().optional(),
              recommendation: z.string().optional(),
              status: z.string().optional(),
            })
            .optional(),
          plaintextEmails: z
            .object({
              totalEmails: z.number().optional(),
              plaintextEmails: z.number().optional(),
              complianceRate: z.number().optional(),
              recommendation: z.string().optional(),
              status: z.string().optional(),
            })
            .optional(),
          canonicalUrl: z
            .object({
              canonicalUrl: z.string().optional(),
              status: z.string().optional(),
              recommendation: z.string().optional(),
            })
            .optional(),
          keywordUsage: z
            .object({
              keywords: z.record(z.string(), z.object({
                inTitle: z.boolean(),
                inMetaDescription: z.boolean(),
                inHeadings: z.boolean(),
              })).optional(),
              status: z.string().optional(),
              recommendation: z.string().optional(),
            })
            .optional(),
        }),
        websiteUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const {
        accessToken,
        owner,
        repo,
        branch,
        selectedFiles,
        autoSelectFiles,
        seoIssues,
        websiteUrl,
      } = input;

      console.log('[SEO-FIXES] Starting SEO fixes process');
      console.log('[SEO-FIXES] Input:', JSON.stringify({
        owner,
        repo,
        branch,
        selectedFiles,
        autoSelectFiles,
        seoIssues,
      }, null, 2));

      try {
        // Initialize GitHub service
        const githubService = new GitHubService(accessToken);

        // Initialize AI Gateway
        const apiKey = env.AI_GATEWAY_API_KEY;
        if (!apiKey) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'AI Gateway API key not configured',
          });
        }

        const gatewayProvider = createGateway({ apiKey });

        // Get file tree for project analysis
        const treeData = await githubService.getFileTree(owner, repo, branch);
        const allFilePaths = treeData.tree
          .filter((item) => item.type === 'blob')
          .map((item) => item.path || '');

        console.log(`[SEO-FIXES] Found ${allFilePaths.length} files`);

        // Determine which files to process
        let filesToFix: string[] = [];
        let projectSummary: string | undefined;

        if (autoSelectFiles) {
          // Auto-select files using AI
          console.log('[SEO-FIXES] Auto-selecting files with AI...');

          const selectionPrompt = generateFileSelectionPrompt({
            owner,
            repo,
            branch,
            allFilePaths,
          });

          const selectionResult = await generateObject({
            model: gatewayProvider(MODEL),
            prompt: selectionPrompt,
            schema: z.object({
              selectedFiles: z
                .array(z.string())
                .describe('Array of file paths containing SEO elements'),
              projectSummary: z.string().describe('Analysis of the project: framework, routing, language, and how to handle meta tags'),
            }),
            providerOptions: {
              gateway: {
                only: ['bedrock'],
              },
              providerOptions: {
                anthropic: {
                  thinking: { type: 'enabled', budgetTokens: 12000 },
                }
              }
            },
            experimental_telemetry: { isEnabled: true },
          });

          console.log("[SEO-FIXES] Selection result provider metadata:", JSON.stringify(await selectionResult.providerMetadata, null, 2));

          if ('reasoning' in selectionResult) {
            console.log("[SEO-FIXES] AI Reasoning (File Selection):", selectionResult.reasoning);
          }

          // Filter selected files and exclude non-code files
          const nonCodeExtensions = [
            '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico',
            '.woff', '.woff2', '.ttf', '.otf',
            '.mp4', '.webm', '.mov',
            '.pdf', '.zip', '.tar', '.gz'
          ];

          filesToFix = selectionResult.object.selectedFiles.filter((path) => {
            const isValidPath = allFilePaths.includes(path);
            const isNonCodeFile = nonCodeExtensions.some(ext => path.toLowerCase().endsWith(ext));
            return isValidPath && !isNonCodeFile;
          });

          projectSummary = selectionResult.object.projectSummary;

          console.log(`[SEO-FIXES] AI selected ${selectionResult.object.selectedFiles.length} files, filtered to ${filesToFix.length} code files: ${filesToFix.join('\n')}`);
          console.log(`[SEO-FIXES] Project Summary:`, projectSummary);
        } else {
          // Use manually selected files
          if (!selectedFiles?.length) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'No files selected',
            });
          }
          filesToFix = selectedFiles;
          console.log(`[SEO-FIXES] Using ${filesToFix.length} manual selections`);
        }

        // Filter out robots/sitemap files
        const filesToProcess = filesToFix.filter((filePath) => {
          const fileName = (filePath.split('/').pop() || '').toLowerCase();
          return !(
            fileName.startsWith('robots.') || fileName.startsWith('sitemap.')
          );
        });

        if (filesToProcess.length === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'No valid files to process',
          });
        }

        const timestamp = Date.now();
        const newBranchName = `seo-fixes-${timestamp}`;

        console.log('[SEO-FIXES] Creating branch:', newBranchName);
        await githubService.createBranch(owner, repo, newBranchName, branch);

        let filesModified = 0;
        const errors: string[] = [];

        for (const [index, filePath] of filesToProcess.entries()) {
          console.log(
            `[SEO-FIXES] Processing ${index + 1}/${filesToProcess.length}: ${filePath}`
          );

          try {
            const fileData = await githubService.getFileContent(
              owner,
              repo,
              filePath,
              branch
            );

            const fixPrompt = generateFixPrompt(
              fileData.content,
              filePath,
              seoIssues,
              websiteUrl,
              projectSummary
            );

            console.log(`[SEO-FIXES] Generating fix for ${filePath}...`);

            const fixResult = await generateText({
              model: gatewayProvider(MODEL),
              prompt: fixPrompt,
              providerOptions: {
                gateway: {
                  only: ['bedrock'],
                },
                bedrock: {
                  reasoningConfig: { type: 'enabled', budgetTokens: 12000 },
                },
                providerOptions: {
                  anthropic: {
                    thinking: { type: 'enabled', budgetTokens: 12000 },
                  }
                }
              },
              experimental_telemetry: { isEnabled: true },
            });

            console.log("[SEO-FIXES] Fix result provider metadata:", JSON.stringify(await fixResult.providerMetadata, null, 2));

            if (fixResult.reasoning) {
              console.log(`[SEO-FIXES] AI Reasoning (${filePath}):`, fixResult.reasoning);
            }

            let fixedContent = fixResult.text.trim();

            if (fixedContent.startsWith('```')) {
              const lines = fixedContent.split('\n');
              lines.shift();
              if (lines[lines.length - 1]?.trim() === '```') {
                lines.pop();
              }
              fixedContent = lines.join('\n');
            }

            // only update if content changed
            if (fixedContent !== fileData.content) {
              console.log(`[SEO-FIXES] Updating ${filePath}...`);

              await githubService.updateFileContent(
                owner,
                repo,
                filePath,
                fixedContent,
                `SEO fix: ${filePath}`,
                fileData.sha,
                newBranchName
              );

              filesModified++;
            } else {
              console.log(`[SEO-FIXES] No changes needed for ${filePath}`);
            }
          } catch (error) {
            console.error(`[SEO-FIXES] Error processing ${filePath}:`, error);
            errors.push(`${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }

        if (filesModified === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'No SEO issues found in the selected files',
          });
        }

        console.log('[SEO-FIXES] Creating pull request...');

        const prBody = `## Automated SEO Fixes

This PR contains automated fixes for SEO issues.

**Files modified:** ${filesModified}

**Issues addressed:**
${seoIssues.metaTitle ? '- ✅ Meta Title optimization\n' : ''}${seoIssues.metaDescription ? '- ✅ Meta Description optimization\n' : ''}${seoIssues.imageAlt ? `- ✅ Image Alt Text (${seoIssues.imageAlt.missingAlt} images fixed)\n` : ''}${seoIssues.unsafeCrossOriginLinks?.status !== 'pass' ? `- ✅ Unsafe Cross-Origin Links (${seoIssues.unsafeCrossOriginLinks?.unsafeTargetBlankLinks} links secured)\n` : ''}${seoIssues.plaintextEmails?.status !== 'pass' ? `- ✅ Plaintext Email Protection Applied\n` : ''}${seoIssues.canonicalUrl && (!seoIssues.canonicalUrl.status?.toLowerCase().includes('properly set')) ? '- ✅ Canonical URL added for duplicate content prevention\n' : ''}${seoIssues.keywordUsage && seoIssues.keywordUsage.keywords ? `- ✅ Keyword Usage optimization (${Object.keys(seoIssues.keywordUsage.keywords).length} keywords optimized in title, description, and headings)\n` : ''}

${errors.length > 0 ? `\n**Errors encountered:**\n${errors.map((e) => `- ${e}`).join('\n')}` : ''}`;

        const pullRequest = await githubService.createPullRequest(
          owner,
          repo,
          'SEO Fixes - Automated Optimization',
          newBranchName,
          branch,
          prBody
        );

        console.log('[SEO-FIXES] Pull request created:', pullRequest.html_url);

        return {
          success: true,
          pullRequestUrl: pullRequest.html_url,
          pullRequestNumber: pullRequest.number,
          branchName: newBranchName,
          baseBranch: branch,
          filesFixed: filesModified,
          errors: errors.length > 0 ? errors : undefined,
        };
      } catch (error) {
        console.error('[SEO-FIXES] Failed:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error ? error.message : 'Failed to apply SEO fixes',
        });
      }
    }),
});

