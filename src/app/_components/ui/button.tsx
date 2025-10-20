import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-medium text-sm transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'rounded-3xl border border-primary/20 bg-gradient-to-b from-primary to-primary/95 text-primary-foreground shadow-lg shadow-primary/25 hover:from-primary/95 hover:to-primary/90 hover:shadow-primary/30 hover:shadow-xl',
        destructive:
          'rounded-3xl bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'rounded-3xl border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        success:
          'rounded-3xl border border-green-600/80 bg-green-600/90 text-white shadow-sm hover:bg-green-600/80 dark:border-green-800/80 dark:bg-green-800/60 dark:hover:bg-green-800/80',
        outlineDefault:
          "border bg-transparent text-muted-foreground placeholder:text-muted-foreground",
        secondary:
          'rounded-3xl border border-secondary/20 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'rounded-3xl hover:bg-accent hover:text-accent-foreground',
        link: 'rounded-3xl text-primary underline-offset-4 hover:underline',
        linkColored:
          'rounded-3xl text-primary text-sm underline-offset-4 hover:text-primary/90 hover:underline',
        reverse:
          'rounded-3xl bg-primary/80 text-white hover:bg-primary/90 dark:bg-white dark:text-black dark:hover:bg-white/90',
      },
      size: {
        default: 'h-10 px-6 py-2.5',
        sm: 'h-8 rounded-2xl px-4 text-xs',
        lg: 'h-12 rounded-3xl px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
