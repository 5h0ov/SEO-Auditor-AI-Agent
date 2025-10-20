'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/app/_components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/_components/ui/dialog';
import { Input } from '@/app/_components/ui/input';
import { Label } from '@/app/_components/ui/label';
import { ScrollArea } from '@/app/_components/ui/scroll-area';
import { Switch } from '@/app/_components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/_components/ui/select';
import { useGitHubApi } from '@/hooks/use-github-api';
import { GitHubFileTree, type FileTreeNode } from './github-file-tree';
import { Search01Icon, File01Icon, Loading03Icon } from 'hugeicons-react';

interface GitHubFileManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repositoryFullName: string;
  selectedBranch?: string;
  selectedFiles: string[];
  autoSelectFiles?: boolean;
  onSave: (branch: string, files: string[], autoSelectFiles: boolean) => void;
  isSaving: boolean;
}

export function GitHubFileManagerDialog({
  open,
  onOpenChange,
  repositoryFullName,
  selectedBranch: initialSelectedBranch,
  selectedFiles: initialSelectedFiles,
  autoSelectFiles: initialAutoSelectFiles,
  onSave,
  isSaving,
}: GitHubFileManagerDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>(
    initialSelectedBranch
  );
  const [selectedFiles, setSelectedFiles] = useState<string[]>(
    initialSelectedFiles || []
  );
  const [autoSelectFiles, setAutoSelectFiles] = useState(
    initialAutoSelectFiles ?? true
  );

  const {
    branches,
    files,
    getBranches,
    getFiles,
    selectBranch,
    selectFiles,
    isLoadingBranches,
    isLoadingFiles,
    integration,
  } = useGitHubApi();

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedFiles(initialSelectedFiles || []);
      setSelectedBranch(initialSelectedBranch);
      setAutoSelectFiles(initialAutoSelectFiles ?? true);
      setSearchQuery('');
    }
  }, [open, initialSelectedBranch, initialSelectedFiles, initialAutoSelectFiles]);

  useEffect(() => {
    if (open && repositoryFullName) {
      const [owner, repo] = repositoryFullName.split('/');

      // Fetch branches if not already loaded
      if (branches.length === 0) {
        getBranches(owner, repo);
      }

      // Fetch files if branch is selected
      if (selectedBranch) {
        getFiles(owner, repo, selectedBranch);
      }
    }
  }, [open, repositoryFullName, selectedBranch]);

  // Track if there are unsaved changes
  const hasChanges = useMemo(() => {
    const branchChanged = selectedBranch !== initialSelectedBranch;
    const autoSelectChanged = autoSelectFiles !== (initialAutoSelectFiles ?? true);

    if (autoSelectFiles) {
      // auto-select mode: enable if branch or auto-select setting changed
      return branchChanged || autoSelectChanged;
    }

    // manual mode: must have at least one file selected
    if (selectedFiles.length === 0) {
      return false; // Disable save if no files selected, even if branch changed
    }

    const filesChanged =
      JSON.stringify([...selectedFiles].sort()) !==
      JSON.stringify([...(initialSelectedFiles || [])].sort());

    // enable if branch changed OR files changed OR auto-select setting changed
    return branchChanged || filesChanged || autoSelectChanged;
  }, [
    selectedBranch,
    initialSelectedBranch,
    selectedFiles,
    initialSelectedFiles,
    autoSelectFiles,
    initialAutoSelectFiles,
  ]);

  const handleBranchChange = async (branchName: string) => {
    setSelectedBranch(branchName);
    if (repositoryFullName) {
      const [owner, repo] = repositoryFullName.split('/');
      await getFiles(owner, repo, branchName);
    }
  };

  const handleFileToggle = (filePath: string, checked: boolean) => {
    if (checked) {
      setSelectedFiles([...selectedFiles, filePath]);
    } else {
      setSelectedFiles(selectedFiles.filter(f => f !== filePath));
    }
  };

  const handleSave = () => {
    if (!selectedBranch) return;
    // save branch, files (if manual), and auto-select setting together
    // If autoSelectFiles is true, pass empty array (AI will auto-select)
    onSave(selectedBranch, autoSelectFiles ? [] : selectedFiles, autoSelectFiles);
  };

  const filteredFiles = files?.filter(file =>
    file.path.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Convert flat file list to tree structure
  const buildFileTree = (files: any[]): FileTreeNode[] => {
    const tree: { [key: string]: FileTreeNode } = {};
    const root: FileTreeNode[] = [];

    // Create nodes for all files and folders
    files.forEach(file => {
      const pathParts = file.path.split('/');
      let currentPath = '';

      pathParts.forEach((part: string, index: number) => {
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!tree[currentPath]) {
          const isFile = index === pathParts.length - 1;
          tree[currentPath] = {
            name: part,
            path: currentPath,
            type: isFile ? 'file' : 'folder',
            size: isFile ? file.size : undefined,
            children: isFile ? undefined : []
          };

          // Add to parent or root
          if (parentPath && tree[parentPath]) {
            if (!tree[parentPath].children) {
              tree[parentPath].children = [];
            }
            tree[parentPath].children!.push(tree[currentPath]);
          } else if (!parentPath) {
            root.push(tree[currentPath]);
          }
        }
      });
    });

    return root;
  };

  const fileTree = buildFileTree(filteredFiles);

  // Tree helper functions
  const isFolderSelected = (path: string): boolean => {
    if (!files) return false;

    // Get ALL files in this folder (recursively, including subfolders)
    const filesInFolder = files.filter((f) => f.path.startsWith(`${path}/`));

    if (filesInFolder.length === 0) return false;

    return filesInFolder.every((f) => selectedFiles.includes(f.path));
  };

  const isFolderPartiallySelected = (path: string): boolean => {
    if (!files) return false;

    // Get ALL files in this folder (recursively, including subfolders)
    const filesInFolder = files.filter((f) => f.path.startsWith(`${path}/`));

    if (filesInFolder.length === 0) return false;

    const selectedCount = filesInFolder.filter((f) =>
      selectedFiles.includes(f.path)
    ).length;

    return selectedCount > 0 && selectedCount < filesInFolder.length;
  };

  const handleToggleFile = (path: string) => {
    setSelectedFiles(prev =>
      prev.includes(path)
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  const handleToggleFolder = (path: string) => {
    if (!files) return;

    // Get ALL files in this folder (recursively, including subfolders)
    const filesInFolder = files
      .filter((f) => f.path.startsWith(`${path}/`))
      .map((f) => f.path);

    const allSelected = filesInFolder.every((f) => selectedFiles.includes(f));

    if (allSelected) {
      // Deselect all files in folder
      setSelectedFiles((prev) =>
        prev.filter((f) => !filesInFolder.includes(f))
      );
    } else {
      // Select all files in folder
      setSelectedFiles((prev) => {
        const newSelection = new Set([...prev, ...filesInFolder]);
        return Array.from(newSelection);
      });
    }
  };

  // Debug logging
  console.log('FileManager - selectedBranch:', selectedBranch);
  console.log('FileManager - files:', files);
  console.log('FileManager - filteredFiles:', filteredFiles);
  console.log('FileManager - fileTree:', fileTree);
  console.log('FileManager - selectedFiles:', selectedFiles);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Files to Fix</DialogTitle>
          <DialogDescription>
            Choose which files to include in the SEO fixes for {repositoryFullName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="branch-select">Select Branch</Label>
            <Select
              value={selectedBranch ? isLoadingBranches ? 'loading' : selectedBranch : 'No Branches Found'}
              onValueChange={handleBranchChange}
              disabled={isLoadingBranches}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    isLoadingBranches ? 'Loading branches...' : 'Select a branch...'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {isLoadingBranches ? (
                  <SelectItem value="loading" disabled>
                    <div className="flex items-center text-muted-foreground">
                      <Loading03Icon className="mr-2 h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading branches...</span>
                    </div>
                  </SelectItem>
                ) : branches && branches.length > 0 ? (
                  branches.map((branch) => (
                    <SelectItem key={branch.name} value={branch.name}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{branch.name}</span>
                        {branch.protected && (
                          <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            Protected
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-branches" disabled>
                    <div className="flex items-center text-muted-foreground">
                      <span className="text-sm">No branches found</span>
                    </div>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {selectedBranch && (
              <p className="text-sm text-muted-foreground">
                Currently selected: <span className="font-medium">{selectedBranch}</span>
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="auto-select"
              checked={autoSelectFiles}
              onCheckedChange={setAutoSelectFiles}
            />
            <Label htmlFor="auto-select">
              AI Auto-Select Files
            </Label>
          </div>

          {!autoSelectFiles && selectedBranch && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search01Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedFiles.length} selected
                </div>
              </div>

              <ScrollArea className="h-[300px] border rounded-md">
                {isLoadingFiles ? (
                  <div className="flex items-center justify-center py-8">
                    <Loading03Icon className="h-6 w-6 animate-spin mr-2" />
                    Loading files...
                  </div>
                ) : fileTree.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No files found
                  </div>
                ) : (
                  <GitHubFileTree
                    nodes={fileTree}
                    selectedFiles={selectedFiles}
                    onToggleFile={handleToggleFile}
                    onToggleFolder={handleToggleFolder}
                    isFolderSelected={isFolderSelected}
                    isFolderPartiallySelected={isFolderPartiallySelected}
                  />
                )}
              </ScrollArea>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="text-background"
            >
              {isSaving ? (
                <>
                  <Loading03Icon className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Selection'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}