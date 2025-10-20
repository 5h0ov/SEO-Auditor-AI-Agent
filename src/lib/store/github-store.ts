'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { encryptData, decryptData } from '@/lib/client-crypto';

export type GitHubRepository = {
  id: string;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  default_branch: string;
};

type GitHubIntegration = {
  accessToken?: string; // Encrypted
  username?: string;
  isConnected?: boolean;
  selectedRepository?: GitHubRepository;
  selectedBranch?: string;
  selectedFiles?: string[];
  autoSelectFiles?: boolean;
};

type GitHubStore = {
  integration: GitHubIntegration | null;
  setAccessToken: (token: string, username: string) => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  setSelectedRepository: (repo: GitHubRepository) => void;
  setSelectedBranch: (branch: string) => void;
  setSelectedFiles: (files: string[], autoSelect?: boolean) => void;
  disconnect: () => void;
};

export const useGitHubStore = create<GitHubStore>()(
  persist(
    (set, get) => ({
      integration: null,

      setAccessToken: async (token: string, username: string) => {
        const encryptedToken = await encryptData(token);
        set({
          integration: {
            accessToken: encryptedToken,
            username,
            isConnected: true,
          },
        });
      },

      getAccessToken: async () => {
        const { integration } = get();
        if (!integration?.accessToken) return null;

        try {
          return await decryptData(integration.accessToken);
        } catch (error) {
          console.error('Failed to decrypt access token:', error);
          return null;
        }
      },

      setSelectedRepository: (repo: GitHubRepository) => {
        set((state) => ({
          integration: {
            ...state.integration,
            selectedRepository: repo,
            selectedBranch: undefined,
            selectedFiles: [],
          },
        }));
      },

      setSelectedBranch: (branch: string) => {
        set((state) => ({
          integration: {
            ...state.integration,
            selectedBranch: branch,
            selectedFiles: [],
          },
        }));
      },

      setSelectedFiles: (files: string[], autoSelect = false) => {
        set((state) => ({
          integration: {
            ...state.integration,
            selectedFiles: files,
            autoSelectFiles: autoSelect,
          },
        }));
      },

      disconnect: () => {
        set({ integration: null });
      },
    }),
    {
      name: 'github-integration-storage',
    }
  )
);
