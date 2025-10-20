'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PRResult = {
   pullRequestUrl: string;
   pullRequestNumber: number;
   branchName: string;
   baseBranch: string;
   filesFixed: number;
   repository: string;
   timestamp: string;
};

type PRStore = {
   latestPR: PRResult | null;
   setLatestPR: (pr: PRResult) => void;
   clearPR: () => void;
};

export const usePRStore = create<PRStore>()(
   persist(
      (set) => ({
         latestPR: null,
         setLatestPR: (pr) => set({ latestPR: pr }),
         clearPR: () => set({ latestPR: null }),
      }),
      {
         name: 'pr-storage',
      }
   )
);

