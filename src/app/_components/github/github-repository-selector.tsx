'use client';

import { Button } from '@/app/_components/ui/button';
import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from '@/app/_components/ui/popover';
import { Input } from '@/app/_components/ui/input';
import { ScrollArea } from '@/app/_components/ui/scroll-area';
import { Search01Icon, Tick01Icon } from 'hugeicons-react';
import { useState } from 'react';

export type GitHubRepository = {
   id: string;
   name: string;
   full_name: string;
   description?: string | null;
   private: boolean;
   html_url: string;
   clone_url?: string;
   default_branch?: string;
   updated_at?: string;
};

interface GitHubRepositorySelectorProps {
   repositories: GitHubRepository[];
   selectedRepository?: GitHubRepository | null;
   onSelect: (repository: GitHubRepository) => void;
   disabled?: boolean;
   isLoading?: boolean;
   className?: string;
}

export function GitHubRepositorySelector({
   repositories,
   selectedRepository,
   onSelect,
   disabled = false,
   isLoading = false,
   className,
}: GitHubRepositorySelectorProps) {
   const [open, setOpen] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');

   const filteredRepositories = repositories.filter((repo) =>
      repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.name.toLowerCase().includes(searchQuery.toLowerCase())
   );

   return (
      <Popover open={open} onOpenChange={setOpen}>
         <PopoverTrigger asChild>
            <Button
               variant="outline"
               role="combobox"
               aria-expanded={open}
               className={`w-full justify-between ${className}`}
               disabled={disabled || isLoading}
            >
               {selectedRepository ? (
                  <div className="flex items-center gap-2">
                     <span className="truncate">{selectedRepository.full_name}</span>
                     {selectedRepository.private && (
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                           Private
                        </span>
                     )}
                  </div>
               ) : (
                  <span className="text-muted-foreground">
                     {isLoading ? 'Loading repositories...' : 'Select a repository...'}
                  </span>
               )}
            </Button>
         </PopoverTrigger>
         <PopoverContent className="w-[400px] p-0 bg-muted" align="start">
            <div className="p-3 border-b">
               <div className="relative">
                  <Search01Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                     placeholder="Search repositories..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="pl-9"
                  />
               </div>
            </div>
            <ScrollArea className="h-[300px]">
               <div className="p-1">
                  {filteredRepositories.length === 0 ? (
                     <div className="py-6 text-center text-sm text-muted-foreground">
                        {searchQuery ? 'No repositories found' : 'No repositories available'}
                     </div>
                  ) : (
                     filteredRepositories.map((repo) => (
                        <div
                           key={repo.id}
                           className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer"
                           onClick={() => {
                              onSelect(repo);
                              setOpen(false);
                           }}
                        >
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                 <span className="font-medium text-sm truncate">
                                    {repo.full_name}
                                 </span>
                                 {repo.private && (
                                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                       Private
                                    </span>
                                 )}
                              </div>
                              {repo.description && (
                                 <p className="text-xs text-muted-foreground truncate mt-1">
                                    {repo.description}
                                 </p>
                              )}
                           </div>
                           {selectedRepository?.id === repo.id && (
                              <Tick01Icon className="h-4 w-4 text-primary" />
                           )}
                        </div>
                     ))
                  )}
               </div>
            </ScrollArea>
         </PopoverContent>
      </Popover>
   );
}
