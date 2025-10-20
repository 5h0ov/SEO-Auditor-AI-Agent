import { env } from '@/env';
import { GitHubService } from '@/lib/github/octokit-client';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { createGateway } from '@ai-sdk/gateway';
import { TRPCError } from '@trpc/server';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';

const MODEL = 'anthropic/claude-sonnet-4';

/**
 * Helper: Get file extension
 */
function getFileExtension(filePath: string): string {
  const parts = filePath.split('.');
  return parts.length > 1 ? parts.at(-1) || '' : '';
}

/**
 * Helper: Generate AI prompt for SEO fixes
 */
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
  },
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

  const prompt = `You are an expert SEO developer. Fix SEO issues in this ${fileType}:

File: ${filePath}
Type: ${fileType}

${projectSummary ? `**Project Context:**\n${projectSummary}\n` : ''}

SEO Issues to Fix:
${issueDescriptions.join('\n')}

Current File Content:
\`\`\`${fileExtension}
${fileContent}
\`\`\`

**INSTRUCTIONS:**

1. **Framework-Specific Meta Tag Handling:**
   - Analyze the file and project context to determine the correct approach
   - For Next.js App Router: Use Metadata API (export const metadata = {...}) but only if the file is a layout or a "use server" component as metadata is not available in "use client" components
   - The Head component from "next/head" is designed for the Pages Router and cannot be used in App Router, especially not in client components. This code will not properly set page metadata for SEO.
   - The Metadata API is the recommended approach for App Router, but it must be used in "use server" components. DONT import if not needed.
   - For Next.js Pages Router: Use <Head> component from 'next/head'
   - For other frameworks: Follow the framework's best practices
   - CRITICAL: Match the existing patterns in the codebase and follow the techstack rules and best practices.

2. **Analyze if the file is relevant** for the issues listed
   - For meta issues: Look for <meta>, <title>, Metadata export, Head component
   - For image issues: Look for <img>, <Image>, or image components
   - If file is NOT relevant (e.g., API route, config): Return UNCHANGED

3. **Apply fixes if needed:**
   - Make ONLY necessary changes to fix identified issues
   - Preserve all other code, imports, and structure EXACTLY
   - Maintain indentation and formatting
   - Keep ALL comments (including commented-out code)
   - Do NOT add explanatory comments
   - Do NOT refactor or optimize code

4. **Image Alt Text Fixes:**
   - Add alt attributes to ALL <img> tags and <Image> components
   - CRITICAL: Analyze the surrounding code to understand the image's context
   - Look for:
     * Variable names (profilePicture, companyLogo, heroImage)
     * Component names (Header, HeroSection, ProductCard)
     * Nearby text (headings, labels, descriptions)
     * File path (header/, hero/, products/, team/)
   - Write contextually appropriate alt text:
     * In <Header>: "CompanyName Logo" not "User Avatar"
     * In <HeroSection>: "Dashboard showing analytics" not "Image"
     * In product list: "Product name - feature description" not "Photo"
     * Decorative icons: "Arrow icon" or "Checkmark icon" not "Icon"
   - Never use generic text: "Image", "Photo", "Picture", "User Avatar", "Placeholder"
   - If you cannot determine context, use: "Placeholder image" and add a comment
   - For placeholder URLs (picsum.photos, placeholder.com): Infer from context, not URL
   - SKIP SVGs or Icons as they are decorative and do not need alt text

5. **Unsafe Cross-Origin Links Fixes:**
   - Find ALL <a> tags with target="_blank" attribute
   - Add rel="noopener noreferrer" to EVERY target="_blank" link
   - Patterns to match:
     * <a href="..." target="_blank"> → <a href="..." target="_blank" rel="noopener noreferrer">
     * <a target="_blank" href="..."> → <a target="_blank" href="..." rel="noopener noreferrer">
   - If rel attribute already exists, append "noopener noreferrer":
     * <a href="..." target="_blank" rel="nofollow"> → <a href="..." target="_blank" rel="nofollow noopener noreferrer">
     * <a href="..." target="_blank" rel="external"> → <a href="..." target="_blank" rel="external noopener noreferrer">
   - Remove duplicates if already present:
     * <a href="..." target="_blank" rel="noopener noopener"> → <a href="..." target="_blank" rel="noopener noreferrer">
   - CRITICAL: Process ALL target="_blank" links, including:
     * External links (https://external.com)
     * Internal links (./page.html, /about)
     * Social media links
     * WhatsApp/phone links (wa.me, tel:)
   - Preserve all other attributes (class, id, data-*, etc.)

6. **Output format:**
   - Return ONLY the raw code (no markdown code blocks)
   - Do NOT wrap in \`\`\`
   - Start directly with code
   - No explanations before or after

Return the fixed code now:`;

  return prompt;
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
        }),
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

          const selectionPrompt = `You are an SEO analyzer. Analyze this repository and select CODE FILES that can be edited to improve SEO.

Repository: ${owner}/${repo}
Branch: ${branch}

Files:
${allFilePaths.join('\n')}

**TASK:**
1. Analyze the file structure to determine:
   - Framework (Next.js App Router, Next.js Pages Router, Vite, Gatsby, React, Vue, etc.)
   - Language (TypeScript, JavaScript)
   - Project structure (src/ folder, app/ folder, pages/ folder, components/, etc.)

2. Provide a brief project summary including:
   - Framework and specific version/routing type (e.g., "Next.js 13+ App Router", "Next.js Pages Router", "Vite + React")
   - How meta tags should be handled in THIS specific project (Metadata API, <Head> component, react-helmet, etc.)
   - Language and key technologies
   - Critical patterns to follow when editing code

3. Select ONLY 3-8 CODE FILES that can be edited for SEO:
   
   **✅ SELECT (Code files only):**
   - Layout files (root layout files): layout.tsx, layout.js, _app.tsx, _document.tsx
   - Page files (public or root or landing pages): page.tsx, page.js, index.tsx, index.html
   - Public marketing pages: about/page.tsx, pricing/page.tsx, contact/page.tsx
   - Landing page components: components/landing/, components/hero/, or others
   
   **❌ NEVER SELECT (Cannot be edited for SEO):**
   - Image files: .png, .jpg, .jpeg, .gif, .webp, .svg, .ico
   - Font files: .woff, .woff2, .ttf, .otf
   - Data files: .json, .xml, .csv
   - Config files: package.json, tsconfig.json, next.config.*, vite.config.*
   - API routes: api/, route.ts, +server.ts
   - Auth/dashboard pages: dashboard/, auth/, admin/, settings/, login/, register/, etc.
   - Test files: .test.ts, .spec.ts, __tests__/
   - Utility files: utils/, lib/, helpers/
   - Build files: .next/, dist/, build/
   - robots.txt, sitemap.xml, .env files

Return JSON with selectedFiles array (CODE FILES ONLY) and projectSummary:`;

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

        // Create new branch
        const timestamp = Date.now();
        const newBranchName = `seo-fixes-${timestamp}`;

        console.log('[SEO-FIXES] Creating branch:', newBranchName);
        await githubService.createBranch(owner, repo, newBranchName, branch);

        // Process files
        let filesModified = 0;
        const errors: string[] = [];

        for (const [index, filePath] of filesToProcess.entries()) {
          console.log(
            `[SEO-FIXES] Processing ${index + 1}/${filesToProcess.length}: ${filePath}`
          );

          try {
            // Get file content
            const fileData = await githubService.getFileContent(
              owner,
              repo,
              filePath,
              branch
            );

            // Generate fix with AI
            const fixPrompt = generateFixPrompt(
              fileData.content,
              filePath,
              seoIssues,
              projectSummary // Pass AI-generated project summary
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

            // Only update if content changed
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

        // Create pull request
        console.log('[SEO-FIXES] Creating pull request...');

        const prBody = `## Automated SEO Fixes

This PR contains automated fixes for SEO issues.

**Files modified:** ${filesModified}

**Issues addressed:**
${seoIssues.metaTitle ? '- ✅ Meta Title optimization\n' : ''}${seoIssues.metaDescription ? '- ✅ Meta Description optimization\n' : ''}${seoIssues.imageAlt ? `- ✅ Image Alt Text (${seoIssues.imageAlt.missingAlt} images fixed)\n` : ''}${seoIssues.unsafeCrossOriginLinks?.status !== 'pass' ? `- ✅ Unsafe Cross-Origin Links (${seoIssues.unsafeCrossOriginLinks?.unsafeTargetBlankLinks} links secured)\n` : ''}

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

