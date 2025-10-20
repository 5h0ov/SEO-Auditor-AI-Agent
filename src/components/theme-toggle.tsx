'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/app/_components/ui/button';
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from '@/app/_components/ui/tooltip';

export function ThemeToggle() {
   const { theme, setTheme } = useTheme();
   const [mounted, setMounted] = useState(false);

   useEffect(() => {
      setMounted(true);
   }, []);

   if (!mounted) {
      return (
         <Button
            variant="outline"
            size="icon"
            className="rounded-full h-14 w-14"
            disabled
         >
            <Sun className="h-6 w-6" />
         </Button>
      );
   }

   return (
      <TooltipProvider delayDuration={0}>
         <Tooltip>
            <TooltipTrigger asChild>
               <Button
                  variant="default"
                  size="icon"
                  className="rounded-full h-14 w-14 border shadow-md [&_svg]:size-6"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
               >
                  {theme === 'dark' ? (
                     <Sun className="h-10 w-10" />
                  ) : (
                     <Moon className="h-10 w-10" />
                  )}
                  <span className="sr-only">Toggle theme</span>
               </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
               <p>{theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}</p>
            </TooltipContent>
         </Tooltip>
      </TooltipProvider>
   );
}

