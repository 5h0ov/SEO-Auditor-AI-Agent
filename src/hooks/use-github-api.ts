'use client';

import { useState, useEffect } from 'react';
import { useGitHubStore, type GitHubRepository } from '@/lib/store/github-store';
import { api } from '@/lib/trpc/react';
import { toast } from 'sonner';

/**
 * GitHub API operations hook with state management
 * Provides methods to interact with GitHub via tRPC and manages local state
 */
export function useGitHubApi() {
  const { getAccessToken, integration, setSelectedRepository, setSelectedBranch, setSelectedFiles } = useGitHubStore();
  const utils = api.useUtils();

  // Local state for data
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [branches, setBranches] = useState<{ name: string; protected: boolean }[]>([]);
  const [files, setFiles] = useState<{ sha: string; path: string; size?: number; type?: string }[]>([]);
  const [isLoadingRepositories, setIsLoadingRepositories] = useState(false);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  /**
   * Fetch repositories from GitHub
   */
  const fetchRepositories = async (): Promise<GitHubRepository[]> => {
    try {
      setIsLoadingRepositories(true);
      const token = await getAccessToken();
      if (!token) throw new Error('No access token');

      const repos = await utils.client.github.getRepositories.query({
        accessToken: token
      });
      setRepositories(repos);
      return repos;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch repositories';
      toast.error(message);
      throw error;
    } finally {
      setIsLoadingRepositories(false);
    }
  };

  /**
   * Fetch branches for a repository
   */
  const fetchBranches = async (owner: string, repo: string) => {
    try {
      setIsLoadingBranches(true);
      const token = await getAccessToken();
      if (!token) throw new Error('No access token');

      const branchesData = await utils.client.github.getBranches.query({
        accessToken: token,
        owner,
        repo
      });
      setBranches(branchesData);
      return branchesData;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch branches';
      toast.error(message);
      throw error;
    } finally {
      setIsLoadingBranches(false);
    }
  };

  /**
   * Fetch files for a repository branch
   */
  const fetchFiles = async (owner: string, repo: string, branch: string) => {
    try {
      setIsLoadingFiles(true);
      const token = await getAccessToken();
      if (!token) throw new Error('No access token');

      const filesData = await utils.client.github.getFiles.query({
        accessToken: token,
        owner,
        repo,
        branch
      });
      setFiles(filesData);
      return filesData;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch files';
      toast.error(message);
      throw error;
    } finally {
      setIsLoadingFiles(false);
    }
  };

  /**
   * Fetch file content from repository
   */
  const getFileContent = async (owner: string, repo: string, path: string, branch?: string) => {
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('No access token');

      const fileData = await utils.client.github.getFileContent.query({
        accessToken: token,
        owner,
        repo,
        path,
        branch
      });
      return fileData;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch file content';
      toast.error(message);
      throw error;
    }
  };

  // Auto-fetch repositories when connected
  useEffect(() => {
    if (integration?.isConnected && repositories.length === 0) {
      fetchRepositories();
    }
  }, [integration?.isConnected, repositories.length]);

  return {
    // Data
    repositories,
    branches,
    files,

    // Loading states
    isLoadingRepositories,
    isLoadingBranches,
    isLoadingFiles,

    // Actions
    getRepositories: fetchRepositories,
    getBranches: fetchBranches,
    getFiles: fetchFiles,
    getFileContent,

    // Store actions
    selectRepository: setSelectedRepository,
    selectBranch: setSelectedBranch,
    selectFiles: setSelectedFiles,
    integration,
  };
}
