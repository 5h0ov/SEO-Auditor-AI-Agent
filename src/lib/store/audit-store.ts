'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TransformedWebsiteAuditResponse } from '@/lib/types/website-audit';

type AuditStore = {
   websiteUrl: string | null;
   currentAnalysis: TransformedWebsiteAuditResponse | null;
   setWebsiteUrl: (url: string) => void;
   setCurrentAnalysis: (analysis: TransformedWebsiteAuditResponse) => void;
   clearAudit: () => void;
};

export const useAuditStore = create<AuditStore>()(
   persist(
      (set) => ({
         websiteUrl: null,
         currentAnalysis: null,
         setWebsiteUrl: (url) => set({ websiteUrl: url }),
         setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
         clearAudit: () => set({ websiteUrl: null, currentAnalysis: null }),
      }),
      {
         name: 'audit-storage',
      }
   )
);

