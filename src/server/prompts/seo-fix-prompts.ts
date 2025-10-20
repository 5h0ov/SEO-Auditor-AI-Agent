interface FileSelectionParams {
   owner: string;
   repo: string;
   branch: string;
   allFilePaths: string[];
}

interface FixGenerationParams {
   fileType: string;
   filePath: string;
   fileExtension: string;
   projectSummary?: string;
   issueDescriptions: string[];
   fileContent: string;
}

export function generateFileSelectionPrompt({
   owner,
   repo,
   branch,
   allFilePaths,
}: FileSelectionParams): string {
   return `You are an SEO analyzer. Analyze this repository and select CODE FILES that can be edited to improve SEO.

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
}

export function generateFixPrompt({
   fileType,
   filePath,
   fileExtension,
   projectSummary,
   issueDescriptions,
   fileContent,
}: FixGenerationParams): string {
   return `You are an expert SEO developer. Fix SEO issues in this ${fileType}:

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

⚠️ **CRITICAL: DO NOT CREATE NEW CONTENT OR ELEMENTS**
- Only modify EXISTING text in EXISTING elements
- Do NOT add new divs, sections, headings, or any HTML elements
- Maintain the project's actual description and purpose
- Be selective with keywords - skip irrelevant/generic ones

1. **Framework-Specific Meta Tag Handling:**
   - Analyze the file and project context to determine the correct approach
   - For Next.js App Router: Use Metadata API (export const metadata = {...}) but only if the file is a layout or a "use server" component as metadata is not available in "use client" components
   - The Head component from "next/head" is designed for the Pages Router and cannot be used in App Router, especially not in client components. This code will not properly set page metadata for SEO.
   - The Metadata API is the recommended approach for App Router, but it must be used in "use server" components. DONT import if not needed.
   - For Next.js Pages Router: Use <Head> component from 'next/head'
   - For other frameworks: Follow the framework's best practices
   - CRITICAL: Match the existing patterns in the codebase and follow the techstack rules and best practices.

2. **Analyze if the file is relevant** for the issues listed
   - For meta issues (title, description, canonical): Look for <meta>, <title>, <link>, Metadata export, Head component
   - For image issues: Look for <img>, <Image>, or image components
   - For keyword usage: Optimize meta title, description, and heading tags (H1, H2, H3)
   - If file is NOT relevant (e.g., API route for image issues): Return UNCHANGED

3. **Apply fixes if needed:**
   - Make ONLY necessary changes to fix identified issues
   - ONLY modify EXISTING elements - do NOT create new HTML elements, sections, or divs
   - Preserve all other code, imports, and structure EXACTLY
   - Maintain indentation and formatting
   - Keep ALL comments (including commented-out code)
   - Do NOT add explanatory comments
   - Do NOT refactor or optimize code
   - Do NOT add new content or sections to force keywords in

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

6. **Canonical URL Fixes:**
   - Add canonical link tag to specify the preferred version of the page
   - CRITICAL: Use the website URL provided in the issue description, do NOT hallucinate URLs
   - For Next.js App Router (layout/page files): Add to metadata export
     * export const metadata = { alternates: { canonical: '[use-provided-website-url]' } }
   - For Next.js Pages Router: Add to <Head> component
     * <link rel="canonical" href="[use-provided-website-url]" />
   - For HTML files: Add to <head> section
     * <link rel="canonical" href="[use-provided-website-url]" />
   - The canonical should point to the exact URL provided in the issue description

7. **Keyword Usage Optimization:**
   - Be SELECTIVE: Only optimize RELEVANT keywords (skip generic words like "login", "get", "started")
   - ONLY modify EXISTING elements - do NOT create new HTML elements
   - DO NOT add new divs, sections, headings, or any new content
   - For meta title: Enhance existing title with relevant keywords (50-60 chars)
   - For meta description: Enhance existing description with relevant keywords (150-160 chars)
   - For headings: ONLY modify text in existing H1, H2, H3 tags - do NOT create new ones
   - If a keyword doesn't fit naturally or isn't relevant to the project, SKIP it
   - Quality and natural language > forcing all keywords
   - Maintain the project's actual description and purpose
   - If no existing elements can be naturally enhanced, leave them UNCHANGED

8. **Output format:**
   - Return ONLY the raw code (no markdown code blocks)
   - Do NOT wrap in \`\`\`
   - Start directly with code
   - No explanations before or after

Return the fixed code now:`;
}

