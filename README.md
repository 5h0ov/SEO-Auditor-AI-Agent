# SEO Auditor AI Agent

An autonomous AI agent that analyzes websites for SEO issues and automatically generates fixes via GitHub pull requests. Built with Next.js, TypeScript, tRPC and Amazon Bedrock Reasoning Models for intelligent SEO optimization.

- Demo Video: https://youtu.be/4qP-1-TqWoo
- Live URL: https://seo-auditor-ai-agent.vercel.app

## Features

### Website Analysis
- Comprehensive SEO audit covering 50+ factors
- Meta tags optimization (title, description)
- Image alt text analysis and optimization
- Technical SEO issues detection
- Mobile usability assessment
- Core Web Vitals analysis
- Security and accessibility checks

### AI-Powered Fixes
- Intelligent file selection using reasoning LLMs
- Context-aware code modifications
- Automatic SEO Issues Fixing
- Automated pull request creation
- GitHub integration with OAuth

### Supported SEO Issues
- Meta title and description optimization
- Image alt text generation
- Unsafe cross-origin links security
- Plaintext email protection
- Canonical URL implementation
- Keyword usage optimization

### Security Features
- Encrypted GitHub token storage
- Device-specific encryption using Web Crypto API
- Secure OAuth flow

## Installation

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- GitHub account
- AWS account (for Bedrock)
- AI Vercel Gateway

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/seo-auditor-ai-agent.git
cd seo-auditor-ai-agent
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Configure environment variables in `.env.local`:

```env
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

INTERNAL_API_KEY=NCxSgZyc9bKwViTf2pPurHkKQzXnAafi
INTERNAL_API_URL=https://api.kapy.in/webhook/snowseo/v2

NEXT_PUBLIC_APP_URL=http://localhost:3000

AI_GATEWAY_API_KEY=your_vercel_gateway_key
```

### GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App with:
   - Application name: SEO Auditor AI Agent
   - Homepage URL: http://localhost:3000
   - Authorization callback URL: http://localhost:3000/api/github/callback
3. Copy Client ID and generate Client Secret
4. Add to your `.env` file

### AI Agent Setup

1. Create AWS account and enable Bedrock
2. Request access to Claude models in Bedrock console
3. Create Vercel AI Gateway Account
4. Link AWS Bedrock with Vercel AI Gateway with the region, Access key ID and Secret access key

### Development

1. Start the development server:
```bash
npm run dev
# or
pnpm dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

### Production Deployment

#### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Usage

### Basic Workflow

1. **Enter Website URL**: Input the website you want to analyze
2. **Run Analysis**: Click "Audit Website" to start comprehensive SEO analysis
3. **Review Results**: Examine the detailed SEO audit results
4. **Connect GitHub**: Click "Auto-Fix with GitHub" to connect your repository
5. **Select Repository**: Choose the repository and branch for fixes
6. **Select Files**: Choose files to modify or let AI auto-select
7. **Apply Fixes**: AI will generate and apply SEO fixes automatically
8. **Review Pull Request**: Check the generated pull request with all fixes

### GitHub Integration

1. Click "Connect GitHub" to authorize the application
2. Select your repository from the list
3. Choose the target branch
4. Select files to modify or enable AI auto-selection
5. Click "Apply SEO Fixes" to generate pull request

### AI File Selection

The AI automatically selects appropriate files based on:
- File type and extension
- Project structure analysis
- SEO issue requirements
- Framework-specific patterns

## Architecture

### Frontend
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Zustand for state management
- tRPC for type-safe API calls

### Backend
- Next.js API routes
- tRPC for API layer
- GitHub API integration
- AWS Bedrock for AI capabilities
- Encrypted token storage

### AI Integration
- Amazon Bedrock with Claude 3.7 Sonnet
- Reasoning-enabled LLM for complex decisions
- Context-aware code generation
- Framework-specific optimizations

### Security
- Device-specific encryption for tokens
- Secure OAuth flow
- Protected email addresses
- No sensitive data in client-side code

## API Endpoints

### GitHub Integration
- `POST /api/github/exchange-token` - Exchange OAuth code for token
- `GET /api/github/callback` - OAuth callback handler

### SEO Analysis
- `POST /api/trpc/website-audit.analyze` - Analyze website SEO
- `POST /api/trpc/github.applySeoFixes` - Apply SEO fixes to repository

## Roadmap (Future Changes)

- Additional SEO issue types
- Enhanced security features with Database Auth
- Integrate with AWS AgentCore to make automation seamless
- Multi-language support
- Advanced customization options
- Performance optimizations
