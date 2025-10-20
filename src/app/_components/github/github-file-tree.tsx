'use client';

import { Checkbox } from '@/app/_components/ui/checkbox';
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  File01Icon,
  Folder01Icon,
} from 'hugeicons-react';
import { useEffect, useState } from 'react';

export type FileTreeNode = {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileTreeNode[];
  size?: number;
};

type GitHubFileTreeProps = {
  nodes: FileTreeNode[];
  selectedFiles: string[];
  onToggleFile: (path: string) => void;
  onToggleFolder: (path: string) => void;
  isFolderSelected: (path: string) => boolean;
  isFolderPartiallySelected: (path: string) => boolean;
  depth?: number;
};

export function GitHubFileTree({
  nodes,
  selectedFiles,
  onToggleFile,
  onToggleFolder,
  isFolderSelected,
  isFolderPartiallySelected,
  depth = 0,
}: GitHubFileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );

  console.log('GitHubFileTree - nodes:', nodes);
  console.log('GitHubFileTree - selectedFiles:', selectedFiles);
  console.log('GitHubFileTree - depth:', depth);

  // auto-expand folders that contain selected files
  useEffect(() => {
    const foldersToExpand = new Set<string>();

    for (const filePath of selectedFiles) {
      // get all parent folder paths for this file
      const parts = filePath.split('/');
      let currentPath = '';

      // build path for each parent folder
      for (let i = 0; i < parts.length - 1; i++) {
        currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
        foldersToExpand.add(currentPath);
      }
    }

    if (foldersToExpand.size > 0) {
      setExpandedFolders((prev) => new Set([...prev, ...foldersToExpand]));
    }
  }, [selectedFiles]);

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  return (
    <div className="p-2">
      {nodes.map((node) => (
        <div key={node.path}>
          {node.type === 'folder' ? (
            <>
              <div
                className="flex items-center space-x-2 rounded-md p-2 hover:bg-muted"
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
              >
                <Checkbox
                  checked={
                    isFolderSelected(node.path)
                      ? true
                      : isFolderPartiallySelected(node.path)
                        ? 'indeterminate'
                        : false
                  }
                  onCheckedChange={() => onToggleFolder(node.path)}
                />
                <button
                  type="button"
                  onClick={() => toggleFolder(node.path)}
                  className="flex flex-1 items-center space-x-2"
                >
                  <Folder01Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{node.name}</span>
                  {expandedFolders.has(node.path) ? (
                    <ArrowDown01Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ArrowRight01Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
              </div>
              {expandedFolders.has(node.path) && node.children && (
                <GitHubFileTree
                  nodes={node.children}
                  selectedFiles={selectedFiles}
                  onToggleFile={onToggleFile}
                  onToggleFolder={onToggleFolder}
                  isFolderSelected={isFolderSelected}
                  isFolderPartiallySelected={isFolderPartiallySelected}
                  depth={depth + 1}
                />
              )}
            </>
          ) : (
            <div
              className="flex items-center space-x-2 rounded-md p-2 hover:bg-muted"
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
              <Checkbox
                checked={selectedFiles.includes(node.path)}
                onCheckedChange={() => onToggleFile(node.path)}
              />
              <File01Icon className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 truncate text-sm">{node.name}</span>
              {node.size !== undefined && (
                <span className="text-muted-foreground text-xs">
                  {(node.size / 1024).toFixed(1)} KB
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
