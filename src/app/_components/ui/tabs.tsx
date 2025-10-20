'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;

const tabsListVariants = cva(
  'inline-flex items-center justify-center text-muted-foreground antialiased',
  {
    variants: {
      variant: {
        default: [
          'bg-gradient-to-b from-muted/80 to-muted',
          'border border-border/50',
          'gap-1 p-1.5',
          'rounded-xl',
          'shadow-black/5 shadow-sm',
        ].join(' '),
        minimal: ['gap-6', 'border-border/50 border-b', 'pb-0'].join(' '),
        pill: [
          'bg-muted/30',
          'gap-1 p-1.5',
          'rounded-full',
          'border border-border/30',
        ].join(' '),
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabsListVariants({ variant }), className)}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const tabsTriggerVariants = cva(
  // Base styles
  [
    'inline-flex items-center justify-center whitespace-nowrap',
    'transition-all duration-200 ease-out',
    'focus-visible:outline-none',
    'disabled:pointer-events-none disabled:opacity-40',
    'cursor-pointer',
    'active:scale-[0.98]',
  ].join(' '),
  {
    variants: {
      variant: {
        default: [
          'px-4 py-2.5',
          'font-medium text-sm tracking-wide',
          'rounded-lg',
          'text-muted-foreground/80',
          'hover:bg-muted/50 hover:text-muted-foreground',
          'focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-1',
          'data-[state=active]:bg-background data-[state=active]:text-foreground',
          'data-[state=active]:shadow-black/10 data-[state=active]:shadow-sm',
          'data-[state=active]:font-semibold',
          'data-[state=active]:tracking-normal',
          'data-[state=active]:border data-[state=active]:border-border/30',
        ].join(' '),
        minimal: [
          'px-3 py-2',
          'font-medium text-sm',
          'text-muted-foreground',
          'hover:text-foreground',
          'focus-visible:ring-2 focus-visible:ring-ring/50',
          'data-[state=active]:text-foreground',
          'data-[state=active]:font-semibold',
          'relative',
          'data-[state=active]:after:absolute data-[state=active]:after:right-0 data-[state=active]:after:bottom-0 data-[state=active]:after:left-0',
          'data-[state=active]:after:h-0.5 data-[state=active]:after:bg-foreground',
          'data-[state=active]:after:fade-in-0 data-[state=active]:after:slide-in-from-left-10 data-[state=active]:after:animate-in',
        ].join(' '),
        pill: [
          'px-5 py-2',
          'font-medium text-sm tracking-wide',
          'rounded-full',
          'text-muted-foreground',
          'hover:bg-muted/60 hover:text-foreground',
          'focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2',
          'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground',
          'data-[state=active]:font-semibold',
          'data-[state=active]:shadow-md data-[state=active]:shadow-primary/20',
        ].join(' '),
      },
      size: {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof tabsTriggerVariants> {}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant, size, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(tabsTriggerVariants({ variant, size }), className)}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const tabsContentVariants = cva(
  [
    'fade-in-0 animate-in duration-200',
    'antialiased',
    'focus-visible:rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-4',
    'data-[state=active]:fade-in-0 data-[state=active]:animate-in',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'slide-in-from-bottom-1 data-[state=active]:slide-in-from-bottom-1 mt-4',
        minimal:
          'slide-in-from-bottom-2 data-[state=active]:slide-in-from-bottom-2 mt-6',
        pill: 'slide-in-from-bottom-1 data-[state=active]:slide-in-from-bottom-1 mt-4',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface TabsContentProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>,
    VariantProps<typeof tabsContentVariants> {}

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  TabsContentProps
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(tabsContentVariants({ variant }), className)}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
