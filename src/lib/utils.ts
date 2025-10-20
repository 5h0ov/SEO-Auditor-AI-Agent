import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import tldsData from '@/lib/data/tlds.json';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUrl(url: string): string {
  const trimmedUrl = url.trim();

  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    return trimmedUrl;
  }

  if (trimmedUrl.startsWith('www.')) {
    return `https://${trimmedUrl}`;
  }

  return `https://${trimmedUrl}`;
}

export function hasValidTld(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    const domain = hostname.startsWith('www.') ? hostname.substring(4) : hostname;

    const parts = domain.split('.');
    if (parts.length < 2) {
      return false;
    }

    const tld = '.' + parts[parts.length - 1].toLowerCase();

    const allTlds = [
      ...tldsData.techStartup,
      ...tldsData.countryCodes,
      ...tldsData.generic,
      ...tldsData.newGtlds,
    ];

    return allTlds.includes(tld);
  } catch {
    return false;
  }
}

export function validateAndFormatUrl(url: string): string {
  const formattedUrl = formatUrl(url);

  if (!hasValidTld(formattedUrl)) {
    throw new Error('Please enter a valid website URL with a proper domain extension (e.g., .com, .org, .io)');
  }

  return formattedUrl;
}
