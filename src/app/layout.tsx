import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TRPCReactProvider } from '@/lib/trpc/react';
import { Toaster } from '@/app/_components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SEO Auditor AI Agent',
  description: 'Audit SEO of your website and automatically fix SEO issues via GitHub pull requests to your repository. Make your website more SEO Friendly on auto-pilot!',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          enableColorScheme
          disableTransitionOnChange
        >
          <TRPCReactProvider>
            {children}
            <Toaster richColors closeButton />
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
